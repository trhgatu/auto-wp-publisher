import React from "react";
import { Table, Button, Tag, Upload } from "antd";
import {
  ArrowRightOutlined,
  UndoOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  useImportStore,
  selectUniqueExcelCategories,
} from "../../hooks/useImportStore";
import { useShallow } from "zustand/react/shallow";
import type { WCCategory } from "../../api/getWpCategories";
import type { CategoryMapping } from "../../api/getMappings";
import type { WCBrand } from "../../api/getWpBrands";
import type { BrandMapping } from "../../api/getBrandMappings";
import { checkSkus, type ExistingProductInfo } from "../../api/checkSkus";

interface PreviewStepProps {
  wpCategories: WCCategory[];
  savedMappings: CategoryMapping[];
  wpBrands: WCBrand[];
  savedMappingsBrands: BrandMapping[];
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  wpCategories,
  savedMappings,
  wpBrands,
  savedMappingsBrands,
}) => {
  const {
    data,
    setStep,
    setData,
    setFullMapping,
    setFullBrandMapping,
    rowFeaturedFile,
    setRowFeaturedFile,
    rowGalleryFiles,
    setRowGalleryFiles,
    addRowGalleryFile,
  } = useImportStore(
    useShallow((state) => ({
      data: state.data,
      setStep: state.setStep,
      setData: state.setData,
      setFullMapping: state.setFullMapping,
      setFullBrandMapping: state.setFullBrandMapping,
      rowFeaturedFile: state.rowFeaturedFile,
      setRowFeaturedFile: state.setRowFeaturedFile,
      rowGalleryFiles: state.rowGalleryFiles,
      setRowGalleryFiles: state.setRowGalleryFiles,
      addRowGalleryFile: state.addRowGalleryFile,
    })),
  );
  const [existingProducts, setExistingProducts] = React.useState<
    ExistingProductInfo[]
  >([]);

  React.useEffect(() => {
    const skus = data.map((p) => p.partNumbers).filter(Boolean) as string[];
    if (skus.length > 0) {
      checkSkus(skus).then(setExistingProducts);
    }
  }, [data]);

  const uniqueExcelCategories = useImportStore(
    useShallow((state) => selectUniqueExcelCategories(state)),
  );

  const handleNext = () => {
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

    const nextBrandMapping: Record<string, string> = {};
    uniqueExcelCategories.forEach((excelCat) => {
      const saved = savedMappingsBrands.find((m) => m.excelValue === excelCat);
      if (saved) {
        nextBrandMapping[excelCat] = String(saved.wpBrandId);
      } else {
        const categoryBrands = Array.from(
          new Set(
            data
              .filter((p) => p.category === excelCat && p.brand)
              .map((p) => p.brand!.trim()),
          ),
        );

        const resolvedIds: string[] = [];
        categoryBrands.forEach((excelBrand) => {
          const savedBrand = savedMappingsBrands.find(
            (m) => m.excelValue === excelBrand,
          );
          if (savedBrand) {
            resolvedIds.push(String(savedBrand.wpBrandId));
          } else {
            const normalize = (s: string) =>
              s.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normalizedExcel = normalize(excelBrand);
            const match = wpBrands.find(
              (wp) =>
                normalize(wp.name) === normalizedExcel ||
                normalize(wp.name).includes(normalizedExcel) ||
                normalizedExcel.includes(normalize(wp.name)),
            );
            if (match) {
              resolvedIds.push(String(match.id));
            }
          }
        });

        nextBrandMapping[excelCat] = resolvedIds.join(",");
      }
    });

    setFullMapping(nextMapping);
    setFullBrandMapping(nextBrandMapping);
    setStep("mapping");
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text: string) => (
        <span className="text-xs font-medium">{text}</span>
      ),
    },
    {
      title: "Mã hàng",
      dataIndex: "partNumbers",
      key: "partNumbers",
      width: 110,
      align: "center" as const,
      render: (text: string) => (
        <span className="font-mono text-[10px] text-slate-500">
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Dòng xe",
      dataIndex: "carModels",
      key: "carModels",
      width: 150,
      render: (text: string) => (
        <span className="text-[10px] text-slate-600 dark:text-slate-400">
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Mô tả ngắn",
      dataIndex: "shortDescription",
      key: "shortDescription",
      width: 200,
      render: (text: string) => (
        <span
          className="text-[10px] text-slate-400 truncate block max-w-[200px]"
          title={text}
        >
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      key: "material",
      width: 100,
      align: "center" as const,
      render: (text: string) => (
        <span className="text-[10px] text-slate-500">{text || "-"}</span>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 110,
      align: "right" as const,
      render: (price: string) => (
        <span className="font-black text-red-600 text-xs">
          {price && !isNaN(Number(price))
            ? `${Number(price).toLocaleString("vi-VN")}đ`
            : price || "-"}
        </span>
      ),
    },
    {
      title: "Danh mục Excel",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (cat: string) => (
        <Tag color="default" style={{ fontWeight: "bold", fontSize: "10px" }}>
          {cat}
        </Tag>
      ),
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      width: 120,
      render: (brand: string) => (
        <Tag color="warning" style={{ fontWeight: "bold", fontSize: "10px" }}>
          {brand || "-"}
        </Tag>
      ),
    },
    {
      title: "Ảnh đại diện",
      key: "featuredImage",
      width: 180,
      render: (_: unknown, __: unknown, index: number) => {
        const file = rowFeaturedFile[index] || null;
        return (
          <Upload
            listType="picture"
            maxCount={1}
            fileList={
              file
                ? [
                    {
                      uid: "-1",
                      name: file.name,
                      status: "done",
                      url: URL.createObjectURL(file),
                    },
                  ]
                : []
            }
            beforeUpload={(newFile) => {
              setRowFeaturedFile(index, newFile);
              return false;
            }}
            onRemove={() => {
              setRowFeaturedFile(index, null);
            }}
          >
            {!file && (
              <Button size="small" icon={<UploadOutlined />}>
                Chọn ảnh
              </Button>
            )}
          </Upload>
        );
      },
    },
    {
      title: "Thư viện ảnh",
      key: "galleryImages",
      width: 220,
      render: (_: unknown, __: unknown, index: number) => {
        const files = rowGalleryFiles[index] || [];
        return (
          <Upload
            listType="picture"
            multiple
            fileList={files.map((file, i) => ({
              uid: `${i}`,
              name: file.name,
              status: "done",
              url: URL.createObjectURL(file),
            }))}
            beforeUpload={(file) => {
              addRowGalleryFile(index, file);
              return false; // Prevent auto-upload
            }}
            onRemove={(file) => {
              const updatedFiles = files.filter((f) => f.name !== file.name);
              setRowGalleryFiles(index, updatedFiles);
            }}
          >
            <Button size="small" icon={<UploadOutlined />}>
              Chọn ảnh phụ
            </Button>
          </Upload>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => {
        const exists = existingProducts.find(
          (ex) => ex.sku === record.partNumbers,
        );
        return exists ? (
          <Tag color="blue" style={{ fontWeight: "bold", fontSize: "10px" }}>
            Đã có (Update)
          </Tag>
        ) : (
          <Tag color="green" style={{ fontWeight: "bold", fontSize: "10px" }}>
            Mới (Import)
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/10">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(_, idx) => idx?.toString() || ""}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="small"
          scroll={{ x: 1100, y: "calc(85vh - 280px)" }}
        />
      </div>

      <div className="px-6 py-4 flex justify-end gap-3 bg-white dark:bg-[#141414] border-t border-slate-100 dark:border-slate-800">
        <Button
          onClick={() => {
            setData([]);
            setStep("upload");
          }}
          icon={<UndoOutlined />}
          size="large"
          className="font-bold text-xs uppercase tracking-tight"
        >
          Tải tệp khác
        </Button>

        <Button
          type="primary"
          danger
          onClick={handleNext}
          icon={<ArrowRightOutlined />}
          size="large"
          className="font-bold text-xs uppercase tracking-tight"
        >
          Tiếp theo: Chọn danh mục & thương hiệu
        </Button>
      </div>
    </>
  );
};
