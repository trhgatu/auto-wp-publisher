import React from "react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  variant = "default",
  className,
}) => {
  const variants = {
    default:
      "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400",
    success:
      "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500",
    warning:
      "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-500",
    danger:
      "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-500",
    info: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-500",
  };

  const trendColors = {
    default: "text-slate-500 dark:text-slate-400",
    success:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20",
    warning:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20",
    danger: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20",
    info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/20",
  };

  return (
    <div
      className={clsx(
        "bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors",
            variants[variant],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {label}
          </span>
          <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-slate-100">
            {value}
          </h3>
        </div>
      </div>
      {(subValue || trend) && (
        <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 capitalize">
            {subValue}
          </span>
          {trend && (
            <span
              className={clsx(
                "text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tight",
                trendColors[variant],
              )}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
