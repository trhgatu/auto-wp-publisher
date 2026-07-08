import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Slider,
  Select,
  Alert,
  Spin,
  Row,
  Col,
  Tag,
} from "antd";
import {
  RobotOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { axios } from "../../../lib/axios";
import { useNotification } from "../../../hooks/useNotification";

import { PageHeader } from "../../../components/shared/PageHeader";

export const AiSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotification();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/ai-settings");
      form.setFieldsValue(response.data);
    } catch (err) {
      console.error(err);
      notify("Lỗi", "Không thể tải cấu hình AI.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      await axios.post("/ai-settings", values);
      notify("Thành công", "Đã lưu cấu hình AI Prompt.", "success");
    } catch (err) {
      console.error(err);
      notify("Lỗi", "Không thể lưu cấu hình AI.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    form.setFieldsValue({
      systemPrompt: `Bạn là một chuyên gia viết nội dung mô tả sản phẩm tối ưu SEO cho cửa hàng phụ tùng ô tô.
Hãy viết một mô tả sản phẩm chi tiết, chuyên nghiệp và cuốn hút bằng ngôn ngữ tiếng Việt (HTML format, chỉ sử dụng các thẻ cơ bản như <p>, <h3>, <ul>, <li>, <strong>, <em>, không viết thẻ <html> hay <body>).

Thông tin sản phẩm:
- Tên sản phẩm: {title}
- Mã phụ tùng (SKU): {sku}
- Chất liệu: {material}
- Dòng xe tương thích: {carModels}
- Kích thước: {dimensions}
- Mô tả ngắn/Ghi chú: {shortDescription}

Yêu cầu bài viết:
1. Có tiêu đề và đoạn giới thiệu sản phẩm lôi cuốn.
2. Nêu bật ưu điểm và đặc tính nổi bật của sản phẩm.
3. Cung cấp hướng dẫn sử dụng hoặc lưu ý tương thích dòng xe rõ ràng (nếu có).
4. Định dạng HTML rõ ràng, dễ đọc, không chứa markdown (như \`\`\`html).`,
      temperature: 0.7,
      modelName: "gemini-2.5-flash",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80">
        <Spin size="large" tip="Đang tải cấu hình AI..." />
      </div>
    );
  }

  const variables = [
    { tag: "{title}", desc: "Tên tiêu đề sản phẩm" },
    { tag: "{sku}", desc: "Mã bài viết/Mã phụ tùng" },
    { tag: "{material}", desc: "Chất liệu sản phẩm" },
    { tag: "{carModels}", desc: "Dòng xe/Model xe tương thích" },
    { tag: "{dimensions}", desc: "Kích thước sản phẩm" },
    { tag: "{shortDescription}", desc: "Mô tả sơ bộ/Mô tả ngắn" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <PageHeader
        title="Cấu hình AI Prompt"
        breadcrumbs={[{ title: "Workspace" }, { title: "Cấu hình AI Prompt" }]}
        icon={<RobotOutlined />}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm">
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item
                label={
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Mô tả và hướng dẫn Prompt (System Prompt)
                  </span>
                }
                name="systemPrompt"
                required
                tooltip="Mẫu mô tả prompt hướng dẫn AI cách biên tập lại bài viết."
              >
                <Input.TextArea
                  rows={15}
                  placeholder="Hãy nhập Prompt chi tiết tại đây..."
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="font-bold text-xs uppercase tracking-wider">
                        AI Model
                      </span>
                    }
                    name="modelName"
                    required
                  >
                    <Select
                      size="large"
                      options={[
                        {
                          label: "Gemini 2.5 Flash (Khuyên dùng - Nhanh, Rẻ)",
                          value: "gemini-2.5-flash",
                        },
                        {
                          label:
                            "Gemini 2.5 Pro (Thông minh hơn - Tối ưu nhất)",
                          value: "gemini-2.5-pro",
                        },
                        {
                          label: "Gemini 1.5 Flash",
                          value: "gemini-1.5-flash",
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="font-bold text-xs uppercase tracking-wider">
                        Độ sáng tạo (Temperature)
                      </span>
                    }
                    name="temperature"
                    required
                    tooltip="Giá trị càng cao AI càng sáng tạo nhưng tăng rủi ro sai lệch thông tin."
                  >
                    <div className="px-2">
                      <Slider
                        min={0.0}
                        max={2.0}
                        step={0.1}
                        marks={{
                          0: "Chính xác",
                          0.7: "Cân bằng",
                          1.5: "Sáng tạo",
                          2: "Tự do",
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4">
                <Button
                  onClick={handleResetDefault}
                  icon={<UndoOutlined />}
                  size="large"
                >
                  Đặt lại mặc định
                </Button>

                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                  size="large"
                  className="font-bold text-xs uppercase tracking-tight"
                >
                  Lưu cấu hình
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8} className="space-y-6">
          {/* Guide variables */}
          <Card
            bordered={false}
            className="shadow-sm"
            title={
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Các biến tương thích
              </span>
            }
          >
            <Alert
              message="Hướng dẫn sử dụng biến"
              description="Các thẻ dưới đây sẽ tự động thay thế bằng thông tin thực tế từ Excel/Job của sản phẩm tương ứng."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="border-none bg-slate-50 dark:bg-slate-800/40 mb-4"
            />

            <div className="space-y-4">
              {variables.map((v, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0"
                >
                  <Tag
                    color="red"
                    style={{
                      fontFamily: "monospace",
                      width: "fit-content",
                      fontWeight: "bold",
                    }}
                  >
                    {v.tag}
                  </Tag>
                  <span className="text-xs text-slate-500 font-medium">
                    {v.desc}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
