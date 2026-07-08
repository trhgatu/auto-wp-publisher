import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Tabs,
  Image,
  Descriptions,
  List,
  Tag,
  Alert,
  Spin,
  Result,
} from "antd";
import {
  ArrowLeftOutlined,
  GlobalOutlined,
  LinkOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  HistoryOutlined,
  FileTextOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { useJob } from "../hooks/useJob";
import { JobStatusBadge } from "../components/JobStatusBadge";

import { PageHeader } from "../../../components/shared/PageHeader";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80">
        <Spin size="large" tip="Đang tải chi tiết..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <Result
        status="404"
        title="Không tìm thấy sản phẩm"
        subTitle={
          (error as { message?: string })?.message ||
          "Sản phẩm hoặc dữ liệu không tồn tại trên hệ thống."
        }
        extra={
          <Link to="/jobs">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              Quay lại danh sách
            </Button>
          </Link>
        }
      />
    );
  }

  const galleryImages = [
    ...(job.imageUrl ? [job.imageUrl] : []),
    ...(job.galleryImageUrls
      ? job.galleryImageUrls.split(",").map((u) => u.trim())
      : []),
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* 1. Header Card */}
      <PageHeader
        title={job.name}
        breadcrumbs={[
          { title: "Workspace" },
          { title: "Kho sản phẩm", href: "/jobs" },
          { title: job.sku || job.id.slice(0, 8) },
        ]}
        icon={
          <Link to="/jobs" className="text-red-600 dark:text-red-500">
            <ArrowLeftOutlined />
          </Link>
        }
        extra={
          job.wpUrl ? (
            <Button
              type="primary"
              danger
              icon={<GlobalOutlined />}
              href={job.wpUrl}
              target="_blank"
              rel="noreferrer"
              size="large"
              className="font-bold text-xs uppercase tracking-tight"
            >
              Xem trên website <LinkOutlined />
            </Button>
          ) : null
        }
      />

      {/* 2. Key stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Trạng thái
            </span>
            <JobStatusBadge status={job.status} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              <ShoppingCartOutlined /> Giá niêm yết
            </span>
            <span className="text-sm font-black text-red-600 dark:text-red-500">
              {job.price
                ? `${Number(job.price).toLocaleString("vi-VN")}đ`
                : "Chưa có"}
            </span>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              <TagOutlined /> Mã SKU
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {job.sku || "-"}
            </span>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              <HistoryOutlined /> Ngày cập nhật
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {new Date(job.updatedAt).toLocaleDateString("vi-VN")}
            </span>
          </Card>
        </Col>
      </Row>

      {/* 3. Main layout content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="shadow-sm overflow-hidden"
            bodyStyle={{ padding: "0 24px 24px 24px" }}
          >
            <Tabs
              defaultActiveKey="content"
              items={[
                {
                  key: "content",
                  label: (
                    <span className="uppercase tracking-tight text-xs font-bold">
                      <FileTextOutlined /> Nội dung gốc
                    </span>
                  ),
                  children: (
                    <div className="pt-6 space-y-6">
                      {job.shortDescription && (
                        <Alert
                          message={
                            <div className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-1 uppercase tracking-wider">
                              Mô tả ngắn sản phẩm
                            </div>
                          }
                          description={
                            <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                              {job.shortDescription}
                            </div>
                          }
                          type="info"
                          showIcon
                          className="border-none bg-slate-50 dark:bg-slate-800/40"
                        />
                      )}

                      <div
                        className="prose prose-sm max-w-none antialiased dark:prose-invert prose-slate dark:text-slate-300
                          prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                          prose-table:border prose-table:border-slate-100 dark:prose-table:border-slate-800 prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-slate-50 dark:prose-td:border-slate-800/50"
                        dangerouslySetInnerHTML={{
                          __html: job.description || job.rawContent || "",
                        }}
                      />

                      {!job.description &&
                        !job.rawContent &&
                        !job.shortDescription && (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                            <FileTextOutlined className="text-4xl mb-2 opacity-20" />
                            <p className="italic text-sm">
                              Chưa có thông tin mô tả chi tiết.
                            </p>
                          </div>
                        )}
                    </div>
                  ),
                },
                {
                  key: "ai",
                  label: (
                    <span className="uppercase tracking-tight text-xs font-bold">
                      <ThunderboltOutlined /> Nội dung AI
                    </span>
                  ),
                  children: (
                    <div className="pt-6">
                      {job.aiContent ? (
                        <Card
                          bordered={false}
                          style={{ background: "rgba(0,0,0,0.02)" }}
                        >
                          <div className="text-[13px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-loose font-medium">
                            {job.aiContent}
                          </div>
                        </Card>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                          <ThunderboltOutlined className="text-4xl mb-2 opacity-20" />
                          <p className="italic text-sm">
                            Sản phẩm này chưa được xử lý bởi trợ lý AI.
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "gallery",
                  label: (
                    <span className="uppercase tracking-tight text-xs font-bold">
                      <PictureOutlined /> Thư viện ảnh
                    </span>
                  ),
                  children: (
                    <div className="pt-6">
                      {galleryImages.length > 0 ? (
                        <Image.PreviewGroup>
                          <Row gutter={[16, 16]}>
                            {galleryImages.map((url, i) => (
                              <Col xs={12} sm={8} md={6} key={i}>
                                <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative group p-2">
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Image
                                      src={url}
                                      style={{
                                        objectFit: "contain",
                                        maxHeight: "100%",
                                        maxWidth: "100%",
                                      }}
                                    />
                                  </div>
                                  {i === 0 && job.imageUrl && (
                                    <Tag
                                      color="red"
                                      className="absolute top-2 left-2 m-0 uppercase tracking-widest text-[8px] font-black"
                                    >
                                      Ảnh bìa
                                    </Tag>
                                  )}
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </Image.PreviewGroup>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                          <PictureOutlined className="text-4xl mb-2 opacity-20" />
                          <p className="italic text-sm">
                            Sản phẩm không có ảnh thư viện.
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8} className="space-y-6">
          {/* Attributes */}
          <Card
            bordered={false}
            className="shadow-sm"
            title={
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Thuộc tính kỹ thuật
              </span>
            }
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Chất liệu">
                {job.material || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dòng xe / Model">
                {job.carModels || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="WP Post ID">
                {job.wpPostId || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="WP Link">
                {job.wpUrl ? (
                  <a
                    href={job.wpUrl || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600 dark:text-red-500 font-bold hover:underline"
                  >
                    Xem sản phẩm <LinkOutlined />
                  </a>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="System UUID">
                <span className="font-mono text-[9px] opacity-60 break-all">
                  {job.id}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Social / Ecommerce links */}
          <Card
            bordered={false}
            className="shadow-sm"
            title={
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                Liên kết sàn
              </span>
            }
          >
            <List
              size="small"
              dataSource={[
                { label: "Shopee", link: job.shopeeLink, color: "orange" },
                { label: "Lazada", link: job.lazadaLink, color: "blue" },
                {
                  label: "TikTok Shop",
                  link: job.tiktokLink,
                  color: "default",
                },
                {
                  label: "YouTube Video",
                  link: job.videoUrl,
                  color: "red",
                  icon: <YoutubeOutlined />,
                },
              ].filter((item) => item.link)}
              renderItem={(item) => (
                <List.Item>
                  <Button
                    type="link"
                    href={item.link || undefined}
                    target="_blank"
                    rel="noreferrer"
                    icon={item.icon || <GlobalOutlined />}
                    className="p-0 font-bold uppercase text-xs flex items-center justify-between w-full"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <LinkOutlined />
                  </Button>
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <span className="text-[11px] text-slate-400 italic">
                    Không có liên kết mở rộng.
                  </span>
                ),
              }}
            />
          </Card>

          {/* Error Log */}
          {job.status === "FAILED" && job.errorLog && (
            <Alert
              message={
                <div className="font-bold text-rose-900 dark:text-rose-400 uppercase tracking-widest text-xs flex items-center gap-2">
                  <WarningOutlined /> Chi tiết lỗi
                </div>
              }
              description={
                <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-white/60 dark:bg-slate-900/50 p-4 rounded border border-rose-100 dark:border-rose-500/20 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono mt-2">
                  {job.errorLog}
                </div>
              }
              type="error"
              showIcon={false}
              className="border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20"
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
