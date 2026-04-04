import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden relative selection:bg-indigo-500/30">
      {/* Decorative gradients */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10 w-[calc(100%-16rem)]">
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
