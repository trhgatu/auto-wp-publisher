import React from "react";
import { Select } from "../../../components/shared/Select";

interface JobsFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang chờ", value: "PENDING" },
  { label: "Đang đăng bài", value: "PROCESSING" },
  { label: "Hoàn tất", value: "COMPLETED" },
  { label: "Thất bại", value: "FAILED" },
];

export const JobsFilter: React.FC<JobsFilterProps> = ({ value, onChange }) => {
  return (
    <Select
      options={statusOptions}
      value={value}
      onChange={onChange}
      placeholder="Bộ lọc trạng thái"
      className="min-w-[180px]"
    />
  );
};
