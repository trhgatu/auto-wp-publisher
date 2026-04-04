import { Bell, Search, UserCircle } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-400 hidden sm:block uppercase tracking-wider">
          Workspace /{" "}
          <span className="text-indigo-500 font-bold">Auto WP Publisher</span>
        </h2>
        {/* Search Bar */}
        <div className="hidden md:flex items-center ml-8 max-w-md w-full relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            className="w-full bg-white/60 border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-all border border-slate-200">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};
