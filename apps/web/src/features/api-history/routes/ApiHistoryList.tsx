import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  ChevronRight,
  Clock,
  Loader2,
  Code,
  ArrowRightLeft,
  CheckCircle,
  Zap,
  Search,
} from "lucide-react";
import { useApiLogs } from "../hooks/useApiLogs";
import type { ApiLogItem } from "../api/getApiLogs";
import { Pagination } from "../../../components/shared/Pagination";
import { StatsCard } from "../../../components/shared/StatsCard";
import { Select } from "../../../components/shared/Select";
import { DateRangeFilter } from "../../jobs/components/DateRangeFilter";
import { clsx } from "clsx";

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Thành công (2xx)", value: "SUCCESS" },
  { label: "Lỗi hệ thống (4xx+)", value: "ERROR" },
];

export const ApiHistoryList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filtering States
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useApiLogs({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const logs = useMemo(() => data?.items || [], [data?.items]);
  const total = data?.total || 0;
  const selectedLog = useMemo(
    () => logs.find((l: ApiLogItem) => l.id === selectedLogId),
    [logs, selectedLogId],
  );

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    if (logs.length === 0)
      return { successRate: 0, avgDuration: 0, totalErrors: 0 };

    const successes = logs.filter(
      (l) => l.statusCode >= 200 && l.statusCode < 300,
    ).length;
    const durationSum = logs.reduce((acc, curr) => acc + curr.duration, 0);
    const errors = logs.filter((l) => l.statusCode >= 400).length;

    return {
      successRate: Math.round((successes / logs.length) * 100),
      avgDuration: Math.round(durationSum / logs.length),
      totalErrors: errors,
    };
  }, [logs]);

  const getStatusStyle = (code: number) => {
    if (code >= 200 && code < 300)
      return "text-emerald-700 bg-emerald-50 border-emerald-100 ring-emerald-500/10";
    if (code >= 400)
      return "text-rose-700 bg-rose-50 border-rose-100 ring-rose-500/10";
    return "text-amber-700 bg-amber-50 border-amber-100 ring-amber-500/10";
  };

  const getMethodStyle = (method: string) => {
    switch (method.toUpperCase()) {
      case "POST":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "PUT":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto pb-12">
      {/* Unified Control Center (Synced with JobsList) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm">
        {/* Row 1: Brand & Core Info */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center border border-red-100 dark:border-red-500/20 shadow-sm">
              <Activity className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mb-0.5 font-bold uppercase tracking-widest">
                <span>Hệ thống</span>
                <ChevronRight className="w-3 h-3 translate-y-[1px]" />
                <span>Giám sát API</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                Lịch sử API
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Hệ thống • Nhật ký đồng bộ thời gian thực
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-6"></div>

        {/* Row 2: Advanced Filtering Toolbar */}
        <div className="relative px-6 py-5 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col xl:flex-row items-center gap-4 z-50">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-red-600 dark:group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo endpoint hoặc thông điệp lỗi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 hover:border-slate-300 dark:hover:border-slate-700 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase tracking-tighter dark:text-slate-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                placeholder="Trạng thái API"
                className="min-w-[180px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Tổng yêu cầu"
          value={total}
          subValue="Dữ liệu trang hiện tại"
          icon={Activity}
          variant="info"
        />
        <StatsCard
          label="Tỷ lệ thành công"
          value={`${stats.successRate}%`}
          subValue={`${stats.totalErrors} lỗi phát hiện`}
          trend={stats.successRate > 90 ? "Tốt" : "Cần kiểm tra"}
          icon={CheckCircle}
          variant={stats.successRate > 90 ? "success" : "warning"}
        />
        <StatsCard
          label="Độ trễ trung bình"
          value={`${stats.avgDuration}ms`}
          subValue="Thời gian phản hồi"
          trend="Realtime"
          icon={Zap}
          variant="default"
        />
      </div>

      <div className="relative">
        {/* 3. MODERN TABLE LIST (Full Width) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px] relative shadow-sm transition-colors">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 z-20 bg-white/40 dark:bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-full border border-slate-100 dark:border-slate-700 shadow-xl">
                <Loader2 className="w-8 h-8 text-red-600 dark:text-red-500 animate-spin" />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                    Cổng Endpoint
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800 text-right">
                    Độ trễ
                  </th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {logs.map((log: ApiLogItem) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={clsx(
                      "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer group relative",
                      selectedLogId === log.id &&
                        "bg-red-50/40 dark:bg-red-500/10 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-red-600 dark:after:bg-red-500",
                    )}
                  >
                    <td className="px-6 py-4 md:w-40">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-200 tabular-nums">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-md text-[9px] font-black border tracking-widest uppercase",
                            getMethodStyle(log.method),
                          )}
                        >
                          {log.method}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[300px] uppercase tracking-tight">
                            {log.endpoint.split("/").pop() || "/"}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {log.endpoint}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center md:w-32">
                      <span
                        className={clsx(
                          "px-2.5 py-1 rounded-full text-[10px] font-black border ring-1 inline-flex items-center gap-1",
                          getStatusStyle(log.statusCode),
                        )}
                      >
                        <div
                          className={clsx(
                            "w-1 h-1 rounded-full",
                            log.statusCode >= 200 && log.statusCode < 300
                              ? "bg-emerald-500"
                              : "bg-rose-500",
                          )}
                        />
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right md:w-32">
                      <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 flex items-center justify-end gap-1.5 tabular-nums">
                        {log.duration}ms
                        <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight
                        className={clsx(
                          "w-4 h-4 transition-all",
                          selectedLogId === log.id
                            ? "text-red-600 dark:text-red-500 translate-x-1"
                            : "text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400",
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>

        {/* 4. PREMIUM DRAWER PANEL (Overlays From Right) */}
        {selectedLogId && (
          <>
            {/* Backdrop Blur */}
            <div
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
              onClick={() => setSelectedLogId(null)}
            />

            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right-full duration-500 ease-out border-l border-slate-200 dark:border-slate-800">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <Code className="w-5 h-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      Chi tiết API
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                        {selectedLog?.id.split("-")[0]}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">
                        {new Date(
                          selectedLog?.createdAt || "",
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLogId(null)}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group active:scale-90"
                >
                  <ChevronRight className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:rotate-180 transition-all duration-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                {/* Visual Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Status
                    </p>
                    <span
                      className={clsx(
                        "text-sm font-black px-2 py-0.5 rounded inline-block border",
                        getStatusStyle(selectedLog?.statusCode || 0),
                      )}
                    >
                      {selectedLog?.statusCode}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Latency
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {selectedLog?.duration}ms
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Method
                    </p>
                    <span
                      className={clsx(
                        "text-xs font-black uppercase tracking-widest",
                        selectedLog?.method === "POST"
                          ? "text-indigo-600"
                          : "text-cyan-600",
                      )}
                    >
                      {selectedLog?.method}
                    </span>
                  </div>
                </div>

                {/* Request Info */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-100 tracking-widest flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                      Request
                    </h4>
                  </div>
                  <div className="bg-slate-950 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-800 dark:border-slate-800 shadow-2xl relative group">
                    <pre className="text-[12px] leading-relaxed text-indigo-300 overflow-x-auto whitespace-pre-wrap font-mono">
                      {selectedLog &&
                        JSON.stringify(
                          JSON.parse(selectedLog.requestBody || "{}"),
                          null,
                          2,
                        )}
                    </pre>
                  </div>
                </section>

                {/* Response Info */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-slate-100 tracking-widest flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Response
                    </h4>
                  </div>
                  <div
                    className={clsx(
                      "rounded-2xl p-6 border shadow-2xl",
                      selectedLog && selectedLog.statusCode >= 400
                        ? "bg-rose-950/20 border-rose-900/30"
                        : "bg-slate-950 border-slate-800",
                    )}
                  >
                    <pre
                      className={clsx(
                        "text-[12px] leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono",
                        selectedLog && selectedLog.statusCode >= 400
                          ? "text-rose-400"
                          : "text-blue-400",
                      )}
                    >
                      {selectedLog?.responseBody
                        ? JSON.stringify(
                            JSON.parse(selectedLog.responseBody),
                            null,
                            2,
                          )
                        : selectedLog?.errorMessage ||
                          "Không có nội dung phản hồi từ máy chủ."}
                    </pre>
                  </div>
                </section>
              </div>

              <div className="p-6 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedLogId(null)}
                  className="px-8 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
