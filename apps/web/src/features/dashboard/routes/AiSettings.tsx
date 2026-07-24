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

  const [models, setModels] = useState<{ label: string; value: string }[]>([]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, modelsRes] = await Promise.all([
        axios.get("/ai-settings"),
        axios.get("/ai-settings/models"),
      ]);
      form.setFieldsValue(settingsRes.data);
      if (
        modelsRes.data &&
        Array.isArray(modelsRes.data) &&
        modelsRes.data.length > 0
      ) {
        setModels(modelsRes.data);
      }
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
      systemPrompt: `Bạn là một chuyên gia viết nội dung mô tả sản phẩm phụ tùng ô tô tối ưu SEO chuyên sâu.
Hãy viết một bài mô tả sản phẩm ĐẦY ĐỦ, CHI TIẾT và CHUYÊN NGHIỆP bằng tiếng Việt với độ dài khoảng 600 - 800 từ (định dạng HTML chuẩn, chỉ sử dụng thẻ <p>, <h3>, <ul>, <li>, <strong>, <em>, tuyệt đối không dùng thẻ <html> hay <body>).

Thông tin sản phẩm:
- Tên sản phẩm: {title}
- Mã phụ tùng (SKU): {sku}
- Chất liệu: {material}
- Dòng xe tương thích: {carModels}
- Kích thước: {dimensions}
- Ghi chú: {shortDescription}
- Từ khóa SEO chính: {focusKeyword}

Bắt buộc triển khai bài viết theo 5 phần chi tiết sau để đạt tối thiểu 600 - 800 từ:
1. <h3>1. Tổng quan & Vai trò của {title}</h3>
   Viết đoạn văn phân tích tầm quan trọng của sản phẩm trong vận hành ô tô. BẮT BUỘC chứa từ khóa "{focusKeyword}" ngay ở 50 từ đầu tiên.
2. <h3>2. Thông số kỹ thuật & Chất liệu cấu thành</h3>
   Phân tích chi tiết chất liệu {material}, độ bền, tiêu chuẩn sản xuất và độ chịu nhiệt/chịu lực.
3. <h3>3. Dòng xe tương thích & Ưu điểm vượt trội</h3>
   Trình bày rõ tương thích với {carModels}, khớp form zin 100%, chống mài mòn và tiết kiệm chi phí sửa chữa dài hạn.
4. <h3>4. Hướng dẫn lắp đặt & Thời điểm cần thay thế</h3>
   Cung cấp các dấu hiệu cho thấy cần bảo dưỡng/thay thế phụ tùng và lưu ý khi thao tác lắp đặt.
5. <h3>5. Cam kết chất lượng & Chính sách đổi trả</h3>
   Khẳng định chất lượng hàng mới 100%, bảo hành uy tín và hỗ trợ đổi trả nếu có lỗi sản xuất.`,
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
                      placeholder="Chọn AI Model..."
                      options={
                        models.length > 0
                          ? models
                          : [
                              {
                                label: "Gemini 2.5 Flash (Khuyên dùng)",
                                value: "gemini-2.5-flash",
                              },
                              {
                                label: "Gemini 2.0 Flash",
                                value: "gemini-2.0-flash",
                              },
                              {
                                label: "Gemini 1.5 Flash",
                                value: "gemini-1.5-flash-latest",
                              },
                            ]
                      }
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
