import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Settings,
  Globe,
  Bot,
  Activity,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/" },
  { icon: Package, label: "Kho Sản Phẩm", path: "/jobs" },
  { icon: Globe, label: "Cấu hình WordPress", path: "/websites" },
  { icon: Activity, label: "Lịch sử API", path: "/api-history" },
  { icon: Bot, label: "Cấu hình AI Prompt", path: "/ai-settings" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
      <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              AUTO WP
            </span>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-500 tracking-widest uppercase mt-0.5">
              Publisher
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
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
                  "flex items-center px-4 py-2.5 text-sm font-bold transition-all duration-200 group relative rounded-lg",
                  isActive
                    ? "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                ),
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 dark:bg-red-500 rounded-r-full"></span>
              )}
              <item.icon
                className={clsx(
                  "w-4 h-4 mr-3 transition-colors",
                  isActive
                    ? "text-red-600 dark:text-red-500"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                )}
              />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 transition-colors">
        <Link
          to="/settings"
          className="flex items-center px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all uppercase tracking-wider"
        >
          <Settings className="w-4 h-4 mr-3" />
          Cấu hình
        </Link>
      </div>
    </aside>
  );
};
