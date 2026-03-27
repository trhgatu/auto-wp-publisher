import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Settings, Send } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: PlusCircle, label: "Tạo Bài Viết", path: "/create" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 glass border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Send className="w-6 h-6 text-primary mr-3" />
        <span className="font-bold text-lg tracking-tight">Auto WP</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={twMerge(
                clsx(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ),
              )}
            >
              <item.icon
                className={clsx(
                  "w-5 h-5 mr-3",
                  isActive ? "opacity-100" : "opacity-70",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Link
          to="/settings"
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5 mr-3 opacity-70" />
          Cài đặt
        </Link>
      </div>
    </aside>
  );
};
