import React from "react";
import { Alert, Select, Button, Card, Row, Col } from "antd";
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
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
      <div className="flex-1 overflow-auto px-10 py-6 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <Alert
            message={
              <span className="font-bold text-sm text-red-800 dark:text-red-200">
                Ánh xạ thuộc tính sản phẩm
              </span>
            }
            description={
              <span className="text-xs text-red-700 dark:text-red-300">
                Hãy đối chiếu Danh mục và Thương hiệu từ file Excel của bạn sang
                các giá trị tương ứng trên WordPress.
              </span>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined className="text-red-600" />}
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.05)",
              border: "1px solid rgba(220, 38, 38, 0.15)",
              borderRadius: "12px",
            }}
          />

          {/* CATEGORIES MAPPING SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest border-l-4 border-red-500 pl-3">
              Ánh xạ danh mục & thương hiệu WordPress
            </h3>

            {uniqueExcelCategories.map((excelCat) => (
              <Card
                key={excelCat}
                bordered={false}
                className="shadow-sm hover:border-red-200 transition-colors"
                bodyStyle={{ padding: "20px" }}
              >
                <Row gutter={[24, 16]} align="middle">
                  <Col xs={24} md={8}>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Danh mục Excel
                      </p>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 m-0 truncate">
                        {excelCat}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
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
                  </Col>

                  <Col xs={24} md={2} className="text-center hidden md:block">
                    <ArrowRightOutlined className="text-slate-300 text-lg" />
                  </Col>

                  <Col xs={24} md={14} className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Danh mục wordpress
                      </p>
                      <Select
                        mode="multiple"
                        showSearch
                        optionFilterProp="label"
                        style={{ width: "100%" }}
                        placeholder="Chọn danh mục WP..."
                        value={
                          categoryMapping[excelCat]
                            ? typeof categoryMapping[excelCat] === "string"
                              ? (categoryMapping[excelCat] as string)
                                  .split(",")
                                  .filter(Boolean)
                              : categoryMapping[excelCat]
                            : []
                        }
                        onChange={(val) => setMapping(excelCat, val.join(","))}
                        options={categoryOptions}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Thương hiệu wordpress
                      </p>
                      <Select
                        mode="multiple"
                        showSearch
                        optionFilterProp="label"
                        style={{ width: "100%" }}
                        placeholder="Chọn thương hiệu WP..."
                        value={
                          brandMapping[excelCat]
                            ? typeof brandMapping[excelCat] === "string"
                              ? (brandMapping[excelCat] as string)
                                  .split(",")
                                  .filter(Boolean)
                              : brandMapping[excelCat]
                            : []
                        }
                        onChange={(val) =>
                          setBrandMapping(excelCat, val.join(","))
                        }
                        options={brandOptions}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-white dark:bg-[#141414]">
        <Button
          onClick={() => setStep("preview")}
          icon={<ArrowLeftOutlined />}
          size="large"
          className="font-bold text-xs uppercase tracking-tight"
        >
          Quay lại
        </Button>

        <Button
          type="primary"
          danger
          onClick={onImport}
          disabled={isImporting}
          loading={isImporting}
          icon={<CheckOutlined />}
          size="large"
          className="font-bold text-xs uppercase tracking-tight px-10"
        >
          XÁC NHẬN & IMPORT
        </Button>
      </div>
    </>
  );
};
