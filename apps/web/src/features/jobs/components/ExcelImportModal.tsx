import React, { useState } from "react";
import * as XLSX from "xlsx";
import type { ImportProductDto } from "@repo/shared";
import { Loader2, Upload, X, Check } from "lucide-react";
import { useBulkCreateJobs } from "../hooks/useBulkCreateJobs";

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

          const product: ImportProductDto = {
            title: String(title).trim(),
            dimensions: getVal(["kích thước", "dimensions"]),
            material: getVal(["chất liệu", "material"]),
            price: getVal(["giá bán", "giá", "price"]),
            carModels: getVal(["dòng xe", "models"]),
            carDetail: getVal(["chi tiết", "detail"]),
            partNumbers: getVal(["mã phụ tùng", "mã", "part number"]),
            video: getVal(["video", "youtube"]),
            shopeeLink: getVal(["shopee"]),
            lazadaLink: getVal(["lzd", "lazada"]),
            tiktokLink: getVal(["tiktok"]),
            category: "Phụ tùng ô tô",
          };

          // Kiểm tra xem dòng này có thực sự có dữ liệu kỹ thuật không
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-bottom border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Excel</h2>
            <p className="text-sm text-gray-500">
              Tải lên file Excel mẫu để đăng bài hàng loạt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {data.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center space-y-4 transition-all ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/50 scale-[1.02]"
                  : "border-gray-200 hover:border-indigo-400"
              }`}
            >
              <div className="p-4 bg-indigo-50 rounded-full">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  Kéo thả file Excel vào đây
                </p>
                <p className="text-sm text-gray-500">
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
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 cursor-pointer shadow-indigo-200 shadow-lg transition-all"
              >
                Chọn File
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
                <span className="text-indigo-700 font-medium font-sm">
                  <Check className="w-4 h-4 inline-block mr-2" />
                  Đã đọc thành công {data.length} dòng sản phẩm
                </span>
                <button
                  onClick={() => setData([])}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium"
                >
                  Tải file khác
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50 border-bottom border-gray-100">
                      <th className="p-3 text-sm font-semibold text-gray-600">
                        Tiêu đề (WP)
                      </th>
                      <th className="p-3 text-sm font-semibold text-gray-600">
                        Kích thước
                      </th>
                      <th className="p-3 text-sm font-semibold text-gray-600">
                        Giá bán
                      </th>
                      <th className="p-3 text-sm font-semibold text-gray-600">
                        Dòng xe
                      </th>
                      <th className="p-3 text-sm font-semibold text-gray-600">
                        Shopee
                      </th>
                      <th className="p-3 text-sm font-semibold text-gray-600">
                        Lazada
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-bottom border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="p-3 text-sm font-medium text-gray-900 truncate max-w-xs">
                          {row.title}
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {row.dimensions}
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {row.price}
                        </td>
                        <td className="p-3 text-sm text-gray-500 truncate max-w-xs">
                          {row.carModels}
                        </td>
                        <td className="p-3 text-sm text-gray-500 truncate max-w-xs">
                          {row.shopeeLink}
                        </td>
                        <td className="p-3 text-sm text-gray-500 truncate max-w-xs">
                          {row.lazadaLink}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 50 && (
                  <p className="p-3 text-center text-sm text-gray-400">
                    ... và {data.length - 50} sản phẩm khác
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-top border-gray-100 flex items-center justify-end space-x-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            disabled={data.length === 0 || mutation.isPending}
            onClick={handleImport}
            className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-200 shadow-xl flex items-center"
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
