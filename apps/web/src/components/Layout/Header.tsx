import { Bell, UserCircle } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex-1 flex items-center gap-4">
        <h2 className="text-xs font-bold text-slate-400 hidden sm:block uppercase tracking-widest">
          Workspace / <span className="text-slate-800">Auto WP Publisher</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-all border border-slate-200">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
