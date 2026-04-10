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
    default: "bg-slate-50 text-slate-600 border-slate-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    danger: "bg-rose-50 text-rose-600 border-rose-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
  };

  const trendColors = {
    default: "text-slate-500",
    success: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    danger: "text-rose-600 bg-rose-50",
    info: "text-blue-600 bg-blue-50",
  };

  return (
    <div
      className={clsx(
        "bg-white p-5 rounded-xl border border-slate-200 transition-all hover:border-slate-300 hover:shadow-sm",
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {label}
          </span>
          <h3 className="text-2xl font-black mt-0.5 text-slate-900">{value}</h3>
        </div>
      </div>
      {(subValue || trend) && (
        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 capitalize">
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
