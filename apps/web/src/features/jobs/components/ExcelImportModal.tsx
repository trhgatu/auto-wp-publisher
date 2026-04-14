import React, { useState } from "react";
import * as XLSX from "xlsx";
import type { ImportProductDto } from "@repo/shared";
import { Loader2, Upload, X, Check } from "lucide-react";
import { useBulkCreateJobs } from "../hooks/useBulkCreateJobs";
import { Table } from "../../../components/shared/Table";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [data, setData] = useState<ImportProductDto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const mutation = useBulkCreateJobs();

  if (!isOpen) return null;

  const processFile = (uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (!rawData || rawData.length === 0) {
          alert("File Excel trống hoặc không đúng định dạng.");
          return;
        }

        console.log("Raw Excel Data:", rawData);
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

          const titleKey = findKey([
            "tên",
            "tiêu đề",
            "title",
            "product",
            "item",
            "dòng xe",
            "models",
          ]);
          const title = titleKey ? row[titleKey] : null;

          if (!title || String(title).trim() === "") return null;

          const getVal = (possibleNames: string[]) => {
            const key = findKey(possibleNames);
            return key ? String(row[key]) : "";
          };

          const brand = getVal(["hãng xe", "brand"]);
          const model = getVal(["dòng xe", "model"]);
          const partNumber = getVal(["mã phụ tùng", "mã", "part number"]);
          const explicitTags = getVal(["thẻ", "tags", "tag"]);
          let category = getVal(["danh mục", "chuyên mục", "category"]);
          if (brand && model) {
            category = `${brand} > ${model}`;
          } else if (brand || model) {
            category = brand || model;
          }

          if (!category) category = "Phụ tùng ô tô";

          const smartTags = [brand, model, partNumber]
            .map((t) => t.trim())
            .filter((t) => t !== "")
            .join(", ");

          const product: ImportProductDto = {
            title: String(title).trim(),
            dimensions: getVal(["kích thước", "dimensions"]),
            material: getVal(["chất liệu", "material"]),
            price: getVal(["giá bán", "giá", "price"]),
            carModels: model || getVal(["dòng xe", "models"]),
            carDetail: getVal(["chi tiết", "detail"]),
            partNumbers: partNumber,
            video: getVal(["video", "youtube"]),
            shopeeLink: getVal(["shopee"]),
            lazadaLink: getVal(["lzd", "lazada"]),
            tiktokLink: getVal(["tiktok"]),
            imageUrl: getVal([
              "ảnh đại diện",
              "ảnh chính",
              "image",
              "avatar",
              "main image",
            ]),
            galleryImageUrls: getVal([
              "thư viện ảnh",
              "thư viện",
              "gallery",
              "images",
            ]),
            category: category,
            tags: explicitTags || smartTags,
          };

          const values = Object.values(product).filter(
            (v) => v !== "" && v !== "Phụ tùng ô tô",
          );
          if (values.length < 2) return null;

          return product;
        });

        const validData = mappedData.filter(
          (d): d is ImportProductDto => d !== null,
        );
        if (validData.length === 0) {
          alert(
            "Không tìm thấy dữ liệu sản phẩm hợp lệ trong file. Vui lòng kiểm tra lại tiêu đề cột.",
          );
        } else {
          setData(validData);
        }
      } catch (err) {
        console.error("Error parsing excel:", err);
        alert("Có lỗi xảy ra khi đọc file Excel. Vui lòng thử lại.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFile = e.dataTransfer.files?.[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    try {
      await mutation.mutateAsync(data);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi import dữ liệu hàng loạt.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Import Excel
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Tải lên file Excel mẫu để đăng bài hàng loạt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 dark:text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {data.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center space-y-4 transition-all ${isDragging
                ? "border-red-600 bg-red-50/50 dark:border-red-500 dark:bg-red-500/10 scale-[1.02]"
                : "border-gray-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500"
                }`}
            >
              <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full">
                <Upload className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-slate-200">
                  Kéo thả file Excel vào đây
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Hỗ trợ .xlsx, .xls, .csv
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                id="excel-upload"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="excel-upload"
                className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 cursor-pointer shadow-red-200 dark:shadow-red-900/20 shadow-lg transition-all"
              >
                Chọn File
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-red-50 dark:bg-red-500/10 p-4 rounded-lg">
                <span className="text-red-700 dark:text-red-400 font-medium font-sm">
                  <Check className="w-4 h-4 inline-block mr-2" />
                  Đã đọc thành công {data.length} dòng sản phẩm
                </span>
                <button
                  onClick={() => setData([])}
                  className="text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors"
                >
                  Tải file khác
                </button>
              </div>

              <Table
                className="min-w-[2000px]"
                containerClassName="border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900"
              >
                <Table.Header>
                  <Table.Row>
                    <Table.HeadCell className="w-14">Ảnh</Table.HeadCell>
                    <Table.HeadCell>Thư viện</Table.HeadCell>
                    <Table.HeadCell>Tiêu đề (WP)</Table.HeadCell>
                    <Table.HeadCell>Kích thước</Table.HeadCell>
                    <Table.HeadCell>Mã phụ tùng</Table.HeadCell>
                    <Table.HeadCell>Danh mục</Table.HeadCell>
                    <Table.HeadCell>Thẻ (Tags)</Table.HeadCell>
                    <Table.HeadCell>Chất liệu</Table.HeadCell>
                    <Table.HeadCell>Chi tiết</Table.HeadCell>
                    <Table.HeadCell>Shopee</Table.HeadCell>
                    <Table.HeadCell>Lazada</Table.HeadCell>
                    <Table.HeadCell>TikTok</Table.HeadCell>
                    <Table.HeadCell>Video</Table.HeadCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.slice(0, 50).map((row, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell>
                        {row.imageUrl && (
                          <div className="relative group/img w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <img
                              src={row.imageUrl}
                              alt="preview"
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {row.galleryImageUrls && (
                          <div className="flex items-center gap-1.5">
                            {row.galleryImageUrls
                              .split(",")
                              .slice(0, 3)
                              .map((url, i) => (
                                <div key={i} className="w-8 h-8 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs flex-shrink-0">
                                  <img
                                    src={url.trim()}
                                    alt="gallery"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            {row.galleryImageUrls.split(",").length > 3 && (
                              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                +{row.galleryImageUrls.split(",").length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[300px] uppercase text-[11px] tracking-tight whitespace-nowrap">
                        {row.title}
                      </Table.Cell>
                      <Table.Cell className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {row.dimensions}
                      </Table.Cell>
                      <Table.Cell className="text-sm text-slate-600 dark:text-slate-400">
                        {row.partNumbers}
                      </Table.Cell>
                      <Table.Cell className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        {row.category}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                          {row.tags}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-sm text-slate-500 whitespace-nowrap">
                        {row.material}
                      </Table.Cell>
                      <Table.Cell className="text-[10px] font-medium text-slate-500 truncate max-w-[150px]">
                        {row.carDetail}
                      </Table.Cell>
                      <Table.Cell className="text-[10px] font-medium text-blue-600 truncate max-w-[100px]">
                        {row.shopeeLink}
                      </Table.Cell>
                      <Table.Cell className="text-[10px] font-medium text-orange-600 truncate max-w-[100px]">
                        {row.lazadaLink}
                      </Table.Cell>
                      <Table.Cell className="text-[10px] font-medium text-pink-600 truncate max-w-[100px]">
                        {row.tiktokLink}
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        {row.video ? "✅" : ""}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              {data.length > 50 && (
                <p className="p-3 text-center text-sm text-gray-400 dark:text-slate-500">
                  ... và {data.length - 50} sản phẩm khác
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end space-x-4 bg-gray-50 dark:bg-slate-900/50 transition-colors">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            disabled={data.length === 0 || mutation.isPending}
            onClick={handleImport}
            className="px-8 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg font-bold hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-red-200 dark:shadow-red-900/30 shadow-xl flex items-center transition-all"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang đẩy lên hàng đợi...
              </>
            ) : (
              "Bắt đầu Import Hàng Loạt"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
