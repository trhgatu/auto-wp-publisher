import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Spin, Alert } from "antd";
import { axios } from "../../../lib/axios";
import { useNotification } from "../../../hooks/useNotification";
import { PageHeader } from "../../../components/shared/PageHeader";

export const WpSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    message: string;
  }>({ status: null, message: "" });
  const { notify } = useNotification();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/wp-settings");
      form.setFieldsValue(response.data);
    } catch (err) {
      console.error(err);
      notify("Lỗi", "Không thể tải cấu hình WordPress.", "error");
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
    setTestResult({ status: null, message: "" });
    try {
      await axios.post("/wp-settings", values);
      notify("Thành công", "Đã lưu cấu hình WordPress thành công.", "success");
    } catch (err) {
      console.error(err);
      notify("Lỗi", "Không thể lưu cấu hình WordPress.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields();
      setTesting(true);
      setTestResult({ status: null, message: "" });
      await axios.post("/wp-settings/test", values);
      setTestResult({
        status: "success",
        message: "Kết nối thành công tới WordPress REST API!",
      });
      notify("Kết nối OK", "Đã kết nối thành công tới WordPress.", "success");
    } catch (err) {
      console.error(err);
      setTestResult({
        status: "error",
        message:
          "Kết nối thất bại. Vui lòng kiểm tra lại URL và thông tin đăng nhập.",
      });
      notify("Lỗi kết nối", "Kết nối tới WordPress thất bại.", "error");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80">
        <Spin size="large" tip="Đang tải cấu hình WordPress..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <PageHeader
        title="Cấu hình WordPress"
        description="Quản lý đường dẫn kết nối REST API và thông tin xác thực để đăng bài tự động lên website."
        breadcrumbs={[{ title: "Cấu hình" }, { title: "WordPress" }]}
      />

      <Card
        bordered={true}
        className="shadow-sm bg-white dark:bg-[#1F1F1F] max-w-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
        >
          <Form.Item
            label={
              <span className="font-bold text-xs uppercase tracking-wider">
                WordPress API URL
              </span>
            }
            name="apiUrl"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập WordPress REST API URL",
              },
              { type: "url", message: "Đường dẫn không hợp lệ" },
            ]}
            tooltip="Đường dẫn REST API của WordPress. Ví dụ: https://yourdomain.com/wp-json"
          >
            <Input
              size="large"
              placeholder="https://yourdomain.com/wp-json"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-bold text-xs uppercase tracking-wider">
                Username / Email đăng nhập
              </span>
            }
            name="username"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên tài khoản quản trị",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="admin"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-bold text-xs uppercase tracking-wider">
                Application Password
              </span>
            }
            name="appPassword"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu ứng dụng WordPress",
              },
            ]}
            tooltip="Mật khẩu ứng dụng (Application Password) được tạo trong hồ sơ người dùng WordPress, không phải mật khẩu đăng nhập thông thường."
          >
            <Input.Password
              size="large"
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          {testResult.status && (
            <div className="mb-6">
              <Alert
                type={testResult.status}
                message={testResult.message}
                showIcon
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="primary"
              danger
              htmlType="submit"
              loading={saving}
              className="font-bold h-10 shadow-none"
            >
              Lưu cấu hình
            </Button>

            <Button
              onClick={handleTestConnection}
              loading={testing}
              className="font-bold h-10 shadow-none"
            >
              Kiểm tra kết nối
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
