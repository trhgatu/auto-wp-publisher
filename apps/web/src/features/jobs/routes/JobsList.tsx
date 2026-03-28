import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { getJobs } from "../api/getJobs";
import type { JobItem } from "../api/getJobs";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { JobsFilter } from "../components/JobsFilter";
import { Pagination } from "../../../components/shared/Pagination";
import { FileSpreadsheet } from "lucide-react";

export const JobsList = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 10;

  const fetchJobs = useCallback(
    async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const data = await getJobs({
          page,
          limit: pageSize,
          status: statusFilter || undefined,
        });

        // Defensive check: hỗ trợ cả cấu trúc cũ (array) và cấu trúc mới (object {items, total})
        if (Array.isArray(data)) {
          setJobs(data);
          setTotal(data.length);
        } else if (data && typeof data === "object") {
          setJobs(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [page, statusFilter],
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const interval = setInterval(() => fetchJobs(true), 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tiến độ Xuất Bản
          </h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi trạng thái các bài viết đang được lấy dữ liệu và lên lịch
            WordPress.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <JobsFilter
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          />
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-200 transition-all border border-emerald-500 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import Excel
          </button>
        </div>
      </div>

      <div className="glass rounded-xl shadow-sm overflow-hidden border border-border flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-x-auto">
          {jobs.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {statusFilter
                  ? `Không có bài viết nào ở trạng thái ${statusFilter}`
                  : "Bạn chưa có bài viết nào."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                <tr className="border-b border-border">
                  <th className="px-6 py-4 font-bold">Tên Bài Viết</th>
                  <th className="px-6 py-4 font-bold text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-bold">Cập nhật lúc</th>
                  <th className="px-6 py-4 font-bold">Log (Nếu lỗi)</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground max-w-md truncate">
                      {job.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(job.updatedAt).toLocaleTimeString("vi-VN")} -{" "}
                      {new Date(job.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      {job.status === "FAILED" && job.errorLog ? (
                        <span
                          className="text-rose-400 text-xs line-clamp-1"
                          title={job.errorLog}
                        >
                          {job.errorLog}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30 text-center block">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={page}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={fetchJobs}
      />
    </div>
  );
};
