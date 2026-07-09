import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  HistoryOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Tổng quan</Link>,
    },
    {
      key: "/jobs",
      icon: <DatabaseOutlined />,
      label: <Link to="/jobs">Kho Sản Phẩm</Link>,
    },
    {
      key: "/websites",
      icon: <GlobalOutlined />,
      label: <Link to="/websites">Cấu hình WordPress</Link>,
    },
    {
      key: "/api-history",
      icon: <HistoryOutlined />,
      label: <Link to="/api-history">Lịch sử API</Link>,
    },
    {
      key: "/ai-settings",
      icon: <RobotOutlined />,
      label: <Link to="/ai-settings">Cấu hình AI Prompt</Link>,
    },
  ];

  // Find active key
  const activeKey =
    location.pathname === "/"
      ? "/"
      : menuItems.find(
          (item) => item.key !== "/" && location.pathname.startsWith(item.key),
        )?.key || location.pathname;

  return (
    <Sider
      width={256}
      theme="dark"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      }}
      className="bg-[#0f172a] dark:bg-[#090d16]"
    >
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-[#0f172a] dark:bg-[#090d16] transition-colors overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <DatabaseOutlined className="text-xl text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-slate-100 dark:text-white leading-none">
                AUTO WP
              </span>
              <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase mt-0.5">
                Publisher
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex flex-col justify-between"
        style={{ height: "calc(100vh - 130px)" }}
      >
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[activeKey]}
          items={menuItems}
          style={{ borderRight: 0, paddingTop: 16, background: "transparent" }}
        />

        <div className="p-4 border-t border-slate-800 bg-black/10">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[location.pathname]}
            style={{ borderRight: 0, background: "transparent" }}
            items={[
              {
                key: "/settings",
                icon: <SettingOutlined />,
                label: !collapsed ? (
                  <Link
                    to="/settings"
                    className="font-bold uppercase tracking-wider text-xs"
                  >
                    Cấu hình
                  </Link>
                ) : null,
              },
            ]}
          />
        </div>
      </div>
    </Sider>
  );
};
