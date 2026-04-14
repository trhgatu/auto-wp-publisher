import React from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";
import { SearchableSelect } from "../../../../components/shared/SearchableSelect";
import {
  useImportStore,
  selectUniqueExcelCategories,
} from "../../hooks/useImportStore";
import { useShallow } from "zustand/react/shallow";

interface MappingStepProps {
  categoryOptions: { label: string; value: string }[];
  onImport: () => void;
  isImporting: boolean;
}

export const MappingStep: React.FC<MappingStepProps> = ({
  categoryOptions,
  onImport,
  isImporting,
}) => {
  const { categoryMapping, setMapping, setStep } = useImportStore();
  const uniqueExcelCategories = useImportStore(
    useShallow((state) => selectUniqueExcelCategories(state)),
  );

  return (
    <>
      <div className="flex-1 overflow-auto px-12 py-8 bg-gray-50/30">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">Chọn danh mục cho sản phẩm</p>
              <p>
                Hãy chọn danh mục WordPress tương ứng cho từng nhóm sản phẩm từ
                file Excel của bạn.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {uniqueExcelCategories.map((excelCat) => (
              <div
                key={excelCat}
                className="flex items-center gap-6 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-red-200 shadow-sm transition-colors"
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
                    onChange={(val) => setMapping(excelCat, val)}
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
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <button
          onClick={onImport}
          disabled={isImporting}
          className="px-10 py-2.5 text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isImporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          XÁC NHẬN & IMPORT
        </button>
      </div>
    </>
  );
};
