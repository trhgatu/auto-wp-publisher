import { Layout, Button, Badge, Avatar, Breadcrumb, Input } from "antd";
import {
  SunOutlined,
  MoonOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../hooks/useTheme";

const { Header: AntdHeader } = Layout;

export const Header = () => {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <AntdHeader
      style={{
        padding: "0 32px",
        borderBottom: "1px solid var(--antd-color-border)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 40,
        background: "var(--antd-color-bg-container)",
        transition: "background 0.2s, border 0.2s",
      }}
    >
      <div className="flex items-center gap-4">
        <Breadcrumb
          items={[{ title: "Workspace" }, { title: "Auto WP Publisher" }]}
          className="text-xs font-medium tracking-wide"
        />
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm..."
          style={{ width: 200, borderRadius: 8 }}
          size="middle"
        />

        <div className="h-6 w-px bg-[#ECECEC] dark:bg-[#303030] mx-1" />

        <Button
          type="text"
          shape="circle"
          icon={
            isDark ? (
              <SunOutlined style={{ fontSize: "16px" }} />
            ) : (
              <MoonOutlined style={{ fontSize: "16px" }} />
            )
          }
          onClick={() => setTheme(isDark ? "light" : "dark")}
          style={{ color: "var(--antd-color-text-description)" }}
        />

        <Badge dot color="#C62828">
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined style={{ fontSize: "16px" }} />}
            style={{ color: "var(--antd-color-text-description)" }}
          />
        </Badge>

        <div className="h-6 w-px bg-[#ECECEC] dark:bg-[#303030] mx-1" />

        <Avatar
          icon={<UserOutlined />}
          style={{
            cursor: "pointer",
            background: "rgba(0,0,0,0.04)",
            color: "var(--antd-color-text)",
            border: "1px solid var(--antd-color-border)",
          }}
        />
      </div>
    </AntdHeader>
  );
};
