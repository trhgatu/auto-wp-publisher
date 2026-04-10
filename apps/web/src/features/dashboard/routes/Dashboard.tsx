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

const mockData = [
  { name: "T2", completed: 4, failed: 0 },
  { name: "T3", completed: 7, failed: 1 },
  { name: "T4", completed: 5, failed: 0 },
  { name: "T5", completed: 12, failed: 2 },
  { name: "T6", completed: 8, failed: 0 },
  { name: "T7", completed: 15, failed: 1 },
  { name: "CN", completed: 20, failed: 3 },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* 1. CLEAN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">
            <span>Hệ thống</span>
            <ChevronRight className="w-3 h-3" />
            <span>Tổng quan</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Bảng điều hành
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
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
            value: "1,248",
            trend: "+12%",
            sub: "tháng này",
            icon: Package,
            iconClass: "bg-slate-50 text-slate-600",
          },
          {
            label: "Thành Công",
            value: "1,120",
            trend: "+5.2%",
            sub: "tỷ lệ duyệt",
            icon: CheckCircle,
            iconClass: "bg-green-50 text-green-600",
          },
          {
            label: "Đang Xử Lý",
            value: "45",
            trend: "Queue",
            sub: "đang bận",
            icon: Clock,
            iconClass: "bg-amber-50 text-amber-600",
          },
          {
            label: "Lỗi Pushing",
            value: "83",
            trend: "Cần xử lý",
            sub: "ngay lập tức",
            icon: AlertTriangle,
            iconClass: "bg-red-50 text-red-600",
            valClass: "text-red-600",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 transition-all hover:border-slate-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center border border-slate-50 shadow-none transition-colors",
                  item.iconClass,
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.label}
                </span>
                <h3
                  className={clsx(
                    "text-2xl font-black mt-0.5",
                    item.valClass || "text-slate-900",
                  )}
                >
                  {item.value}
                </h3>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 capitalize">
                {item.sub}
              </span>
              <span
                className={clsx(
                  "text-[11px] font-black px-1.5 py-0.5 rounded",
                  item.label === "Lỗi Pushing"
                    ? "text-red-700 bg-red-50"
                    : "text-emerald-700 bg-emerald-50",
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              Hoạt động thực tế (7 ngày qua)
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-600" />
                <span>Thành công</span>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
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
                  cursor={{ stroke: "#f1f5f9", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    padding: "12px",
                  }}
                  itemStyle={{
                    color: "#0f172a",
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
                  name="Đã đăng"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRed)"
                />
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fee2e2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fee2e2" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">
              Phân tích lỗi
            </h3>
            <div className="space-y-5">
              {[
                { label: "Trùng mã SKU", value: 45, color: "bg-red-600" },
                { label: "Mất kết nối WP", value: 30, color: "bg-red-400" },
                { label: "Thiếu thuộc tính", value: 15, color: "bg-slate-300" },
                { label: "Khác", value: 10, color: "bg-slate-200" },
              ].map((err, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-bold">
                    <span className="text-slate-500 uppercase">
                      {err.label}
                    </span>
                    <span className="text-slate-900">{err.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-1000",
                        err.color,
                      )}
                      style={{ width: `${err.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Trợ lý AI hệ thống
              </h4>
            </div>
            <div className="text-xs text-white/80 leading-relaxed font-medium">
              <p>
                Tỷ lệ lỗi do{" "}
                <span className="text-red-400 font-bold">Trùng SKU</span> tăng
                mạnh trong 24h qua. Đề xuất kiểm tra lại tệp nguồn Excel trước
                khi tiếp tục import để tiết kiệm băng thông API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for conditional classes
function clsx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
