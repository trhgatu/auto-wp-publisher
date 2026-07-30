import React from "react";
import { Table, Button, Tag, Upload, Tooltip, message } from "antd";
import { ArrowRightOutlined, UndoOutlined } from "@ant-design/icons";
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

  const blobUrlsRef = React.useRef<Map<File, string>>(new Map());

  const getBlobUrl = React.useCallback((file: File) => {
    if (!blobUrlsRef.current.has(file)) {
      const url = URL.createObjectURL(file);
      blobUrlsRef.current.set(file, url);
    }
    return blobUrlsRef.current.get(file)!;
  }, []);

  React.useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urls.clear();
    };
  }, []);

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
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Tên sản phẩm
        </span>
      ),
      dataIndex: "title",
      key: "title",
      width: 280,
      render: (text: string) => (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug block">
          {text}
        </span>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Mã hàng (SKU)
        </span>
      ),
      dataIndex: "partNumbers",
      key: "partNumbers",
      width: 130,
      align: "center" as const,
      render: (text: string) => (
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 inline-block">
          {text || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Dòng xe
        </span>
      ),
      dataIndex: "carModels",
      key: "carModels",
      width: 160,
      render: (text: string) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {text || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Mô tả ngắn
        </span>
      ),
      dataIndex: "shortDescription",
      key: "shortDescription",
      width: 220,
      render: (text: string) => (
        <span
          className="text-xs text-slate-600 dark:text-slate-400 truncate block max-w-[220px]"
          title={text}
        >
          {text || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Chất liệu
        </span>
      ),
      dataIndex: "material",
      key: "material",
      width: 120,
      align: "center" as const,
      render: (text: string) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {text || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Giá bán
        </span>
      ),
      dataIndex: "price",
      key: "price",
      width: 130,
      align: "right" as const,
      render: (price: string) => (
        <span className="font-black text-red-600 dark:text-red-400 text-sm tracking-tight">
          {price && !isNaN(Number(price))
            ? `${Number(price).toLocaleString("vi-VN")}đ`
            : price || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Danh mục Excel
        </span>
      ),
      dataIndex: "category",
      key: "category",
      width: 160,
      render: (cat: string) => (
        <Tag
          color="blue"
          className="text-xs font-bold py-1 px-2.5 rounded-md border-blue-200"
        >
          {cat}
        </Tag>
      ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Thương hiệu
        </span>
      ),
      dataIndex: "brand",
      key: "brand",
      width: 140,
      render: (b: string) =>
        b ? (
          <Tag
            color="purple"
            className="text-xs font-bold py-1 px-2.5 rounded-md border-purple-200"
          >
            {b}
          </Tag>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Ảnh đại diện
        </span>
      ),
      key: "featuredImage",
      width: 250,
      render: (_: unknown, __: unknown, index: number) => {
        const file = rowFeaturedFile[index] || null;

        return (
          <div className="space-y-2 py-1">
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
                        url: getBlobUrl(file),
                      },
                    ]
                  : []
              }
              beforeUpload={(newFile) => {
                setRowFeaturedFile(index, newFile);
                return false;
              }}
              onRemove={() => {
                if (file) {
                  const url = blobUrlsRef.current.get(file);
                  if (url) {
                    URL.revokeObjectURL(url);
                    blobUrlsRef.current.delete(file);
                  }
                }
                setRowFeaturedFile(index, null);
              }}
            >
              {!file && (
                <Button size="middle" className="font-semibold text-xs">
                  Chọn ảnh chính
                </Button>
              )}
            </Upload>

            {file && data.length > 1 && (
              <div className="pt-1">
                <Tooltip
                  title={`Áp dụng ảnh đại diện này cho tất cả ${data.length} sản phẩm trong lô hàng`}
                >
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    className="text-xs font-bold text-blue-700 border-blue-400 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700 text-left truncate max-w-[230px] h-7 shadow-xs"
                    onClick={() => {
                      useImportStore.getState().applyFeaturedFileToAll(file);
                      message.success(
                        `Đã gán ảnh đại diện cho tất cả ${data.length} sản phẩm trong lô hàng`,
                      );
                    }}
                  >
                    Áp dụng ảnh này cho tất cả ({data.length} sp)
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Thư viện ảnh
        </span>
      ),
      key: "galleryImages",
      width: 260,
      render: (_: unknown, __: unknown, index: number) => {
        const files = rowGalleryFiles[index] || [];

        return (
          <div className="space-y-2 py-1">
            <Upload
              listType="picture"
              multiple
              fileList={files.map((file, i) => ({
                uid: `${i}`,
                name: file.name,
                status: "done",
                url: getBlobUrl(file),
              }))}
              beforeUpload={(file) => {
                addRowGalleryFile(index, file);
                return false; // Prevent auto-upload
              }}
              onRemove={(fileToRemove) => {
                const originalFile = files.find(
                  (f) => f.name === fileToRemove.name,
                );
                if (originalFile) {
                  const url = blobUrlsRef.current.get(originalFile);
                  if (url) {
                    URL.revokeObjectURL(url);
                    blobUrlsRef.current.delete(originalFile);
                  }
                }
                const updatedFiles = files.filter(
                  (f) => f.name !== fileToRemove.name,
                );
                setRowGalleryFiles(index, updatedFiles);
              }}
            >
              <Button size="middle" className="font-semibold text-xs">
                Chọn ảnh phụ
              </Button>
            </Upload>

            {files.length > 0 && data.length > 1 && (
              <div className="pt-1">
                <Tooltip
                  title={`Áp dụng bộ ảnh phụ này cho tất cả ${data.length} sản phẩm trong lô hàng`}
                >
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    className="text-xs font-bold text-blue-700 border-blue-400 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700 text-left truncate max-w-[240px] h-7 shadow-xs"
                    onClick={() => {
                      useImportStore.getState().applyGalleryFilesToAll(files);
                      message.success(
                        `Đã gán bộ ảnh phụ cho tất cả ${data.length} sản phẩm trong lô hàng`,
                      );
                    }}
                  >
                    Áp dụng bộ ảnh này cho tất cả ({data.length} sp)
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Trạng thái
        </span>
      ),
      key: "status",
      width: 140,
      align: "center" as const,
      render: (record: { partNumbers?: string }) => {
        const exists = existingProducts.find(
          (ex) => ex.sku === record.partNumbers,
        );
        return exists ? (
          <Tag
            color="blue"
            className="text-xs font-bold py-1 px-2.5 rounded-md border-blue-200"
          >
            Cập nhật
          </Tag>
        ) : (
          <Tag
            color="green"
            className="text-xs font-bold py-1 px-2.5 rounded-md border-green-200"
          >
            Tạo mới
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
          size="middle"
          scroll={{ x: 1300, y: "calc(85vh - 280px)" }}
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
