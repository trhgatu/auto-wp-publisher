import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Checkbox,
  Button,
  Tabs,
  Tag,
  Alert,
  message,
} from "antd";
import {
  CodeOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ProductTemplateDto } from "../api/templates";
import { useSaveTemplate } from "../hooks/useTemplates";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: ProductTemplateDto | null;
}

const PLACEHOLDERS = [
  {
    tag: "{title}",
    label: "Tên sản phẩm",
    example: "Lọc gió động cơ Toyota Camry 2.5",
  },
  { tag: "{sku}", label: "Mã phụ tùng (SKU)", example: "17801-0H010" },
  { tag: "{material}", label: "Chất liệu", example: "Sợi tổng hợp cao cấp" },
  {
    tag: "{carModels}",
    label: "Dòng xe tương thích",
    example: "Toyota Camry 2018 - 2024",
  },
  {
    tag: "{shortDescription}",
    label: "Mô tả ngắn / Ghi chú",
    example: "Bảo hành 12 tháng",
  },
];

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templateToEdit,
}) => {
  const [form] = Form.useForm();
  const saveMutation = useSaveTemplate();
  const contentValue = Form.useWatch("content", form) || "";

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        form.setFieldsValue({
          name: templateToEdit.name,
          content: templateToEdit.content,
          isDefault: templateToEdit.isDefault,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, templateToEdit, form]);

  const handleInsertTag = (tag: string) => {
    const current = form.getFieldValue("content") || "";
    form.setFieldValue("content", `${current} ${tag}`);
    message.success(`Đã chèn ${tag} vào nội dung HTML`);
  };

  const getPreviewHtml = () => {
    if (!contentValue) {
      return '<p style="color: #94a3b8; text-align: center; padding: 40px 0;">Vui lòng nhập nội dung HTML để xem trước...</p>';
    }

    let preview = contentValue;
    PLACEHOLDERS.forEach((p) => {
      preview = preview.replace(new RegExp(p.tag, "g"), p.example);
    });

    return preview;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await saveMutation.mutateAsync({
        id: templateToEdit?.id,
        name: values.name,
        content: values.content,
        isDefault: values.isDefault,
      });

      message.success(
        templateToEdit
          ? "Cập nhật mẫu bài viết thành công!"
          : "Tạo mới mẫu bài viết thành công!",
      );
      onClose();
    } catch (err) {
      console.error("Save template error:", err);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
          <CodeOutlined className="text-red-500" />
          {templateToEdit ? "Chỉnh sửa Mẫu bài viết" : "Tạo Mẫu bài viết Mới"}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={saveMutation.isPending}
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
        >
          {templateToEdit ? "Lưu thay đổi" : "Tạo Mẫu mới"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label={<span className="font-semibold">Tên Mẫu bài viết</span>}
          rules={[
            { required: true, message: "Vui lòng nhập tên mẫu bài viết" },
          ]}
        >
          <Input
            placeholder="Ví dụ: Mẫu Phụ tùng Ô tô Chuyên nghiệp..."
            size="large"
          />
        </Form.Item>

        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox className="font-semibold text-slate-700 dark:text-slate-300">
            Đặt làm Mẫu bài viết mặc định (Tự động dùng khi AI không khả dụng)
          </Checkbox>
        </Form.Item>

        <Alert
          message="Biến thay thế tự động (Placeholders):"
          description={
            <div className="flex flex-wrap gap-2 mt-2">
              {PLACEHOLDERS.map((p) => (
                <Tag
                  key={p.tag}
                  color="red"
                  className="cursor-pointer hover:opacity-80 transition-opacity py-1 px-2.5 text-xs flex items-center gap-1 font-mono"
                  onClick={() => handleInsertTag(p.tag)}
                >
                  <CopyOutlined />
                  <span>{p.tag}</span>
                  <span className="font-sans text-[11px] opacity-75">
                    ({p.label})
                  </span>
                </Tag>
              ))}
            </div>
          }
          type="info"
          className="mb-4"
        />

        <Tabs
          defaultActiveKey="editor"
          items={[
            {
              key: "editor",
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <CodeOutlined /> Soạn thảo HTML
                </span>
              ),
              children: (
                <Form.Item
                  name="content"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung HTML" },
                  ]}
                  className="mb-0"
                >
                  <Input.TextArea
                    rows={14}
                    placeholder="Nhập mã HTML bài viết tại đây..."
                    className="font-mono text-xs leading-relaxed"
                  />
                </Form.Item>
              ),
            },
            {
              key: "preview",
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <EyeOutlined /> Xem trước (Live Preview)
                </span>
              ),
              children: (
                <div
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-5 bg-white dark:bg-slate-900 min-h-[320px] max-h-[420px] overflow-auto shadow-inner"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};
