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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-slate-100 bg-white">
        <img
          src="https://phutungoto123.vn/wp-content/uploads/2025/07/logo-Huynh-Phat-1.png"
          alt="Logo Huynh Phat"
          className="h-12 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto bg-white">
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
                    ? "text-red-600 bg-red-50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                ),
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-r-full"></span>
              )}
              <item.icon
                className={clsx(
                  "w-4 h-4 mr-3 transition-colors",
                  isActive
                    ? "text-red-600"
                    : "text-slate-400 group-hover:text-slate-600",
                )}
              />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/30">
        <Link
          to="/settings"
          className="flex items-center px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all uppercase tracking-wider"
        >
          <Settings className="w-4 h-4 mr-3" />
          Cấu hình
        </Link>
      </div>
    </aside>
  );
};
