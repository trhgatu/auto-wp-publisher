import React from "react";
import { Upload, Input, Button, Segmented, Divider, Space } from "antd";
import {
  InboxOutlined,
  LinkOutlined,
  FileTextOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useImportStore } from "../../hooks/useImportStore";
import { parseExcelFile } from "../../utils/excelParser";
import { useNotification } from "../../../../hooks/useNotification";

export const UploadStep: React.FC = () => {
  const { setData, setStep } = useImportStore();
  const { notify } = useNotification();
  const [gsUrl, setGsUrl] = React.useState("");
  const [pastedData, setPastedData] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"file" | "paste">("file");

  const processFile = (uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        if (!bstr) return;

        const validData = parseExcelFile(bstr);

        if (validData.length === 0) {
          notify(
            "Cảnh báo",
            "Không tìm thấy dữ liệu hợp lệ trong file Excel.",
            "info",
          );
        } else {
          setData(validData);
          setStep("preview");
        }
      } catch (err) {
        console.error("Error parsing excel:", err);
        notify(
          "Lỗi",
          err instanceof Error ? err.message : "Lỗi đọc file Excel.",
          "error",
        );
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleGsImport = async () => {
    if (!gsUrl) return;

    setIsLoading(true);
    try {
      const reg = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = gsUrl.match(reg);

      if (!match) {
        throw new Error(
          "URL Google Sheets không hợp lệ. Vui lòng kiểm tra lại.",
        );
      }

      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(
          "Không thể tải dữ liệu từ Google Sheets. Hãy đảm bảo sheet đã được để ở chế độ 'Bất kỳ ai có liên kết đều có thể xem' (Public).",
        );
      }

      const csvData = await response.text();
      const validData = parseExcelFile(csvData, true);

      if (validData.length === 0) {
        notify(
          "Cảnh báo",
          "Không tìm thấy dữ liệu hợp lệ trong Google Sheets.",
          "info",
        );
      } else {
        setData(validData);
        setStep("preview");
      }
    } catch (err) {
      console.error("Error fetching GS:", err);
      notify(
        "Lỗi",
        err instanceof Error ? err.message : "Lỗi khi tải Google Sheets.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteImport = () => {
    if (!pastedData.trim()) return;

    try {
      const validData = parseExcelFile(pastedData, true);

      if (validData.length === 0) {
        notify("Cảnh báo", "Dữ liệu đã dán không hợp lệ hoặc trống.", "info");
      } else {
        setData(validData);
        setStep("preview");
      }
    } catch (err) {
      console.error("Error parsing pasted data:", err);
      notify(
        "Lỗi",
        "Lỗi khi xử lý dữ liệu dán vào. Vui lòng kiểm tra định dạng.",
        "error",
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-10 max-h-full overflow-y-auto bg-white dark:bg-[#141414]">
      {/* Tabs */}
      <Segmented
        options={[
          {
            label: "Tải File / Link GS",
            value: "file",
            icon: <FileExcelOutlined />,
          },
          {
            label: "Dán dữ liệu trực tiếp",
            value: "paste",
            icon: <FileTextOutlined />,
          },
        ]}
        value={activeTab}
        onChange={(value) => setActiveTab(value as "file" | "paste")}
        size="large"
        className="mb-8"
      />

      {activeTab === "file" ? (
        <div className="w-full max-w-lg space-y-6">
          <Upload.Dragger
            accept=".xlsx, .xls"
            showUploadList={false}
            beforeUpload={(file) => {
              processFile(file);
              return false; // prevent automatic upload
            }}
            className="group"
            style={{
              padding: "24px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.01)",
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-4xl text-red-600 group-hover:scale-110 transition-transform" />
            </p>
            <p className="ant-upload-text font-bold text-slate-800 dark:text-slate-200 mt-2">
              Kéo thả tệp Excel vào đây hoặc click để chọn
            </p>
            <p className="ant-upload-hint text-xs text-slate-500 mt-1">
              Hỗ trợ định dạng .xlsx, .xls (Tối đa 5MB)
            </p>
          </Upload.Dragger>

          <Divider style={{ margin: "24px 0" }}>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Hoặc kết nối Google Sheets
            </span>
          </Divider>

          <div className="space-y-3">
            <Space.Compact className="w-full">
              <Input
                placeholder="Dán link Google Sheets công khai tại đây..."
                value={gsUrl}
                onChange={(e) => setGsUrl(e.target.value)}
                size="large"
                prefix={<LinkOutlined className="text-slate-400" />}
              />
              <Button
                type="primary"
                danger
                onClick={handleGsImport}
                disabled={!gsUrl}
                loading={isLoading}
                size="large"
                className="font-bold text-xs uppercase tracking-tight"
              >
                Kết nối
              </Button>
            </Space.Compact>
            <p className="text-[10px] text-slate-500 leading-relaxed text-center italic mt-1">
              * Lưu ý: Google Sheet của bạn phải được chia sẻ ở chế độ{" "}
              <strong>&quot;Bất kỳ ai có liên kết đều có thể xem&quot;</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Dán dữ liệu từ Google Sheets hoặc Excel
            </h4>
            <p className="text-xs text-slate-500">
              Chọn và copy (Ctrl+C) vùng dữ liệu trong trang tính của bạn rồi
              paste (Ctrl+V) vào ô dưới đây (yêu cầu có hàng tiêu đề).
            </p>
          </div>

          <Input.TextArea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Dán dữ liệu tại đây..."
            rows={8}
            className="font-mono text-xs"
            style={{ borderRadius: "12px" }}
          />

          <div className="flex justify-center">
            <Button
              type="primary"
              danger
              size="large"
              onClick={handlePasteImport}
              disabled={!pastedData.trim()}
              className="font-bold text-xs uppercase tracking-tight px-8 h-12 rounded-xl"
            >
              Xử lý dữ liệu đã dán
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
