import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  Send,
  Globe,
  Bot,
  History,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/" },
  { icon: Package, label: "Kho Sản Phẩm", path: "/jobs" },
  { icon: PlusCircle, label: "Thêm Thủ Công", path: "/create" },
  { icon: Globe, label: "Cấu hình WordPress", path: "/websites" },
  { icon: Bot, label: "Cấu hình AI Prompt", path: "/ai-settings" },
  { icon: History, label: "Lịch sử Lỗi", path: "/logs" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white/70 backdrop-blur-2xl border-r border-slate-200/50 flex flex-col shadow-soft">
      <div className="h-20 flex items-center px-6 border-b border-slate-100/80">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 mr-3">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-slate-800 leading-tight">
            Auto WP
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 mb-3 px-3">
          Quản lý Dữ liệu
        </div>
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={twMerge(
                clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "text-indigo-700 bg-indigo-50/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                ),
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></span>
              )}
              <item.icon
                className={clsx(
                  "w-5 h-5 mr-3 transition-transform duration-300",
                  isActive ? "opacity-100" : "opacity-70 group-hover:scale-105",
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100/80">
        <Link
          to="/settings"
          className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
        >
          <Settings className="w-5 h-5 mr-3 opacity-70" />
          Cài đặt Hệ thống
        </Link>
      </div>
    </aside>
  );
};
