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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tổng quan Hệ thống
          </h1>
          <p className="text-slate-500 mt-2">
            Theo dõi hiệu suất nhập liệu và đăng tải sản phẩm lên WooCommerce.
          </p>
        </div>
        <button className="hidden md:flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-premium shadow-indigo-200 transition-all">
          <TrendingUp className="w-4 h-4 mr-2" />
          Xuất Báo cáo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Tổng Sản Phẩm
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">1,248</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center">
            +12%{" "}
            <span className="text-slate-400 ml-1 font-normal">
              so với tháng trước
            </span>
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Thành Công</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">1,120</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center">
            +5.2%{" "}
            <span className="text-slate-400 ml-1 font-normal">tỷ lệ duyệt</span>
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Đang Xử Lý</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">45</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-600 font-medium flex items-center">
            Queue{" "}
            <span className="text-slate-400 ml-1 font-normal">
              đang bận rộn
            </span>
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Lỗi Pushing</p>
              <h3 className="text-3xl font-bold text-rose-600 mt-1">83</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-rose-600 font-medium flex items-center">
            Cần xử lý{" "}
            <span className="text-slate-400 ml-1 font-normal">Sớm</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Hoạt động đăng tải (7 ngày qua)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Thành công"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              Lỗi thường gặp
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mr-3"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Trùng mã SKU
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-3"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Mất kết nối WP
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-3"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Thiếu thuộc tính
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>
                  <span className="text-sm font-medium text-slate-700">
                    Khác
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">10%</span>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Thông điệp AI
              </h4>
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 text-sm text-indigo-800">
                <span className="font-semibold block mb-1">
                  💡 Gợi ý hệ thống:
                </span>
                Tỷ lệ lỗi do SKU tuần này đang tăng khá cao. Bạn nên kiểm tra
                lại cột "Mã Phụ Tùng" trong các file Excel import gần đây nhé!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
