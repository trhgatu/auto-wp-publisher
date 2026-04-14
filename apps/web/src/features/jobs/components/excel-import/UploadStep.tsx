import React from "react";
import { Upload } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useImportStore } from "../../hooks/useImportStore";
import { parseExcelFile } from "../../utils/excelParser";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UploadStep: React.FC = () => {
  const { isDragging, setIsDragging, setData, setStep } = useImportStore();

  const processFile = (uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        if (!bstr) return;

        const validData = parseExcelFile(bstr);

        if (validData.length === 0) {
          alert("Không tìm thấy dữ liệu hợp lệ.");
        } else {
          setData(validData);
          setStep("preview");
        }
      } catch (err) {
        console.error("Error parsing excel:", err);
        alert(err instanceof Error ? err.message : "Lỗi đọc file Excel.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  return (
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
            ? "border-red-600 bg-red-50/50"
            : "border-gray-200 hover:border-red-400 bg-gray-50/30",
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
          <Upload className="w-8 h-8 text-red-600" />
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
  );
};
