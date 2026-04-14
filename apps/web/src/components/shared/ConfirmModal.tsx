import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "emerald";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md scale-in-center overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                variant === "danger"
                  ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10"
                  : variant === "emerald"
                    ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
                    : "bg-blue-50 text-blue-500 dark:bg-blue-500/10"
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight uppercase tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 -mt-1 -mr-1 p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-500 font-bold px-6"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="font-black uppercase tracking-wider px-8 shadow-lg shadow-current/10"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>

      <style>{`
        .scale-in-center {
          animation: scale-in-center 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body,
  );
};
