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
            <Button type="primary">Quay lại danh sách</Button>
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
        description="Xem chi tiết nội dung, thuộc tính và liên kết xuất bản của sản phẩm."
        breadcrumbs={[
          { title: "Workspace" },
          { title: "Kho sản phẩm", href: "/jobs" },
          { title: job.sku || job.id.slice(0, 8) },
        ]}
        extra={
          job.wpUrl ? (
            <Button
              type="primary"
              danger
              href={job.wpUrl}
              target="_blank"
              rel="noreferrer"
              size="large"
              className="font-bold text-xs uppercase tracking-tight"
            >
              Xem trên website
            </Button>
          ) : null
        }
      />

      {/* 2. Key stats in a single premium card */}
      <Card
        bordered={true}
        className="shadow-sm bg-white dark:bg-[#1F1F1F]"
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Row gutter={[16, 24]} align="middle">
          <Col
            xs={12}
            sm={6}
            className="sm:border-r border-[#ECECEC] dark:border-[#303030]"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C8C] block mb-1">
              Trạng thái
            </span>
            <JobStatusBadge status={job.status} />
          </Col>
          <Col
            xs={12}
            sm={6}
            className="sm:border-r border-[#ECECEC] dark:border-[#303030] sm:pl-6"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C8C] block mb-1">
              Giá niêm yết
            </span>
            <span className="text-base font-bold text-[#C62828]">
              {job.price
                ? `${Number(job.price).toLocaleString("vi-VN")}đ`
                : "Chưa có"}
            </span>
          </Col>
          <Col
            xs={12}
            sm={6}
            className="sm:border-r border-[#ECECEC] dark:border-[#303030] sm:pl-6"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C8C] block mb-1">
              Mã SKU
            </span>
            <span className="text-base font-bold text-[#262626] dark:text-[#E5E5E5]">
              {job.sku || "-"}
            </span>
          </Col>
          <Col xs={12} sm={6} className="sm:pl-6">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C8C] block mb-1">
              Ngày cập nhật
            </span>
            <span className="text-base font-bold text-[#262626] dark:text-[#E5E5E5]">
              {new Date(job.updatedAt).toLocaleDateString("vi-VN")}
            </span>
          </Col>
        </Row>
      </Card>

      {/* 3. Main layout content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={true}
            className="shadow-sm overflow-hidden bg-white dark:bg-[#1F1F1F]"
            bodyStyle={{ padding: "0 24px 24px 24px" }}
          >
            <Tabs
              defaultActiveKey="content"
              items={[
                {
                  key: "content",
                  label: (
                    <span className="uppercase tracking-tight text-xs font-bold">
                      Nội dung gốc
                    </span>
                  ),
                  children: (
                    <div className="pt-6 space-y-6">
                      {job.shortDescription && (
                        <Alert
                          message={
                            <div className="font-bold text-[#262626] dark:text-[#E5E5E5] text-xs mb-1 uppercase tracking-wider">
                              Mô tả ngắn sản phẩm
                            </div>
                          }
                          description={
                            <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                              {job.shortDescription}
                            </div>
                          }
                          type="info"
                          showIcon={false}
                          className="border-none bg-slate-50 dark:bg-slate-800/40"
                        />
                      )}

                      <div
                        className="prose prose-sm max-w-none antialiased dark:prose-invert prose-slate dark:text-slate-300
                          prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight
                          prose-table:border prose-table:border-slate-100 dark:prose-table:border-slate-800 prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-slate-50 dark:prose-td:border-slate-800/50"
                        dangerouslySetInnerHTML={{
                          __html: job.description || job.rawContent || "",
                        }}
                      />

                      {!job.description &&
                        !job.rawContent &&
                        !job.shortDescription && (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
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
                      Nội dung AI
                    </span>
                  ),
                  children: (
                    <div className="pt-6">
                      {job.aiContent ? (
                        <Card
                          bordered={true}
                          style={{ background: "rgba(0,0,0,0.01)" }}
                        >
                          <div className="text-[13px] text-[#262626] dark:text-[#E5E5E5] whitespace-pre-wrap leading-loose font-medium">
                            {job.aiContent}
                          </div>
                        </Card>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
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
                      Thư viện ảnh
                    </span>
                  ),
                  children: (
                    <div className="pt-6">
                      {galleryImages.length > 0 ? (
                        <Image.PreviewGroup>
                          <Row gutter={[16, 16]}>
                            {galleryImages.map((url, i) => (
                              <Col xs={12} sm={8} md={6} key={i}>
                                <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-[#ECECEC] dark:border-[#303030] overflow-hidden flex items-center justify-center relative p-2">
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
            bordered={true}
            className="shadow-sm bg-white dark:bg-[#1F1F1F]"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-[#262626] dark:text-[#E5E5E5]">
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
                    className="text-[#C62828] font-bold hover:underline"
                  >
                    Xem sản phẩm
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
            bordered={true}
            className="shadow-sm bg-white dark:bg-[#1F1F1F]"
            title={
              <span className="text-xs font-bold uppercase tracking-wider text-[#262626] dark:text-[#E5E5E5]">
                Liên kết sàn
              </span>
            }
          >
            <List
              size="small"
              dataSource={[
                { label: "Shopee", link: job.shopeeLink },
                { label: "Lazada", link: job.lazadaLink },
                { label: "TikTok Shop", link: job.tiktokLink },
                { label: "YouTube Video", link: job.videoUrl },
              ].filter((item) => item.link)}
              renderItem={(item) => (
                <List.Item>
                  <Button
                    type="link"
                    href={item.link || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="p-0 font-bold uppercase text-xs flex items-center justify-between w-full"
                  >
                    <span className="text-[#262626] dark:text-[#E5E5E5]">
                      {item.label}
                    </span>
                    <span>Link</span>
                  </Button>
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <span className="text-[11px] text-[#8C8C8C] italic">
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
                <div className="font-bold text-rose-900 dark:text-rose-400 uppercase tracking-widest text-xs">
                  Chi tiết lỗi
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
