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
import { useTheme } from "../../hooks/useTheme";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Tổng quan</Link>,
    },
    {
      key: "/jobs",
      icon: <DatabaseOutlined />,
      label: <Link to="/jobs">Quản lý Job</Link>,
    },
    {
      key: "/api-history",
      icon: <HistoryOutlined />,
      label: <Link to="/api-history">Lịch sử API</Link>,
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
      width={240}
      collapsedWidth={72}
      theme={isDark ? "dark" : "light"}
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
        borderRight: isDark ? "1px solid #303030" : "1px solid #ECECEC",
        background: isDark ? "#1F1F1F" : "#FFFFFF",
      }}
      className={isDark ? "bg-[#1F1F1F]" : "bg-white"}
    >
      <div
        className={`h-16 flex items-center px-5 border-b transition-colors overflow-hidden ${
          isDark ? "border-[#303030] bg-[#1F1F1F]" : "border-[#ECECEC] bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#C62828] flex items-center justify-center flex-shrink-0">
            <DatabaseOutlined className="text-base text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold tracking-tight leading-none ${
                  isDark ? "text-white" : "text-[#262626]"
                }`}
              >
                AUTO WP
              </span>
              <span className="text-[9px] font-bold text-[#C62828] tracking-wider uppercase mt-0.5">
                Publisher
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex flex-col justify-between"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <Menu
          mode="inline"
          theme={isDark ? "dark" : "light"}
          selectedKeys={[activeKey]}
          items={menuItems}
          style={{ borderRight: 0, paddingTop: 16, background: "transparent" }}
        />

        <div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={[
              {
                key: "settings-submenu",
                icon: <SettingOutlined />,
                label: "Cấu hình",
                children: [
                  {
                    key: "/ai-settings",
                    icon: <RobotOutlined />,
                    label: <Link to="/ai-settings">AI Prompt</Link>,
                  },
                  {
                    key: "/websites",
                    icon: <GlobalOutlined />,
                    label: <Link to="/websites">WordPress</Link>,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    </Sider>
  );
};
