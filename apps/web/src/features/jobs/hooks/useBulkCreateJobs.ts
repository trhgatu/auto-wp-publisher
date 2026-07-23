import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateJobs } from "../api/bulkCreateJobs";
import type { ImportProductDto } from "@repo/shared";

export const useBulkCreateJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      delayQueue,
    }: {
      data: ImportProductDto[];
      delayQueue?: boolean;
    }) => bulkCreateJobs(data, delayQueue),
    onSuccess: () => {
      // Làm mới danh sách jobs sau khi import thành công
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};
