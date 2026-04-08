import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { JobItem } from "../api/getJobs";

const statusConfig: Record<
  JobItem["status"],
  { icon: React.ElementType; color: string; bg: string; spin?: boolean }
> = {
  PENDING: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
  PROCESSING: {
    icon: Loader2,
    color: "text-blue-700",
    bg: "bg-blue-50",
    spin: true,
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  FAILED: { icon: XCircle, color: "text-rose-700", bg: "bg-rose-50" },
};

export const JobStatusBadge = ({ status }: { status: JobItem["status"] }) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const statusMap: Record<JobItem["status"], string> = {
    PENDING: "Đang chờ",
    PROCESSING: "Đang đăng bài",
    COMPLETED: "Hoàn tất",
    FAILED: "Thất bại",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap border transition-all duration-300",
          config.bg,
          config.color,
          status === "COMPLETED"
            ? "border-emerald-200"
            : status === "FAILED"
              ? "border-rose-200"
              : status === "PROCESSING"
                ? "border-blue-200"
                : "border-amber-200",
        ),
      )}
    >
      <StatusIcon className={clsx("w-3 h-3", config.spin && "animate-spin")} />
      {statusMap[status]}
    </span>
  );
};
