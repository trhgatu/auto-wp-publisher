import { useState } from "react";
import {
  Activity,
  ChevronRight,
  Clock,
  Loader2,
  Code,
  ArrowRightLeft,
} from "lucide-react";
import { useApiLogs } from "../hooks/useApiLogs";
import { ApiLogItem } from "../api/getApiLogs";
import { Pagination } from "../../../components/shared/Pagination";
import { clsx } from "clsx";

export const ApiHistoryList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { data, isLoading } = useApiLogs({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const logs = data?.items || [];
  const total = data?.total || 0;
  const selectedLog = logs.find((l: ApiLogItem) => l.id === selectedLogId);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300)
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (code >= 400) return "text-rose-600 bg-rose-50 border-rose-100";
    return "text-amber-600 bg-amber-50 border-amber-100";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-600" />
              Lịch sử API
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Theo dõi và giám sát toàn bộ các yêu cầu gửi đến WooCommerce
              WordPress.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[600px] relative shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          )}

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-black">Thời gian</th>
                  <th className="px-6 py-4 font-black">Endpoint</th>
                  <th className="px-6 py-4 font-black text-center">Status</th>
                  <th className="px-6 py-4 font-black text-right">Tốc độ</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: ApiLogItem) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={clsx(
                      "hover:bg-slate-50/50 transition-colors cursor-pointer group",
                      selectedLogId === log.id && "bg-red-50/30",
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500">
                          {log.method}
                        </span>
                        <span
                          className="text-xs font-medium text-slate-600 truncate max-w-[150px]"
                          title={log.endpoint}
                        >
                          {log.endpoint.split("/").pop() || "/"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={clsx(
                          "px-2.5 py-1 rounded-md text-[10px] font-black border",
                          getStatusColor(log.statusCode),
                        )}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {log.duration}ms
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight
                        className={clsx(
                          "w-4 h-4 transition-all",
                          selectedLogId === log.id
                            ? "text-red-600 translate-x-1"
                            : "text-slate-300 group-hover:text-slate-400",
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

        {/* Details Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm sticky top-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Code className="w-5 h-5 text-red-600" />
              Chi tiết log API
            </h3>
            {selectedLog && (
              <span className="text-[10px] font-black text-slate-400">
                {selectedLog.id.split("-")[0]}
              </span>
            )}
          </div>

          {!selectedLog ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 gap-4">
              <ArrowRightLeft className="w-16 h-16 opacity-10" />
              <p className="text-sm font-medium">
                Chọn một bản ghi để xem chi tiết JSON
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Thông tin yêu cầu
                </h4>
                <div className="bg-slate-900 rounded-xl p-4 overflow-hidden">
                  <pre className="text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(
                      JSON.parse(selectedLog.requestBody || "{}"),
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Phản hồi từ WordPress
                </h4>
                <div
                  className={clsx(
                    "rounded-xl p-4 overflow-hidden border",
                    selectedLog.statusCode >= 400
                      ? "bg-rose-950 border-rose-900"
                      : "bg-slate-900 border-slate-800",
                  )}
                >
                  <pre
                    className={clsx(
                      "text-[11px] overflow-x-auto whitespace-pre-wrap font-mono",
                      selectedLog.statusCode >= 400
                        ? "text-rose-400"
                        : "text-blue-400",
                    )}
                  >
                    {selectedLog.responseBody
                      ? JSON.stringify(
                          JSON.parse(selectedLog.responseBody),
                          null,
                          2,
                        )
                      : selectedLog.errorMessage ||
                        "Không có nội dung phản hồi"}
                  </pre>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
