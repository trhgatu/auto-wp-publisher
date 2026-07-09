import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "../hooks/useTheme";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function AntdProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      setIsDark(isDarkTheme);
    };

    updateTheme();

    // Set up a MutationObserver to listen to class changes on documentElement
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#dc2626", // Red primary color
          borderRadius: 12, // Soft, modern rounded corners
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          colorBgLayout: isDark ? "#090d16" : "#f8fafc",
          colorBgContainer: isDark ? "#111827" : "#ffffff",
          colorBorderSecondary: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.03)",
        },
        components: {
          Layout: {
            siderBg: isDark ? "#090d16" : "#0f172a", // Dark sidebar for a premium enterprise look
            headerBg: isDark ? "#090d16" : "#ffffff",
          },
          Card: {
            colorBgContainer: isDark ? "#111827" : "#ffffff",
          },
          Table: {
            headerBg: isDark ? "#1e293b" : "#f1f5f9",
            headerColor: isDark ? "#cbd5e1" : "#475569",
            headerBorderRadius: 8,
          },
          Button: {
            controlHeight: 40,
            fontWeight: 600,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
