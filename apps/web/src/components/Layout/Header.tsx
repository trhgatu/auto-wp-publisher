import { Bell, UserCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export const Header = () => {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 flex items-center justify-between px-8 transition-colors">
      <div className="flex-1 flex items-center gap-4">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 hidden sm:block uppercase tracking-widest">
          Workspace /{" "}
          <span className="text-slate-800 dark:text-slate-200">
            Auto WP Publisher
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
