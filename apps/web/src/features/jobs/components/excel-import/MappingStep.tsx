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
  brandOptions: { label: string; value: string }[];
  onImport: () => void;
  isImporting: boolean;
}

export const MappingStep: React.FC<MappingStepProps> = ({
  categoryOptions,
  brandOptions,
  onImport,
  isImporting,
}) => {
  const {
    categoryMapping,
    setMapping,
    brandMapping,
    setBrandMapping,
    setStep,
  } = useImportStore();

  const uniqueExcelCategories = useImportStore(
    useShallow((state) => selectUniqueExcelCategories(state)),
  );

  return (
    <>
      <div className="flex-1 overflow-auto px-12 py-8 bg-gray-50/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">Ánh xạ thuộc tính sản phẩm</p>
              <p>
                Hãy đối chiếu Danh mục và Thương hiệu từ file Excel của bạn sang
                các giá trị tương ứng trên WordPress.
              </p>
            </div>
          </div>

          {/* CATEGORIES MAPPING SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-700 dark:text-slate-200 border-l-4 border-red-500 pl-3">
              Ánh xạ danh mục WordPress
            </h3>
            {uniqueExcelCategories.map((excelCat) => (
              <div
                key={excelCat}
                className="flex items-center gap-6 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-red-200 shadow-sm transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Danh mục Excel
                  </p>
                  <p className="text-base font-semibold text-gray-800 dark:text-slate-100 truncate">
                    {excelCat}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                    {useImportStore
                      .getState()
                      .data.filter((d) => d.category === excelCat)
                      .map((d) => d.carModels)
                      .filter(
                        (val, index, self) =>
                          val && self.indexOf(val) === index,
                      )
                      .join(", ") || "Không có thông tin dòng xe"}
                  </p>
                </div>

                <div className="flex-shrink-0 text-gray-300">
                  <ArrowRight className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Danh mục wordpress
                    </p>
                    <SearchableSelect
                      options={categoryOptions}
                      value={categoryMapping[excelCat] || ""}
                      onChange={(val) => setMapping(excelCat, val)}
                      placeholder="Tìm danh mục WP..."
                      multiple={true}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Thương hiệu wordpress
                    </p>
                    <SearchableSelect
                      options={brandOptions}
                      value={brandMapping[excelCat] || ""}
                      onChange={(val) => setBrandMapping(excelCat, val)}
                      placeholder="Tìm thương hiệu WP..."
                      multiple={true}
                    />
                  </div>
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
