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
  const [gsUrl, setGsUrl] = React.useState("");
  const [pastedData, setPastedData] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"file" | "paste">("file");

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

  const handleGsImport = async () => {
    if (!gsUrl) return;

    setIsLoading(true);
    try {
      const reg = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = gsUrl.match(reg);

      if (!match) {
        throw new Error(
          "URL Google Sheets không hợp lệ. Vui lòng kiểm tra lại.",
        );
      }

      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(
          "Không thể tải dữ liệu từ Google Sheets. Hãy đảm bảo sheet đã được để ở chế độ 'Bất kỳ ai có liên kết đều có thể xem' (Public).",
        );
      }

      const csvData = await response.text();
      const validData = parseExcelFile(csvData, true);

      if (validData.length === 0) {
        alert("Không tìm thấy dữ liệu hợp lệ trong Google Sheets.");
      } else {
        setData(validData);
        setStep("preview");
      }
    } catch (err) {
      console.error("Error fetching GS:", err);
      alert(err instanceof Error ? err.message : "Lỗi khi tải Google Sheets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteImport = () => {
    if (!pastedData.trim()) return;

    try {
      // XLSX can handle tab-separated text (common for copy-paste from Sheets/Excel)
      const validData = parseExcelFile(pastedData, true);

      if (validData.length === 0) {
        alert("Dữ liệu đã dán không hợp lệ hoặc trống.");
      } else {
        setData(validData);
        setStep("preview");
      }
    } catch (err) {
      console.error("Error parsing pasted data:", err);
      alert("Lỗi khi xử lý dữ liệu dán vào. Vui lòng kiểm tra định dạng.");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-12 max-h-full overflow-y-auto">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl mb-8 w-full max-w-sm">
        <button
          onClick={() => setActiveTab("file")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === "file"
              ? "bg-white dark:bg-slate-800 text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          Tải File / Link GS
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === "paste"
              ? "bg-white dark:bg-slate-800 text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          Dán dữ liệu
        </button>
      </div>

      {activeTab === "file" ? (
        <>
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
              "w-full max-w-lg aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group mb-10",
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
                Click hoặc kéo thả file Excel vào đây
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Hỗ trợ định dạng .xlsx, .xls (Tối đa 5MB)
              </p>
            </div>
          </div>

          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Hoặc nhập link Google Sheets
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
            </div>

            <div className="flex gap-2 p-1.5 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus-within:border-red-500/50 transition-all">
              <input
                type="text"
                placeholder="Dán link Google Sheets công khai tại đây..."
                value={gsUrl}
                onChange={(e) => setGsUrl(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-800 dark:text-slate-200"
              />
              <button
                onClick={handleGsImport}
                disabled={!gsUrl || isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang tải...
                  </>
                ) : (
                  "Kết nối"
                )}
              </button>
            </div>
            <p className="mt-3 text-[10px] text-gray-500 leading-relaxed text-center italic">
              * Lưu ý: Google Sheet của bạn phải được cài đặt ở chế độ{" "}
              <strong>"Bất kỳ ai có liên kết đều có thể xem"</strong>.
            </p>
          </div>
        </>
      ) : (
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-1">
              Dán dữ liệu từ Google Sheets/Excel
            </p>
            <p className="text-xs text-gray-500">
              Chọn dữ liệu trong bảng của bạn, nhấn Ctrl+C sau đó nhấn Ctrl+V
              vào đây.
            </p>
          </div>

          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Dán dữ liệu tại đây (Yêu cầu có hàng tiêu đề)..."
            className="w-full h-64 p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono outline-none focus:border-red-500/50 transition-all resize-none mb-6"
          />

          <div className="flex justify-center">
            <button
              onClick={handlePasteImport}
              disabled={!pastedData.trim()}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
            >
              Xử lý dữ liệu đã dán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
