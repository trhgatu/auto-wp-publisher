import { Layout, Button, Badge, Avatar } from "antd";
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
        background: "var(--antd-color-bg-container)",
        borderBottom: "1px solid rgba(5, 5, 5, 0.06)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "between",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
      className="dark:bg-slate-900 dark:border-slate-800 transition-colors"
    >
      <div className="flex-grow flex items-center">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 hidden sm:block uppercase tracking-widest m-0">
          Workspace /{" "}
          <span className="text-slate-800 dark:text-slate-200">
            Auto WP Publisher
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="text"
          shape="circle"
          icon={
            isDark ? (
              <SunOutlined className="text-lg" />
            ) : (
              <MoonOutlined className="text-lg" />
            )
          }
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        />

        <Badge dot color="red">
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined className="text-lg" />}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          />
        </Badge>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        <Avatar
          icon={<UserOutlined />}
          className="cursor-pointer bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        />
      </div>
    </AntdHeader>
  );
};
