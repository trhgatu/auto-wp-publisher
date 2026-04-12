import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCw,
  Package,
  ExternalLink,
  ShieldCheck,
  Tag,
  ShoppingCart,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Globe,
  Zap,
  History,
} from "lucide-react";
import { useJob } from "../hooks/useJob";
import { Button } from "../../../components/shared/Button";
import { clsx } from "clsx";

type TabType = "content" | "ai" | "gallery" | "raw";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id);
  const [activeTab, setActiveTab] = useState<TabType>("content");

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80">
        <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
        <p className="mt-4 text-slate-400 text-sm">Đang tải chi tiết...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center text-center max-w-2xl mx-auto mt-10 transition-colors">
        <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {(error as { message?: string })?.message || "Dữ liệu không tồn tại."}
        </p>
        <Link to="/jobs">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Xuất bản",
          color:
            "text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-500/10 border-green-100 dark:border-emerald-500/20",
          icon: ShieldCheck,
        };
      case "PENDING":
        return {
          label: "Chờ xử lý",
          color:
            "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
          icon: Clock,
        };
      case "PROCESSING":
        return {
          label: "Đang xử lý",
          color:
            "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
          icon: RefreshCw,
        };
      case "FAILED":
        return {
          label: "Lỗi",
          color:
            "text-red-600 dark:text-rose-400 bg-red-50 dark:bg-rose-500/10 border-red-100 dark:border-rose-500/20",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color:
            "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700",
          icon: Package,
        };
    }
  };

  const status = getStatusDisplay(job.status);

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* 1. CLEAN HEADER (Antd Style) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <Link
            to="/jobs"
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-0.5 font-medium">
              <span>Kho sản phẩm</span>
              <ChevronRight className="w-3 h-3" />
              <span>{job.sku || job.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {job.name}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Trạng thái",
            value: status.label,
            color: status.color,
            icon: status.icon,
          },
          {
            label: "Giá niêm yết",
            value: job.price
              ? `${Number(job.price).toLocaleString()}đ`
              : "Chưa có",
            icon: ShoppingCart,
          },
          { label: "Mã SKU", value: job.sku || "-", icon: Tag },
          {
            label: "Ngày cập nhật",
            value: new Date(job.updatedAt).toLocaleDateString("vi-VN"),
            icon: History,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1.5">
              <item.icon className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-bold">
                {item.label}
              </span>
            </div>
            <div
              className={clsx(
                "text-[13px] font-bold",
                item.color
                  ? item.color.split(" ")[0]
                  : "text-slate-800 dark:text-slate-200",
              )}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 3. MAIN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main Tabs) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          {/* Ant-style Tabs Header */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            {(
              [
                { id: "content", label: "Nội dung gốc", icon: FileText },
                { id: "ai", label: "Nội dung AI", icon: Zap },
                { id: "gallery", label: "Thư viện ảnh", icon: ImageIcon },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-6 py-4 text-xs font-bold transition-all relative flex items-center gap-2 uppercase tracking-tight",
                  activeTab === tab.id
                    ? "text-red-600 dark:text-red-500 bg-white dark:bg-slate-900"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                )}
              >
                <tab.icon
                  className={clsx(
                    "w-3.5 h-3.5",
                    activeTab === tab.id
                      ? "text-red-600 dark:text-red-500"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 dark:bg-red-500" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8 min-h-[450px]">
            {activeTab === "content" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                {job.description || job.rawContent ? (
                  <div className="space-y-6">
                    {/* Render as HTML if it contains tags, otherwise fallback to text */}
                    <div
                      className="prose prose-sm max-w-none antialiased
                        dark:prose-invert prose-slate dark:text-slate-300
                        prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                        prose-table:border prose-table:border-slate-100 dark:prose-table:border-slate-800 prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-slate-50 dark:prose-td:border-slate-800/50"
                      dangerouslySetInnerHTML={{
                        __html: job.description || job.rawContent || "",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                    <FileText className="w-10 h-10 mb-2 opacity-20" />
                    <p className="italic text-sm">
                      Chưa có thông tin mô tả chi tiết.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                {job.aiContent ? (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50 relative">
                    <div className="text-[13px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-loose font-medium">
                      {job.aiContent}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                    <Zap className="w-8 h-8 mb-2 opacity-20" />
                    <p className="italic text-sm">
                      Sản phẩm này chưa được xử lý bởi trợ lý AI.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {job.imageUrl && (
                    <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer ring-offset-2 hover:ring-2 hover:ring-red-100 dark:hover:ring-red-900/50 transition-all relative">
                      <img
                        src={job.imageUrl}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                        Ảnh bìa
                      </div>
                    </div>
                  )}
                  {job.galleryImageUrls?.split(",").map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden group cursor-pointer ring-offset-2 hover:ring-2 hover:ring-red-100 dark:hover:ring-red-900/50 transition-all"
                    >
                      <img
                        src={url.trim()}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "raw" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="bg-slate-900 dark:bg-black/40 rounded-lg p-6 border dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 dark:border-slate-800/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Raw Data (Crawler Output)
                    </span>
                    <History className="w-3 h-3 text-slate-700 dark:text-slate-600" />
                  </div>
                  <pre className="text-[11px] text-emerald-400/90 font-mono whitespace-pre-wrap break-all leading-relaxed">
                    {job.rawContent || "Không tìm thấy dữ liệu thô từ Crawler."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Side Info) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
              Thuộc tính kỹ thuật
            </h3>
            <div className="space-y-5">
              {[
                { label: "Chất liệu", value: job.material, icon: FileText },
                {
                  label: "Dòng xe / Model",
                  value: job.carModels,
                  icon: Package,
                },
                { label: "WP Post ID", value: job.wpPostId, icon: Globe },
                { label: "System UUID", value: job.id, mono: true, icon: Tag },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="mt-0.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    <item.icon className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                      {item.label}
                    </span>
                    <span
                      className={clsx(
                        "text-xs font-bold text-slate-700 dark:text-slate-300 truncate",
                        item.mono && "font-mono opacity-60 text-[9px]",
                      )}
                    >
                      {item.value || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
              Liên kết sàn
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  label: "Shopee",
                  link: job.shopeeLink,
                  color:
                    "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 border-orange-100 dark:border-orange-500/20",
                },
                {
                  label: "Lazada",
                  link: job.lazadaLink,
                  color:
                    "text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
                },
                {
                  label: "TikTok Shop",
                  link: job.tiktokLink,
                  color:
                    "text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700",
                },
                {
                  label: "YouTube Video",
                  link: job.videoUrl,
                  color:
                    "text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-100 dark:border-red-500/20",
                },
              ].map(
                (m, i) =>
                  m.link && (
                    <a
                      key={i}
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      className={clsx(
                        "flex items-center justify-between px-4 py-3 rounded-md border text-[11px] font-bold transition-all group",
                        m.color,
                      )}
                    >
                      <span className="flex items-center gap-2 uppercase tracking-tight">
                        {m.label}
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ),
              )}
              {!job.shopeeLink &&
                !job.lazadaLink &&
                !job.tiktokLink &&
                !job.videoUrl && (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    Không có liên kết mở rộng.
                  </p>
                )}
            </div>
          </div>

          {job.status === "FAILED" && job.errorLog && (
            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-lg border border-rose-100 dark:border-rose-500/20 p-6 relative overflow-hidden transition-all hover:bg-rose-100/50 dark:hover:bg-rose-500/20">
              <h3 className="text-[10px] font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Chi tiết lỗi
              </h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 bg-white/60 dark:bg-slate-900/50 p-4 rounded border border-rose-100 dark:border-rose-500/20 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-medium">
                {job.errorLog}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
