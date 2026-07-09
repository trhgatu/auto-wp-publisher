import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const { Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 256,
          minHeight: "100vh",
          transition: "margin-left 0.2s",
        }}
        className="transition-colors bg-slate-50 dark:bg-slate-950"
      >
        <Header />
        <Content style={{ padding: "24px 32px", overflow: "initial" }}>
          <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
