import { useState, useEffect, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Slider,
  Select,
  Alert,
  Row,
  Col,
  Tag,
  Tooltip,
} from "antd";
import {
  RobotOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  UndoOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { axios } from "../../../lib/axios";
import { useNotification } from "../../../hooks/useNotification";

import { PageHeader } from "../../../components/shared/PageHeader";
import { Loading } from "../../../components/shared/Loading";

export const AiSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textareaRef = useRef<any>(null);

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
- Từ khóa chính SEO (Focus Keyword): {focusKeyword}

Yêu cầu bài viết để tối ưu hóa SEO trên WordPress:
1. Có tiêu đề và đoạn giới thiệu sản phẩm lôi cuốn.
2. BẮT BUỘC sử dụng từ khóa chính "{focusKeyword}" ngay ở phần đầu tiên của bài viết (trong 50 từ đầu tiên).
3. Lặp lại từ khóa chính "{focusKeyword}" khoảng 3-5 lần một cách tự nhiên xuyên suốt bài viết (trong các tiêu đề h3 hoặc đoạn văn).
4. Viết mô tả sản phẩm có độ dài tối thiểu là 650 từ để đảm bảo tối ưu hóa RankMath/Yoast SEO.
5. Nêu bật ưu điểm và đặc tính nổi bật của sản phẩm.
6. Cung cấp hướng dẫn sử dụng hoặc lưu ý tương thích dòng xe rõ ràng (nếu có).
7. Định dạng HTML rõ ràng, dễ đọc, không chứa markdown (như \`\`\`html).`,
      temperature: 0.7,
      modelName: "gemini-2.5-flash",
    });
  };

  const handleInsertTag = (tag: string) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.getFieldValue("systemPrompt") || "";
    const newText = text.substring(0, start) + tag + text.substring(end);

    form.setFieldsValue({ systemPrompt: newText });

    // Focus back and position cursor after inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  if (loading) {
    return <Loading tip="Đang tải cấu hình AI..." height={320} />;
  }

  const variables = [
    { tag: "{title}", desc: "Tên tiêu đề sản phẩm" },
    { tag: "{sku}", desc: "Mã bài viết/Mã phụ tùng" },
    { tag: "{material}", desc: "Chất liệu sản phẩm" },
    { tag: "{carModels}", desc: "Dòng xe/Model xe tương thích" },
    { tag: "{dimensions}", desc: "Kích thước sản phẩm" },
    { tag: "{shortDescription}", desc: "Mô tả sơ bộ/Mô tả ngắn" },
    {
      tag: "{focusKeyword}",
      desc: "Từ khóa chính SEO (được tự động trích xuất từ tên sản phẩm)",
    },
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
          <Card
            bordered={true}
            className="shadow-sm bg-white dark:bg-[#1F1F1F]"
          >
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item
                label={
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Mô tả và hướng dẫn Prompt (System Prompt)
                  </span>
                }
                name="systemPrompt"
                required
                tooltip="Mẫu mô tả prompt hướng dẫn AI cách biên tập lại bài viết."
              >
                <Input.TextArea
                  ref={textareaRef}
                  rows={16}
                  placeholder="Hãy nhập Prompt chi tiết tại đây..."
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        AI Model
                      </span>
                    }
                    name="modelName"
                    required
                  >
                    <Select
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
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
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
                <Button onClick={handleResetDefault} icon={<UndoOutlined />}>
                  Đặt lại mặc định
                </Button>

                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
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
            bordered={true}
            className="shadow-sm bg-white dark:bg-[#1F1F1F]"
            title={
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Các biến tương thích
              </span>
            }
          >
            <Alert
              message="Chèn nhanh biến"
              description="Bấm vào tên biến hoặc nút cộng (+) để chèn nhanh vào vị trí con trỏ chuột trong ô soạn thảo Prompt."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="border-none bg-[#F6F7FB] dark:bg-slate-800/40 mb-4 text-xs"
            />

            <div className="space-y-4">
              {variables.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1.5 flex-1 pr-2">
                    <Tooltip title="Click để chèn vào prompt">
                      <Tag
                        color="red"
                        className="cursor-pointer hover:scale-102 active:scale-98 transition-transform font-bold font-mono px-2 py-0.5 border-none bg-red-50 text-[#C62828] dark:bg-red-950/20 dark:text-red-400"
                        onClick={() => handleInsertTag(v.tag)}
                      >
                        {v.tag}
                      </Tag>
                    </Tooltip>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {v.desc}
                    </span>
                  </div>
                  <Tooltip title="Chèn biến này">
                    <Button
                      type="text"
                      shape="circle"
                      size="small"
                      icon={
                        <PlusOutlined className="text-slate-400 hover:text-[#C62828]" />
                      }
                      onClick={() => handleInsertTag(v.tag)}
                    />
                  </Tooltip>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
