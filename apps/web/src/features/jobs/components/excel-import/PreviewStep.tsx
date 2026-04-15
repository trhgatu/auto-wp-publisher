import React from "react";
import { ArrowRight } from "lucide-react";
import { Table } from "../../../../components/shared/Table";
import {
  useImportStore,
  selectUniqueExcelCategories,
} from "../../hooks/useImportStore";
import { useShallow } from "zustand/react/shallow";
import type { WCCategory } from "../../api/getWpCategories";
import type { CategoryMapping } from "../../api/getMappings";

interface PreviewStepProps {
  wpCategories: WCCategory[];
  savedMappings: CategoryMapping[];
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  wpCategories,
  savedMappings,
}) => {
  const { data, setStep, setData, setFullMapping } = useImportStore(
    useShallow((state) => ({
      data: state.data,
      setStep: state.setStep,
      setData: state.setData,
      setFullMapping: state.setFullMapping,
    })),
  );

  const uniqueExcelCategories = useImportStore(
    useShallow((state) => selectUniqueExcelCategories(state)),
  );

  const handleNext = () => {
    // Initialize mapping logic (moved from parent)
    const nextMapping: Record<string, string> = {};
    uniqueExcelCategories.forEach((excelCat) => {
      const saved = savedMappings.find((m) => m.excelValue === excelCat);
      if (saved) {
        nextMapping[excelCat] = String(saved.wpCategoryId);
      } else {
        const normalize = (s: string) =>
          s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normalizedExcel = normalize(excelCat);
        const match = wpCategories.find(
          (wp) =>
            normalize(wp.name) === normalizedExcel ||
            normalize(wp.name).includes(normalizedExcel) ||
            normalizedExcel.includes(normalize(wp.name)),
        );
        if (match) {
          nextMapping[excelCat] = String(match.id);
        } else {
          const uncategorized = wpCategories.find(
            (c) => normalize(c.name).includes("chuaphanloai") || c.id === 1,
          );
          if (uncategorized) {
            nextMapping[excelCat] = String(uncategorized.id);
          }
        }
      }
    });

    setFullMapping(nextMapping);
    setStep("mapping");
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-0 border-b border-gray-100 dark:border-white/5">
        <Table containerClassName="h-full">
          <Table.Header>
            <Table.Row>
              <Table.HeadCell className="min-w-[300px]">
                Tên sản phẩm
              </Table.HeadCell>
              <Table.HeadCell className="w-32 text-center">
                Mã hàng
              </Table.HeadCell>
              <Table.HeadCell className="w-32 text-center">
                Dòng xe
              </Table.HeadCell>
              <Table.HeadCell className="w-32 text-center">
                Chất liệu
              </Table.HeadCell>
              <Table.HeadCell className="w-28 text-center">
                Giá bán
              </Table.HeadCell>
              <Table.HeadCell className="w-40 text-center">
                Danh mục Excel
              </Table.HeadCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((row, idx) => (
              <Table.Row key={idx}>
                <Table.Cell className="font-medium text-xs">
                  {row.title}
                </Table.Cell>
                <Table.Cell className="text-center font-mono text-[10px] text-gray-500">
                  {row.partNumbers}
                </Table.Cell>
                <Table.Cell className="text-center">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {row.carModels || "-"}
                  </span>
                </Table.Cell>
                <Table.Cell className="text-center">
                  <span className="text-[10px] text-gray-500">
                    {row.material || "-"}
                  </span>
                </Table.Cell>
                <Table.Cell className="text-center font-bold text-red-600 text-xs">
                  {row.price}
                </Table.Cell>
                <Table.Cell className="text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {row.category}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="px-6 py-4 flex justify-end gap-3 bg-white dark:bg-transparent border-t border-gray-100 dark:border-white/5">
        <button
          onClick={() => {
            setData([]);
            setStep("upload");
          }}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
        >
          Tải tệp khác
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-all flex items-center gap-2"
        >
          Tiếp theo: Chọn danh mục <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
