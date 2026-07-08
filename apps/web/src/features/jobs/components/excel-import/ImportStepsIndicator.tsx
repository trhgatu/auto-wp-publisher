import React from "react";
import { Steps, Button } from "antd";
import {
  CloseOutlined,
  UploadOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useImportStore } from "../../hooks/useImportStore";

interface ImportStepsIndicatorProps {
  onClose: () => void;
}

export const ImportStepsIndicator: React.FC<ImportStepsIndicatorProps> = ({
  onClose,
}) => {
  const step = useImportStore((state) => state.step);

  const stepItems = [
    { title: "Tải tệp lên", icon: <UploadOutlined /> },
    { title: "Xem trước dữ liệu", icon: <DatabaseOutlined /> },
    { title: "Ánh xạ danh mục", icon: <ApartmentOutlined /> },
  ];

  const currentStep = step === "upload" ? 0 : step === "preview" ? 1 : 2;

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#141414] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800/40">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0 uppercase tracking-tight">
          <UploadOutlined className="text-red-600" />
          Nhập dữ liệu từ Excel
        </h2>
        <Button
          type="text"
          shape="circle"
          onClick={onClose}
          icon={
            <CloseOutlined className="text-slate-400 hover:text-red-500 transition-colors" />
          }
        />
      </div>

      {/* Steps Indicator */}
      <div className="px-12 py-5 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="max-w-2xl mx-auto">
          <Steps current={currentStep} items={stepItems} size="small" />
        </div>
      </div>
    </div>
  );
};
