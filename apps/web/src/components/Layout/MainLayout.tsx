import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex overflow-hidden relative selection:bg-indigo-500/30 transition-colors">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative w-[calc(100%-16rem)]">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] space-y-8 animate-in fade-in duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
