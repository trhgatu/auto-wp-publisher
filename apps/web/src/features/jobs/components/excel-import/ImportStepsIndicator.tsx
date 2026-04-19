import React from "react";
import { Check, Upload, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useImportStore } from "../../hooks/useImportStore";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ImportStepsIndicatorProps {
  onClose: () => void;
}

export const ImportStepsIndicator: React.FC<ImportStepsIndicatorProps> = ({
  onClose,
}) => {
  const step = useImportStore((state) => state.step);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <Upload className="w-5 h-5 text-red-600" />
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
            { id: "mapping", label: "Chọn danh mục" },
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
                        ? "bg-red-600 border-red-600 text-white"
                        : isPast
                          ? "bg-white border-red-600 text-red-600"
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
                      className="absolute inset-0 bg-red-600 transition-all duration-300"
                      style={{ width: isPast ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
};
