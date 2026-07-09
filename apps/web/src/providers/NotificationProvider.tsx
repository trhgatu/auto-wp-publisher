import React, { useCallback } from "react";
import type { ReactNode } from "react";
import { notification } from "antd";
import { NotificationContext } from "../contexts/NotificationContext";

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [api, contextHolder] = notification.useNotification();

  const notify = useCallback(
    (
      title: string,
      message?: string,
      type: "success" | "error" | "info" | "processing" = "info",
    ) => {
      const id = Math.random().toString(36).substring(2, 9);

      // Map custom type to Antd notification type
      const antdType = type === "processing" ? "info" : type;

      api[antdType]({
        message: title,
        description: message,
        placement: "topRight",
        key: id,
        duration: 3.5,
      });

      return id;
    },
    [api],
  );

  const removeNotification = useCallback(
    (id: string) => {
      api.destroy(id);
    },
    [api],
  );

  const updateNotification = useCallback(
    (
      id: string,
      data: {
        title?: string;
        message?: string;
        type?: "success" | "error" | "info" | "processing";
      },
    ) => {
      const antdType = data.type === "processing" ? "info" : data.type;

      api.open({
        key: id,
        message: data.title,
        description: data.message,
        type: antdType,
      });
    },
    [api],
  );

  return (
    <NotificationContext.Provider
      value={{ notify, removeNotification, updateNotification }}
    >
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
