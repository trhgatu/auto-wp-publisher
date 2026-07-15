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
          colorPrimary: "#C62828", // Primary red
          borderRadius: 8, // Rounded corners 8px
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          colorBgLayout: isDark ? "#141414" : "#F6F7FB", // Page background
          colorBgContainer: isDark ? "#1F1F1F" : "#FFFFFF", // Card background
          colorBorder: isDark ? "#303030" : "#ECECEC", // Border color
          colorText: isDark ? "#E5E5E5" : "#262626", // Text primary
          colorTextDescription: isDark ? "#8C8C8C" : "#8C8C8C", // Text secondary
        },
        components: {
          Layout: {
            siderBg: "#1F1F1F",
            headerBg: isDark ? "#1F1F1F" : "#FFFFFF",
            headerHeight: 64,
          },
          Card: {
            colorBgContainer: isDark ? "#1F1F1F" : "#FFFFFF",
            paddingLG: 24,
          },
          Table: {
            headerBg: isDark ? "#262626" : "#FAFAFA",
            headerColor: isDark ? "#E5E5E5" : "#262626",
            headerBorderRadius: 8,
          },
          Button: {
            controlHeight: 40,
            fontWeight: 500,
            borderRadius: 8,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
