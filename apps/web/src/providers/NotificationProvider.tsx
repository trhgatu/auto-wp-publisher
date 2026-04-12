import React, { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { NotificationItem } from "../components/shared/Notification";
import type {
  AppNotification,
  NotificationType,
} from "../components/shared/Notification";

import { NotificationContext } from "../contexts/NotificationContext";

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notify = useCallback(
    (title: string, message?: string, type: NotificationType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, title, message, type }]);
      return id;
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNotification = useCallback(
    (id: string, data: Partial<Omit<AppNotification, "id">>) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...data } : n)),
      );
    },
    [],
  );

  return (
    <NotificationContext.Provider
      value={{ notify, removeNotification, updateNotification }}
    >
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
