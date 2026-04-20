import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  Search,
  FileSpreadsheet,
  Package,
  PlusCircle,
  Trash2,
  Undo2,
  Trash,
  Globe,
} from "lucide-react";
import { useJobs } from "../hooks/useJobs";
import { JobStatusBadge } from "../components/JobStatusBadge";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { JobsFilter } from "../components/JobsFilter";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { Pagination } from "../../../components/shared/Pagination";
import { Button } from "../../../components/shared/Button";
import { trashJob } from "../api/trashJob";
import { restoreJob } from "../api/restoreJob";
import { permanentlyDeleteJob } from "../api/permanentlyDeleteJob";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../../hooks/useNotification";
import { ConfirmModal } from "../../../components/shared/ConfirmModal";
import { Table } from "../../../components/shared/Table";

export const JobsList = () => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyTrashed, setOnlyTrashed] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "primary" | "emerald";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    action: async () => {},
  });

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
    onlyTrashed,
  });

  const handleAction = (
    action: () => Promise<void>,
    title: string,
    message: string,
    variant: "danger" | "primary" | "emerald" = "primary",
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      variant,
      action: async () => {
        try {
          await action();
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
          notify("Thành công", "Thao tác đã được thực hiện", "success");
        } catch (err) {
          console.error(err);
          notify("Lỗi", "Không thể thực hiện thao tác", "error");
        } finally {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

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
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {onlyTrashed ? "Thùng Rác" : "Kho Sản Phẩm"}
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {onlyTrashed ? "Các bài viết đã tạm xóa" : "Quản lý xuất bản"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setOnlyTrashed(!onlyTrashed);
                setPage(1);
              }}
              variant={onlyTrashed ? "primary" : "outline"}
              leftIcon={
                onlyTrashed ? (
                  <Package className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
              className={`font-bold h-10 shadow-none transition-all active:scale-95 ${!onlyTrashed ? "text-slate-600 border-slate-200 hover:bg-slate-50" : ""}`}
            >
              {onlyTrashed ? "Về Kho" : "Thùng Rác"}
            </Button>

            {!onlyTrashed && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-6 transition-colors"></div>
        <div className="px-6 py-5 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col xl:flex-row items-center gap-4 transition-colors">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-red-600 dark:group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
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
            <Table>
              <Table.Header className="text-[10px] uppercase">
                <Table.Row>
                  <Table.HeadCell className="px-6 py-3 font-black w-14">
                    Ảnh
                  </Table.HeadCell>
                  <Table.HeadCell className="px-6 py-3 font-black">
                    Tên Sản Phẩm
                  </Table.HeadCell>
                  <Table.HeadCell className="px-6 py-3 font-black">
                    SKU
                  </Table.HeadCell>
                  <Table.HeadCell className="px-6 py-3 font-black text-right">
                    Giá bán
                  </Table.HeadCell>
                  <Table.HeadCell className="px-6 py-3 font-black text-center">
                    Trạng thái
                  </Table.HeadCell>
                  <Table.HeadCell className="px-6 py-3 font-black">
                    Cập nhật lúc
                  </Table.HeadCell>
                  <Table.HeadCell className="px-6 py-3 font-black text-center w-28 whitespace-nowrap">
                    Hành động
                  </Table.HeadCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {jobs.map((job) => (
                  <Table.Row key={job.id}>
                    <Table.Cell className="px-6 py-3">
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
                    </Table.Cell>
                    <Table.Cell className="px-6 py-3 max-w-[180px] xl:max-w-[250px]">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 transition-colors block truncate uppercase tracking-tight text-xs"
                        title={job.name}
                      >
                        {job.name}
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {job.sku || "-"}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-3 text-right font-black text-red-600 dark:text-red-500 text-xs">
                      {job.price
                        ? `${Number(job.price).toLocaleString()}đ`
                        : "-"}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-3 text-center">
                      <JobStatusBadge status={job.status} />
                    </Table.Cell>
                    <Table.Cell className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
                    </Table.Cell>
                    <Table.Cell className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {onlyTrashed ? (
                          <>
                            <button
                              onClick={() =>
                                handleAction(
                                  () => restoreJob(job.id),
                                  "Khôi phục sản phẩm",
                                  "Bạn có chắc chắn muốn đưa sản phẩm này trở lại kho hàng?",
                                  "emerald",
                                )
                              }
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
                              title="Khôi phục"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleAction(
                                  () => permanentlyDeleteJob(job.id),
                                  "Xóa vĩnh viễn",
                                  "Sản phẩm này sẽ bị xóa khỏi hệ thống hoàn toàn và không thể khôi phục. Bạn chắc chứ?",
                                  "danger",
                                )
                              }
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {job.wpUrl && (
                              <a
                                href={job.wpUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors group"
                                title="Xem trên Website"
                              >
                                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                              </a>
                            )}
                            <button
                              onClick={() =>
                                handleAction(
                                  () => trashJob(job.id),
                                  "Bỏ vào thùng rác",
                                  "Sản phẩm sẽ được chuyển vào khu vực rác. Bạn có thể khôi phục sau này.",
                                  "danger",
                                )
                              }
                              className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                              title="Xóa tạm thời"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.action}
        onCancel={() =>
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};
