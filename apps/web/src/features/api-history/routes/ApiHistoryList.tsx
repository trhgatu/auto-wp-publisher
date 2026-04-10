import { useState, useMemo } from "react";
import {
  Activity,
  ChevronRight,
  Clock,
  Loader2,
  Code,
  ArrowRightLeft,
  CheckCircle,
  Zap,
  Filter,
  Search,
} from "lucide-react";
import { useApiLogs } from "../hooks/useApiLogs";
import type { ApiLogItem } from "../api/getApiLogs";
import { Pagination } from "../../../components/shared/Pagination";
import { StatsCard } from "../../../components/shared/StatsCard";
import { clsx } from "clsx";

export const ApiHistoryList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useApiLogs({
    limit: pageSize,
    offset: (page - 1) * pageSize,
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

  const filteredLogs = logs.filter(
    (log) =>
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.statusCode.toString().includes(searchTerm),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto pb-12">
      {/* 1. CLEAN HEADER (Dashboard Synced) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">
            <span>Hệ thống</span>
            <ChevronRight className="w-3 h-3" />
            <span>Giám sát API</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Lịch sử Đồng bộ
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Theo dõi chi tiết payload và phản hồi từ hệ thống WooCommerce
            WordPress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm endpoint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-full md:w-64 uppercase tracking-tighter"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[600px] relative shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          )}

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
                    Cổng Endpoint
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100 text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100 text-right">
                    Độ trễ
                  </th>
                  <th className="px-6 py-4 border-b border-slate-100 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log: ApiLogItem) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={clsx(
                      "hover:bg-slate-50/80 transition-all cursor-pointer group relative",
                      selectedLogId === log.id &&
                        "bg-red-50/40 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-red-600",
                    )}
                  >
                    <td className="px-6 py-4 md:w-40">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 tabular-nums">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
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
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[300px] uppercase tracking-tight">
                            {log.endpoint.split("/").pop() || "/"}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <span className="text-[11px] font-black text-slate-600 flex items-center justify-end gap-1.5 tabular-nums">
                        {log.duration}ms
                        <Clock className="w-3 h-3 text-slate-300" />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight
                        className={clsx(
                          "w-4 h-4 transition-all",
                          selectedLogId === log.id
                            ? "text-red-600 translate-x-1"
                            : "text-slate-300 group-hover:text-slate-500",
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

            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right-full duration-500 ease-out border-l border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-red-50 rounded-xl">
                    <Code className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                      Chi tiết API
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {selectedLog?.id.split("-")[0]}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300">
                        {new Date(
                          selectedLog?.createdAt || "",
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLogId(null)}
                  className="p-2.5 hover:bg-slate-100 rounded-full transition-all group active:scale-90"
                >
                  <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-900 group-hover:rotate-180 transition-all duration-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                {/* Visual Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Latency
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {selectedLog?.duration}ms
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
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
                    <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                      Request
                    </h4>
                  </div>
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl relative group">
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
                    <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
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

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedLogId(null)}
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
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
