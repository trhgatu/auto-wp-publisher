import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { JobItem } from "../api/getJobs";

const statusConfig: Record<
  JobItem["status"],
  { icon: React.ElementType; color: string; bg: string; spin?: boolean }
> = {
  PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  PROCESSING: {
    icon: Loader2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    spin: true,
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  FAILED: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
};

export const JobStatusBadge = ({ status }: { status: JobItem["status"] }) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
          config.bg,
          config.color,
        ),
      )}
    >
      <StatusIcon
        className={clsx("w-3.5 h-3.5", config.spin && "animate-spin")}
      />
      {status}
    </span>
  );
};
