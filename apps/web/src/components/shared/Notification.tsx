import React, { useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, Info, X } from "lucide-react";
import { clsx } from "clsx";

export type NotificationType = "success" | "error" | "info" | "processing";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationProps {
  notification: AppNotification;
  onClose: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (notification.type !== "processing") {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      border: "border-emerald-100",
    },
    error: {
      icon: XCircle,
      color: "text-rose-500",
      border: "border-rose-100",
    },
    info: {
      icon: Info,
      color: "text-blue-500",
      border: "border-blue-100",
    },
    processing: {
      icon: Loader2,
      color: "text-indigo-500",
      border: "border-indigo-100",
      spin: true,
    },
  }[notification.type];

  const Icon = config.icon;

  return (
    <div
      className={clsx(
        "group pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 animate-in slide-in-from-right-full",
        "hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-0.5">
            <Icon
              className={clsx(
                "w-5 h-5",
                config.color,
                config.spin && "animate-spin",
              )}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800 leading-tight">
              {notification.title}
            </h3>
            {notification.message && (
              <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed italic">
                {notification.message}
              </p>
            )}
          </div>
          <button
            onClick={() => onClose(notification.id)}
            className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>
      </div>
      {notification.type !== "processing" && (
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-slate-50">
          <div
            className={clsx(
              "h-full transition-all duration-[5000ms] ease-linear",
              config.color.replace("text-", "bg-"),
            )}
            style={{ width: "100%", animation: "progress 5s linear forwards" }}
          />
        </div>
      )}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
