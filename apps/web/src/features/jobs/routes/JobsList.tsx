import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  Search,
  FileSpreadsheet,
  Package,
  PlusCircle,
} from "lucide-react";
import { useJobs } from "../hooks/useJobs";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { JobsFilter } from "../components/JobsFilter";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { Pagination } from "../../../components/shared/Pagination";
import { Button } from "../../../components/shared/Button";

export const JobsList = () => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useJobs({
    page,
    limit: pageSize,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const jobs = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Unified Control Center */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Row 1: Brand & Core Actions */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center border border-red-100 dark:border-red-500/20">
              <Package className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                Kho Sản Phẩm
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                phutungoto123.vn • Quản lý xuất bản
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setImportModalOpen(true)}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              className="bg-red-600 hover:bg-red-700 text-white border-none font-bold px-5 h-10 shadow-none transition-all active:scale-95"
            >
              Import Excel
            </Button>

            <Link to="/create">
              <Button
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-red-600 hover:bg-red-700 text-white border-none px-6 font-bold h-10 shadow-none transition-all active:scale-95"
              >
                Thêm mới
              </Button>
            </Link>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-6 transition-colors"></div>
        <div className="px-6 py-5 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col xl:flex-row items-center gap-4 transition-colors">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-red-600 dark:group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-red-600/5 dark:focus:ring-red-500/10 focus:border-red-600 dark:focus:border-red-500 hover:border-slate-300 dark:hover:border-slate-700 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(val) => {
                  setStartDate(val);
                  setPage(1);
                }}
                onEndDateChange={(val) => {
                  setEndDate(val);
                  setPage(1);
                }}
              />
              <div className="h-4 w-px bg-slate-100 dark:bg-slate-800"></div>
              <JobsFilter
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col min-h-[400px] relative transition-colors">
        {/* Loading Overlay */}
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 z-20 bg-white/40 dark:bg-slate-900/40 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-full border border-slate-100 dark:border-slate-700">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
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
              <thead className="text-[10px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 transition-colors">
                <tr>
                  <th className="px-6 py-3 font-black w-14">Ảnh</th>
                  <th className="px-6 py-3 font-black">Tên Sản Phẩm</th>
                  <th className="px-6 py-3 font-black">SKU</th>
                  <th className="px-6 py-3 font-black text-right">Giá bán</th>
                  <th className="px-6 py-3 font-black text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 font-black">Cập nhật lúc</th>
                  <th className="px-6 py-3 font-black">Nhật ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 transition-colors">
                        {job.imageUrl ? (
                          <img
                            src={job.imageUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-30">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 max-w-[180px] xl:max-w-[250px]">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 transition-colors block truncate uppercase tracking-tight text-xs"
                        title={job.name}
                      >
                        {job.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {job.sku || "-"}
                    </td>
                    <td className="px-6 py-3 text-right font-black text-red-600 dark:text-red-500 text-xs">
                      {job.price
                        ? `${Number(job.price).toLocaleString()}đ`
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-slate-800 dark:text-slate-200">
                          {new Date(job.updatedAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span className="opacity-50">
                          {new Date(job.updatedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {job.status === "FAILED" && job.errorLog ? (
                        <span
                          className="text-[10px] font-bold text-rose-500 dark:text-rose-400 line-clamp-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded border border-rose-100 dark:border-rose-900/30"
                          title={job.errorLog}
                        >
                          {job.errorLog}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-center block">
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
