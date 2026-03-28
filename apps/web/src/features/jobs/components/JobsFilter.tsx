import React from "react";
import { Filter } from "lucide-react";

interface JobsFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobsFilter: React.FC<JobsFilterProps> = ({ value, onChange }) => {
  return (
    <div className="relative group">
      <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[150px] cursor-pointer"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="PENDING">🕒 Đang chờ</option>
        <option value="PROCESSING">⚙️ Đang xử lý</option>
        <option value="COMPLETED">✅ Hoàn thành</option>
        <option value="FAILED">❌ Thất bại</option>
      </select>
    </div>
  );
};
