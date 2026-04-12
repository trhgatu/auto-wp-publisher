import { createContext } from "react";
import type {
  AppNotification,
  NotificationType,
} from "../components/shared/Notification";

export interface NotificationContextType {
  notify: (title: string, message?: string, type?: NotificationType) => string;
  removeNotification: (id: string) => void;
  updateNotification: (
    id: string,
    data: Partial<Omit<AppNotification, "id">>,
  ) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
