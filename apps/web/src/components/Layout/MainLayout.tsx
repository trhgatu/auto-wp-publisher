import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden relative selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative w-[calc(100%-16rem)]">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
