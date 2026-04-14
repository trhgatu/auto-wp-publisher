import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import type { ImportProductDto } from "@repo/shared";
import {
  Loader2,
  Upload,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useBulkCreateJobs } from "../hooks/useBulkCreateJobs";
import { Table } from "../../../components/shared/Table";
import { SearchableSelect } from "../../../components/shared/SearchableSelect";
import {
  useCategories,
  useMappings,
  useUpsertMappings,
} from "../hooks/useCategories";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "upload" | "preview" | "mapping";

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>("upload");
  const [data, setData] = useState<ImportProductDto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categoryMapping, setCategoryMapping] = useState<
    Record<string, string>
  >({}); // excelValue -> wpCategoryId

  const mutation = useBulkCreateJobs();
  const upsertMappingsMutation = useUpsertMappings();

  const { data: wpCategories = [] } = useCategories();
  const { data: savedMappings = [] } = useMappings();

  const uniqueExcelCategories = useMemo(() => {
    const categories = data
      .map((d) => d.category || "")
      .filter((c) => c !== "");
    return Array.from(new Set(categories)).sort();
  }, [data]);

  const allMapped = useMemo(() => {
    if (uniqueExcelCategories.length === 0) return false;
    return uniqueExcelCategories.every((cat) => {
      const mappingId = categoryMapping[cat];
      if (!mappingId) return false;
      const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const hasDirectMatch = wpCategories.some(
        (wp) =>
          normalize(wp.name).includes(normalize(cat)) ||
          normalize(cat).includes(normalize(wp.name)),
      );
      const hasSavedMatch = savedMappings.some((m) => m.excelValue === cat);
      return hasDirectMatch || hasSavedMatch;
    });
  }, [uniqueExcelCategories, categoryMapping, wpCategories, savedMappings]);

  const categoryOptions = useMemo(
    () => wpCategories.map((c) => ({ label: c.name, value: String(c.id) })),
    [wpCategories],
  );

  if (!isOpen) return null;

  const processFile = (uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        if (!rawData || rawData.length === 0) {
          alert("File Excel trống hoặc không đúng định dạng.");
          return;
        }

        const mappedData: (ImportProductDto | null)[] = rawData.map((row) => {
          const keys = Object.keys(row);
          if (keys.length < 2) return null;

          const findKey = (possibleNames: string[]) => {
            return keys.find((k) =>
              possibleNames.some((name) =>
                k.toLowerCase().includes(name.toLowerCase()),
              ),
            );
          };

          let titleKey = findKey([
            "dòng xe",
            "tên sản phẩm",
            "tên hàng",
            "tiêu đề",
            "chi tiết dòng xe",
            "product",
            "title",
          ]);
          if (!titleKey)
            titleKey = findKey(["tên", "item", "hàng", "model", "models"]);

          let title = titleKey ? row[titleKey] : null;

          if (!title || String(title).trim() === "") {
            const h = findKey(["hãng"]);
            const d = findKey(["dòng"]);
            const m = findKey(["mã hàng"]);
            if (h && d) {
              title = `${row[h]} ${row[d]} ${m ? row[m] : ""}`;
            }
          }

          if (!title || String(title).trim() === "") return null;

          const getVal = (possibleNames: string[]) => {
            const key = findKey(possibleNames);
            return key ? String(row[key]) : "";
          };

          const brand = getVal(["hãng xe", "hãng", "brand", "hiệu"]);
          const model = getVal(["dòng xe", "model", "models", "loại xe"]);
          const partNumber = getVal([
            "mã phụ tùng",
            "mã hàng",
            "mã",
            "sku",
            "part",
          ]);
          const explicitTags = getVal(["thẻ", "tags", "tag", "nhãn"]);
          const price = getVal([
            "giá bán",
            "giá",
            "price",
            "đơn giá",
            "số tiền",
          ]);

          const category = brand || "Chưa phân loại";

          const smartTags = [brand, model, partNumber]
            .map((t) => (t ? String(t).trim() : ""))
            .filter((t) => t !== "")
            .join(", ");

          return {
            title: String(title).trim(),
            dimensions: getVal(["kích thước", "dimensions", "size"]),
            material: getVal(["chất liệu", "material", "vật liệu"]),
            price: price,
            carModels: model || getVal(["dòng xe", "models", "loại xe"]),
            carDetail: getVal([
              "chi tiết dòng xe",
              "chi tiết",
              "detail",
              "mô tả",
            ]),
            partNumbers: partNumber,
            video: getVal(["video", "youtube", "clip"]),
            shopeeLink: getVal(["shopee", "link shopee"]),
            lazadaLink: getVal(["lzd", "lazada", "link lazada"]),
            tiktokLink: getVal(["tiktok", "link tiktok"]),
            imageUrl: getVal([
              "ảnh đại diện",
              "ảnh chính",
              "ảnh",
              "image",
              "hình",
              "url",
            ]),
            galleryImageUrls: getVal([
              "thư viện ảnh",
              "thư viện",
              "gallery",
              "images",
              "danh sách ảnh",
            ]),
            category: category,
            tags: explicitTags || smartTags,
          };
        });

        const validData = mappedData.filter(
          (d): d is ImportProductDto => d !== null,
        );
        if (validData.length === 0) {
          alert("Không tìm thấy dữ liệu hợp lệ.");
        } else {
          setData(validData);
          setStep("preview");
        }
      } catch (err) {
        console.error("Error parsing excel:", err);
        alert("Lỗi đọc file Excel.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (data.length === 0) return;

    try {
      const mappingsToSave = Object.entries(categoryMapping).map(
        ([excelName, wpId]) => ({
          excelValue: excelName,
          wpCategoryId: parseInt(wpId, 10),
          wpCategoryName:
            wpCategories.find((c) => String(c.id) === wpId)?.name || "N/A",
        }),
      );

      if (mappingsToSave.length > 0) {
        await upsertMappingsMutation.mutateAsync(mappingsToSave);
      }

      const finalData = data.map((product) => ({
        ...product,
        category: categoryMapping[product.category || ""] || product.category,
      }));

      await mutation.mutateAsync(finalData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kết thúc Import.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] rounded-lg shadow-xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden transition-all border border-gray-200 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Nhập dữ liệu từ Excel
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-12 py-6 bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {[
              { id: "upload", label: "Tải tệp lên" },
              { id: "preview", label: "Xem trước" },
              { id: "mapping", label: "Ánh xạ" },
            ].map((s, idx, arr) => {
              const isActive = step === s.id;
              const isPast = arr.findIndex((item) => item.id === step) > idx;

              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all border-2",
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                          : isPast
                            ? "bg-white border-blue-600 text-blue-600"
                            : "bg-white border-gray-200 text-gray-400",
                      )}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex-1 h-[2px] mx-4 bg-gray-100 dark:bg-white/5 relative">
                      <div
                        className="absolute inset-0 bg-blue-600 transition-all duration-300"
                        style={{ width: isPast ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === "upload" && (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processFile(file);
                }}
                className={cn(
                  "w-full max-w-lg aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group",
                  isDragging
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-gray-200 hover:border-blue-400 bg-gray-50/30",
                )}
                onClick={() => document.getElementById("excel-upload")?.click()}
              >
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                />
                <div className="p-4 bg-white shadow-sm border border-gray-100 rounded-2xl group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-800 dark:text-slate-100">
                    Click hoặc kéo thả file vào đây
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hỗ trợ định dạng .xlsx, .xls (Tối đa 5MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <>
              <div className="flex-1 overflow-auto p-0 border-b border-gray-100 dark:border-white/5">
                <Table containerClassName="h-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeadCell className="min-w-[400px]">
                        Tên sản phẩm
                      </Table.HeadCell>
                      <Table.HeadCell className="w-40 text-center">
                        Mã hàng
                      </Table.HeadCell>
                      <Table.HeadCell className="w-40 text-center">
                        Giá bán
                      </Table.HeadCell>
                      <Table.HeadCell className="w-48 text-center">
                        Danh mục Excel
                      </Table.HeadCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.map((row, idx) => (
                      <Table.Row key={idx}>
                        <Table.Cell className="font-medium">
                          {row.title}
                        </Table.Cell>
                        <Table.Cell className="text-center font-mono text-xs text-gray-500">
                          {row.partNumbers}
                        </Table.Cell>
                        <Table.Cell className="text-center font-bold text-blue-600">
                          {row.price}
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {row.category}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              <div className="px-6 py-4 flex justify-end gap-3 bg-white dark:bg-transparent">
                <button
                  onClick={() => {
                    setData([]);
                    setStep("upload");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Tải tệp khác
                </button>

                {allMapped ? (
                  <button
                    onClick={handleImport}
                    disabled={
                      mutation.isPending || upsertMappingsMutation.isPending
                    }
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Tất cả đã khớp - Import ngay
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Initialize mapping when moving to the mapping step
                      // This avoids lint errors from calling setState in useEffect
                      setCategoryMapping((prev) => {
                        const next = { ...prev };
                        let hasChanges = false;
                        uniqueExcelCategories.forEach((excelCat) => {
                          if (!next[excelCat]) {
                            const saved = savedMappings.find(
                              (m) => m.excelValue === excelCat,
                            );
                            if (saved) {
                              next[excelCat] = String(saved.wpCategoryId);
                              hasChanges = true;
                            } else {
                              const normalize = (s: string) =>
                                s.toLowerCase().replace(/[^a-z0-9]/g, "");
                              const normalizedExcel = normalize(excelCat);
                              const match = wpCategories.find(
                                (wp) =>
                                  normalize(wp.name) === normalizedExcel ||
                                  normalize(wp.name).includes(
                                    normalizedExcel,
                                  ) ||
                                  normalizedExcel.includes(normalize(wp.name)),
                              );
                              if (match) {
                                next[excelCat] = String(match.id);
                                hasChanges = true;
                              } else {
                                const uncategorized = wpCategories.find(
                                  (c) =>
                                    normalize(c.name).includes(
                                      "chuaphanloai",
                                    ) || c.id === 1,
                                );
                                if (uncategorized) {
                                  next[excelCat] = String(uncategorized.id);
                                  hasChanges = true;
                                }
                              }
                            }
                          }
                        });
                        return hasChanges ? next : prev;
                      });
                      setStep("mapping");
                    }}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-all flex items-center gap-2"
                  >
                    Tiếp theo: Ánh xạ <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {step === "mapping" && (
            <>
              <div className="flex-1 overflow-auto px-12 py-8 bg-gray-50/30">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Ánh xạ danh mục</p>
                      <p>
                        Hãy chọn danh mục WordPress tương ứng cho từng nhóm sản
                        phẩm từ file Excel của bạn.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {uniqueExcelCategories.map((excelCat) => (
                      <div
                        key={excelCat}
                        className="flex items-center gap-6 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-blue-200 shadow-sm transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Danh mục Excel
                          </p>
                          <p className="text-base font-semibold text-gray-800 dark:text-slate-100">
                            {excelCat}
                          </p>
                        </div>

                        <div className="flex-shrink-0 text-gray-300">
                          <ArrowRight className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            WordPress Category
                          </p>
                          <SearchableSelect
                            options={categoryOptions}
                            value={categoryMapping[excelCat] || ""}
                            onChange={(val) =>
                              setCategoryMapping((prev) => ({
                                ...prev,
                                [excelCat]: val,
                              }))
                            }
                            placeholder="Tìm danh mục WP..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex justify-between bg-white dark:bg-transparent">
                <button
                  onClick={() => setStep("preview")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <button
                  onClick={handleImport}
                  disabled={
                    mutation.isPending || upsertMappingsMutation.isPending
                  }
                  className="px-10 py-2.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  XÁC NHẬN & IMPORT NGAY
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
