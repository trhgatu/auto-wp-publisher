import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  HistoryOutlined,
  RobotOutlined,
  SettingOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../hooks/useTheme";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
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
      trigger={null}
      collapsed={collapsed}
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
        className={`h-16 flex items-center justify-center px-4 border-b transition-all overflow-hidden ${
          isDark ? "border-[#303030] bg-[#1F1F1F]" : "border-[#ECECEC] bg-white"
        }`}
      >
        <img
          src="https://phutungoto123.vn/wp-content/uploads/2025/07/logo-Huynh-Phat-1.png"
          alt="Huỳnh Phát Auto"
          className={`object-contain transition-all duration-300 ${
            collapsed ? "h-8 w-8" : "h-10 max-w-[170px] w-auto"
          }`}
        />
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
                    key: "/templates",
                    icon: <CodeOutlined />,
                    label: <Link to="/templates">Mẫu bài viết</Link>,
                  },
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
