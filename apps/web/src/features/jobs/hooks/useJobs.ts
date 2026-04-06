import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJobs } from "../api/getJobs";

export const useJobs = (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => getJobs(params),
    placeholderData: keepPreviousData,
    // Tự động refetch mỗi 5 giây để cập nhật tiến độ nhập liệu
    refetchInterval: (query) => {
      // Chỉ refetch nếu có bất kỳ job nào đang ở trạng thái PROCESSING hoặc PENDING
      const data = query.state.data;
      if (!data) return false;
      
      const hasActiveJobs = data.items.some(
        (job) => job.status === "PENDING" || job.status === "PROCESSING"
      );
      
      return hasActiveJobs ? 5000 : false;
    },
  });
};
