import React, { useMemo, useEffect } from "react";
import { Modal } from "antd";
import { useBulkCreateJobs } from "../hooks/useBulkCreateJobs";
import {
  useCategories,
  useMappings,
  useUpsertMappings,
} from "../hooks/useCategories";
import {
  useBrands,
  useBrandMappings,
  useUpsertBrandMappings,
} from "../hooks/useBrands";
import { useImportStore } from "../hooks/useImportStore";
import { useNotification } from "../../../hooks/useNotification";

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
  const { step, data, categoryMapping, brandMapping, reset } = useImportStore();
  const { notify } = useNotification();

  // API Hooks
  const mutation = useBulkCreateJobs();
  const upsertMappingsMutation = useUpsertMappings();
  const upsertBrandMappingsMutation = useUpsertBrandMappings();
  const { data: wpCategories = [] } = useCategories();
  const { data: savedMappings = [] } = useMappings();
  const { data: wpBrands = [] } = useBrands();
  const { data: savedMappingsBrands = [] } = useBrandMappings();

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
            label: c.name,
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

  const brandOptions = useMemo(() => {
    return wpBrands.map((b) => ({
      label: b.name,
      value: String(b.id),
    }));
  }, [wpBrands]);

  const handleImport = async () => {
    if (data.length === 0) return;

    try {
      const mappingsToSave = Object.entries(categoryMapping).map(
        ([excelName, wpId]) => {
          const wpIdStr = Array.isArray(wpId) ? wpId.join(",") : String(wpId);
          return {
            excelValue: excelName,
            wpCategoryId: wpIdStr,
            wpCategoryName: wpIdStr
              .split(",")
              .map(
                (id) =>
                  wpCategories.find((c) => String(c.id) === id.trim())?.name ||
                  "N/A",
              )
              .join(", "),
          };
        },
      );

      const brandMappingsToSave = Object.entries(brandMapping).map(
        ([excelName, wpId]) => {
          const wpIdStr = Array.isArray(wpId) ? wpId.join(",") : String(wpId);
          return {
            excelValue: excelName,
            wpBrandId: wpIdStr,
            wpBrandName: wpIdStr
              .split(",")
              .map(
                (id) =>
                  wpBrands.find((b) => String(b.id) === id.trim())?.name ||
                  "N/A",
              )
              .join(", "),
          };
        },
      );

      if (mappingsToSave.length > 0) {
        await upsertMappingsMutation.mutateAsync(mappingsToSave);
      }

      if (brandMappingsToSave.length > 0) {
        await upsertBrandMappingsMutation.mutateAsync(brandMappingsToSave);
      }

      const finalData = data.map((product) => {
        const mappedCat = categoryMapping[product.category || ""];
        const finalCat = Array.isArray(mappedCat)
          ? mappedCat.join(",")
          : mappedCat || product.category;

        const mappedBrand = brandMapping[product.category || ""];
        const finalBrand = Array.isArray(mappedBrand)
          ? mappedBrand.join(",")
          : mappedBrand || product.brand;

        return {
          ...product,
          category: finalCat,
          brand: finalBrand,
        };
      });

      await mutation.mutateAsync(finalData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Đã có lỗi xảy ra không xác định.";
      notify("Lỗi", `Lỗi khi kết thúc Import: ${errorMsg}`, "error");
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1200}
      destroyOnClose
      centered
      closable={false}
      styles={{
        body: {
          padding: 0,
          overflow: "hidden",
        },
      }}
      className="dark:bg-[#141414]"
    >
      <div className="bg-white dark:bg-[#141414] rounded-lg w-full max-h-[85vh] flex flex-col overflow-hidden transition-all">
        <ImportStepsIndicator onClose={onClose} />

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === "upload" && <UploadStep />}

          {step === "preview" && (
            <PreviewStep
              wpCategories={wpCategories}
              savedMappings={savedMappings}
              wpBrands={wpBrands}
              savedMappingsBrands={savedMappingsBrands}
            />
          )}

          {step === "mapping" && (
            <MappingStep
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              onImport={handleImport}
              isImporting={
                mutation.isPending ||
                upsertMappingsMutation.isPending ||
                upsertBrandMappingsMutation.isPending
              }
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
