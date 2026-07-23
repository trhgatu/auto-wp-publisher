import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Alert,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import {
  SendOutlined,
  FileTextOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ImportProductSchema } from "@repo/shared";
import type { ImportProductDto } from "@repo/shared";
import { createJob } from "../api/createJob";
import { uploadImage } from "../api/uploadImage";
import { PageHeader } from "../../../components/shared/PageHeader";

export const CreateJob = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    setLoading(true);
    setApiError(null);

    const payload = {
      title: values.title,
      baseDescription: values.baseDescription,
      category: values.category,
      tags: values.tags,
      ...(values.sku ? { sku: values.sku } : {}),
      ...(values.sourceUrl ? { sourceUrl: values.sourceUrl } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(galleryUrls.length > 0
        ? { galleryImageUrls: galleryUrls.join(", ") }
        : {}),
    };

    // Use safeParse to avoid class Monorepo issues
    const result = ImportProductSchema.safeParse(payload);

    if (!result.success) {
      // If validation fails, set errors on form fields
      const fieldErrors = result.error.errors.map((e) => ({
        name: e.path[0] as string,
        errors: [e.message],
      }));
      form.setFields(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await createJob(payload as ImportProductDto);
      navigate("/");
    } catch {
      setApiError("Có lỗi xảy ra khi gọi máy chủ API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Tạo Bài Viết Mới"
        breadcrumbs={[
          { title: "Workspace" },
          { title: "Quản lý Job", href: "/jobs" },
          { title: "Tạo mới" },
        ]}
        icon={
          <Link to="/jobs" className="text-red-600 dark:text-red-500">
            <ArrowLeftOutlined />
          </Link>
        }
      />

      {apiError && (
        <Alert
          message={apiError}
          type="error"
          showIcon
          closable
          onClose={() => setApiError(null)}
        />
      )}

      <Card bordered={false} className="shadow-sm border-t-2 border-red-500">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: "",
            sku: "",
            baseDescription: "",
            category: "Phụ tùng ô tô",
            sourceUrl: "",
            tags: "",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tiêu đề"
                name="title"
                required
                tooltip="Tiêu đề bài viết hoặc sản phẩm"
              >
                <Input
                  prefix={<FileTextOutlined className="text-slate-400" />}
                  placeholder="VD: Review Laptop XYZ"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Mã Bài Viết (Tùy chọn)" name="sku">
                <Input placeholder="SKU-1234..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả sơ bộ"
            name="baseDescription"
            required
            tooltip="Nêu ngắn gọn các ý chính muốn thể hiện trong bài viết này"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nêu ngắn gọn các ý chính muốn thể hiện trong bài viết này..."
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Link Nguồn tham khảo (Tùy chọn)"
                name="sourceUrl"
              >
                <Input
                  prefix={<LinkOutlined className="text-slate-400" />}
                  placeholder="https://..."
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Danh mục WordPress" name="category">
                <Input
                  placeholder="VD: Phụ tùng ô tô, Đồ chơi xe..."
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Thẻ (Tags)" name="tags">
                <Input placeholder="tag1, tag2, tag3..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Ảnh đại diện sản phẩm"
                tooltip="Tải ảnh chính lên WordPress Media Library"
              >
                <Upload
                  name="file"
                  listType="picture-card"
                  showUploadList={false}
                  customRequest={async ({ file, onSuccess, onError }) => {
                    setUploadingMain(true);
                    try {
                      const url = await uploadImage(file as File);
                      setImageUrl(url);
                      onSuccess?.(url);
                      message.success(
                        "Tải ảnh đại diện lên WordPress thành công!",
                      );
                    } catch (err) {
                      onError?.(err as Error);
                      message.error("Lỗi khi tải ảnh lên WordPress.");
                    } finally {
                      setUploadingMain(false);
                    }
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined
                        style={{ fontSize: "24px", color: "#8c8c8c" }}
                      />
                      <div style={{ marginTop: 8 }}>
                        {uploadingMain ? "Đang tải..." : "Tải ảnh từ máy"}
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Thư viện ảnh phụ"
                tooltip="Tải nhiều ảnh phụ lên WordPress Media Library"
              >
                <Upload
                  name="file"
                  listType="picture"
                  multiple
                  fileList={galleryUrls.map((url, i) => ({
                    uid: `${i}`,
                    name: `Ảnh phụ ${i + 1}`,
                    status: "done",
                    url: url,
                  }))}
                  onRemove={(file) => {
                    const index = galleryUrls.indexOf(file.url || "");
                    if (index > -1) {
                      const newUrls = [...galleryUrls];
                      newUrls.splice(index, 1);
                      setGalleryUrls(newUrls);
                    }
                  }}
                  customRequest={async ({ file, onSuccess, onError }) => {
                    setUploadingGallery(true);
                    try {
                      const url = await uploadImage(file as File);
                      setGalleryUrls((prev) => [...prev, url]);
                      onSuccess?.(url);
                      message.success("Tải ảnh phụ lên WordPress thành công!");
                    } catch (err) {
                      onError?.(err as Error);
                      message.error("Lỗi khi tải ảnh lên WordPress.");
                    } finally {
                      setUploadingGallery(false);
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={uploadingGallery}>
                    Tải ảnh từ máy
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Alert
              message="Bài viết sẽ được AI tự động biên tập và đẩy lên Web."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="border-none bg-slate-50 dark:bg-slate-800/40 p-2 text-xs flex-grow"
            />

            <Button
              type="primary"
              danger
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
              className="font-bold text-xs uppercase tracking-tight w-full sm:w-auto"
            >
              Gửi Hệ Thống & Đăng Ngay
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
