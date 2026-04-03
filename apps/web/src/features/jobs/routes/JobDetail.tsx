import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { getJobById } from "../api/getJobById";
import type { JobDetailItem } from "../api/getJobById";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getJobById(id);
        setJob(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load job details.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center shadow-sm">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Job not found"}
      </div>
    );
  }

  const getStatusBadge = (status: JobDetailItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Thống nhất
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1.5" /> Chờ xử lý
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> Đang xử lý
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1.5" /> Thất bại
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {job.name}
          </h1>
        </div>
        {getStatusBadge(job.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: General Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Thông tin chung
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">ID:</dt>
                <dd className="font-medium text-gray-900 text-right truncate pl-4">
                  {job.id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">SKU:</dt>
                <dd className="font-medium text-gray-900">{job.sku || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Giá:</dt>
                <dd className="font-medium text-gray-900">{job.price || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Chất liệu:</dt>
                <dd className="font-medium text-gray-900 truncate pl-4">
                  {job.material || "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">WP Post ID:</dt>
                <dd className="font-medium text-gray-900">{job.wpPostId || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Tạo lúc:</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(job.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Cập nhật lúc:</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(job.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {(job.shopeeLink || job.lazadaLink || job.tiktokLink) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Liên kết Affiliate
              </h3>
              <div className="space-y-3">
                {job.shopeeLink && (
                  <a
                    href={job.shopeeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center text-sm text-blue-600 hover:underline"
                  >
                    <span>Shopee</span>
                    <span className="text-gray-400">↗</span>
                  </a>
                )}
                {job.lazadaLink && (
                  <a
                    href={job.lazadaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center text-sm text-blue-600 hover:underline"
                  >
                    <span>Lazada</span>
                    <span className="text-gray-400">↗</span>
                  </a>
                )}
                {job.tiktokLink && (
                  <a
                    href={job.tiktokLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center text-sm text-blue-600 hover:underline"
                  >
                    <span>TikTok Shop</span>
                    <span className="text-gray-400">↗</span>
                  </a>
                )}
              </div>
            </div>
          )}
          
          {job.status === "FAILED" && job.errorLog && (
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Lỗi (Error Log)
              </h3>
              <div className="text-sm text-red-700 bg-red-100 p-3 rounded-md overflow-auto max-h-48 whitespace-pre-wrap">
                {job.errorLog}
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Content */}
        <div className="lg:col-span-2 space-y-6">
          {job.imageUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <img 
                 src={job.imageUrl} 
                 alt={job.name} 
                 className="w-full max-h-96 object-cover bg-gray-50"
               />
            </div>
          )}
        
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Mô tả / Nội dung gốc
            </h3>
            {job.description || job.rawContent ? (
              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                {job.description && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Description</h4>
                    <div className="whitespace-pre-wrap leading-relaxed">{job.description}</div>
                  </div>
                )}
                {job.rawContent && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 mt-4">Raw Content</h4>
                    <div className="whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg text-xs font-mono">{job.rawContent}</div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Không có nội dung</p>
            )}
          </div>

          {job.aiContent && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4 border-b border-indigo-200 pb-2">
                Nội dung tạo bởi AI
              </h3>
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                {job.aiContent}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
