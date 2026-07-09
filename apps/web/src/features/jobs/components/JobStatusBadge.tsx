import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { JobItem } from "../api/getJobs";

const statusConfig: Record<
  JobItem["status"],
  { icon: React.ReactNode; color: string; text: string }
> = {
  PENDING: {
    icon: <ClockCircleOutlined />,
    color: "warning",
    text: "Đang chờ",
  },
  PROCESSING: {
    icon: <SyncOutlined spin />,
    color: "processing",
    text: "Đang đăng bài",
  },
  COMPLETED: {
    icon: <CheckCircleOutlined />,
    color: "success",
    text: "Hoàn tất",
  },
  FAILED: {
    icon: <CloseCircleOutlined />,
    color: "error",
    text: "Thất bại",
  },
};

export const JobStatusBadge = ({ status }: { status: JobItem["status"] }) => {
  const config = statusConfig[status];

  return (
    <Tag
      icon={config.icon}
      color={config.color}
      style={{
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontSize: "10px",
        padding: "2px 8px",
      }}
    >
      {config.text}
    </Tag>
  );
};
