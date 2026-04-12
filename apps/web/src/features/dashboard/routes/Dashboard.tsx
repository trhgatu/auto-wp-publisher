import { clsx } from "clsx";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import { useDashboardStats } from "../hooks/useDashboardStats";
import { useTheme } from "../../../hooks/useTheme";

export const Dashboard = () => {
  const { data, isLoading, isError } = useDashboardStats();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex max-w-sm flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full animate-ping bg-red-400/20 dark:bg-red-500/20"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500">
              <Package className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
            Đang tổng hợp dữ liệu
          </h3>
          <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Hệ thống đang tải số liệu bảng điều khiển, vui lòng chờ trong giây
            lát...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-red-500 p-8 text-center">
        Đã có lỗi tải dữ liệu bảng điều khiển!
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto transition-colors">
      {/* 1. CLEAN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mb-1 font-bold uppercase tracking-wider">
            <span>Hệ thống</span>
            <ChevronRight className="w-3 h-3" />
            <span>Tổng quan</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            Bảng điều hành
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Giám sát hiệu suất nhập liệu và trạng thái đồng bộ WooCommerce.
          </p>
        </div>
        <button className="hidden md:flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-tight transition-all active:scale-95">
          <TrendingUp className="w-3.5 h-3.5 mr-2" />
          Xuất báo cáo chi tiết
        </button>
      </div>

      {/* 2. STATS CARDS (Antd Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng Sản Phẩm",
            value: data.stats.totalProducts,
            trend: "thực tế",
            sub: "trong db",
            icon: Package,
            iconClass:
              "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
          },
          {
            label: "Thành Công",
            value: data.stats.completedProducts,
            trend: data.stats.totalProducts
              ? `${Math.round((data.stats.completedProducts / data.stats.totalProducts) * 100)}%`
              : "0%",
            sub: "tỷ lệ hoàn tất",
            icon: CheckCircle,
            iconClass:
              "bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-500",
          },
          {
            label: "Đang Xử Lý",
            value: data.stats.processingProducts,
            trend: "Queue",
            sub: "đang bận",
            icon: Clock,
            iconClass:
              "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500",
          },
          {
            label: "Lỗi Pushing",
            value: data.stats.failedProducts,
            trend: "Cần xử lý",
            sub: "ngay lập tức",
            icon: AlertTriangle,
            iconClass:
              "bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-500",
            valClass: "text-red-600 dark:text-rose-500",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center border border-slate-50 dark:border-slate-800 shadow-none transition-colors",
                  item.iconClass,
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {item.label}
                </span>
                <h3
                  className={clsx(
                    "text-2xl font-black mt-0.5",
                    item.valClass || "text-slate-900 dark:text-slate-100",
                  )}
                >
                  {item.value}
                </h3>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 capitalize">
                {item.sub}
              </span>
              <span
                className={clsx(
                  "text-[11px] font-black px-1.5 py-0.5 rounded",
                  item.label === "Lỗi Pushing"
                    ? "text-red-700 bg-red-50 dark:text-rose-200 dark:bg-rose-900/40"
                    : "text-emerald-700 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-900/40",
                )}
              >
                {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. CHARTS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-500" />
              Hoạt động thực tế (7 ngày qua)
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500" />
                <span>Thành công</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Lỗi</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.recentActivity || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{
                    stroke: theme === "dark" ? "#1e293b" : "#f1f5f9",
                    strokeWidth: 1,
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border:
                      theme === "dark"
                        ? "1px solid #1e293b"
                        : "1px solid #e2e8f0",
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    boxShadow: "none",
                    padding: "12px",
                  }}
                  itemStyle={{
                    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
                    fontWeight: 800,
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                  labelStyle={{
                    color: "#64748b",
                    fontWeight: 700,
                    fontSize: "10px",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Thành công"
                  stroke={theme === "dark" ? "#ef4444" : "#dc2626"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRed)"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  name="Thất bại"
                  stroke={theme === "dark" ? "#475569" : "#cbd5e1"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSlate)"
                />
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={theme === "dark" ? "#ef4444" : "#fee2e2"}
                      stopOpacity={theme === "dark" ? 0.2 : 0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={theme === "dark" ? "#ef4444" : "#fee2e2"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorSlate" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={theme === "dark" ? "#334155" : "#f1f5f9"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={theme === "dark" ? "#334155" : "#f1f5f9"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex-1 transition-colors">
            <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-6">
              Phân tích lỗi
            </h3>
            <div className="space-y-5">
              {data.errorAnalysis?.length > 0 ? (
                data.errorAnalysis.map((err, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400 uppercase">
                        {err.label}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {err.value}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-1000",
                          err.color,
                        )}
                        style={{ width: `${err.value}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 border border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg py-12 text-center text-emerald-600 dark:text-emerald-500">
                  Hệ thống ổn định, không có lỗi.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 border border-slate-800 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Trợ lý AI hệ thống
              </h4>
            </div>
            <div className="text-xs text-white/80 leading-relaxed font-medium">
              {data.errorAnalysis?.length > 0 &&
              data.errorAnalysis[0]?.label.includes("SKU") ? (
                <p>
                  Tỷ lệ lỗi do{" "}
                  <span className="text-red-400 font-bold">Trùng SKU</span> tăng
                  mạnh trong 24h qua. Đề xuất kiểm tra lại tệp nguồn Excel trước
                  khi tiếp tục import để tiết kiệm băng thông API.
                </p>
              ) : data.errorAnalysis?.length > 0 ? (
                <p>
                  Phần lớn lỗi gần đây liên quan đến{" "}
                  <span className="text-amber-400 font-bold">
                    {data.errorAnalysis[0].label}
                  </span>
                  . Hãy kiểm tra và xem lại log chi tiết để có giải pháp khắc
                  phục.
                </p>
              ) : (
                <p className="text-emerald-400/90">
                  Hiệu suất API đạt mức tuyệt đối. Toàn bộ tính năng đang vận
                  hành trơn tru và dữ liệu WordPress luôn đồng bộ theo thời gian
                  thực.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
