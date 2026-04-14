import React, { useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useBulkCreateJobs } from "../hooks/useBulkCreateJobs";
import {
  useCategories,
  useMappings,
  useUpsertMappings,
} from "../hooks/useCategories";
import { useImportStore } from "../hooks/useImportStore";

// Sub-components
import { ImportStepsIndicator } from "./excel-import/ImportStepsIndicator";
import { UploadStep } from "./excel-import/UploadStep";
import { PreviewStep } from "./excel-import/PreviewStep";
import { MappingStep } from "./excel-import/MappingStep";

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
  // Store
  const { step, data, categoryMapping, reset } = useImportStore();

  // API Hooks
  const mutation = useBulkCreateJobs();
  const upsertMappingsMutation = useUpsertMappings();
  const { data: wpCategories = [] } = useCategories();
  const { data: savedMappings = [] } = useMappings();

  // Reset store when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Derived Data for Sub-components
  const categoryOptions = useMemo(() => {
    const sorted: { label: string; value: string; depth: number }[] = [];
    const visit = (parentId: number, depth: number) => {
      wpCategories
        .filter((c) => c.parent === parentId)
        .forEach((c) => {
          sorted.push({
            label: depth > 0 ? `${"　".repeat(depth)}↳ ${c.name}` : c.name,
            value: String(c.id),
            depth,
          });
          visit(c.id, depth + 1);
        });
    };
    visit(0, 0);

    wpCategories.forEach((c) => {
      if (!sorted.find((s) => s.value === String(c.id))) {
        sorted.push({ label: c.name, value: String(c.id), depth: 0 });
      }
    });

    return sorted;
  }, [wpCategories]);

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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] rounded-lg shadow-xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden transition-all border border-gray-200 dark:border-white/10">
        <ImportStepsIndicator onClose={onClose} />

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === "upload" && <UploadStep />}

          {step === "preview" && (
            <PreviewStep
              wpCategories={wpCategories}
              savedMappings={savedMappings}
            />
          )}

          {step === "mapping" && (
            <MappingStep
              categoryOptions={categoryOptions}
              onImport={handleImport}
              isImporting={
                mutation.isPending || upsertMappingsMutation.isPending
              }
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
