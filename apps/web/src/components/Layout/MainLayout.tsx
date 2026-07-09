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
          marginLeft: collapsed ? 72 : 240,
          minHeight: "100vh",
          transition: "margin-left 0.2s",
        }}
      >
        <Header />
        <Content
          style={{ padding: "88px 32px 32px 32px", overflow: "initial" }}
        >
          <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
