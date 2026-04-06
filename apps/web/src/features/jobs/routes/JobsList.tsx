import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, Search, FileSpreadsheet } from "lucide-react";
import { useJobs } from "../hooks/useJobs";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { JobsFilter } from "../components/JobsFilter";
import { Pagination } from "../../../components/shared/Pagination";
import { Button } from "../../../components/shared/Button";

export const JobsList = () => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 10;

  // Xử lý Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset về trang 1 khi tìm kiếm
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useJobs({
    page,
    limit: pageSize,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const jobs = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative z-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-soft">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tiến độ Xuất Bản
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Theo dõi trạng thái các bài viết đang được lấy dữ liệu và lên lịch
            WordPress.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <JobsFilter
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            />
            <Button
              variant="emerald"
              onClick={() => setImportModalOpen(true)}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Import Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl shadow-sm overflow-hidden border border-border flex flex-col min-h-[400px] relative">
        {/* Loading Overlay */}
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white/80 p-3 rounded-full shadow-lg border border-white/50">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-x-auto">
          {jobs.length === 0 && !isLoading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {statusFilter
                  ? `Không có bài viết nào ở trạng thái ${statusFilter}`
                  : search 
                    ? `Không tìm thấy kết quả cho "${search}"`
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
                      <Link to={`/jobs/${job.id}`} className="hover:underline text-blue-600">
                        {job.name}
                      </Link>
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
      />
    </div>
  );
};
