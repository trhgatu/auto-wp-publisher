import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkCreateJobs } from "../api/bulkCreateJobs";

export const useBulkCreateJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateJobs,
    onSuccess: () => {
      // Làm mới danh sách jobs sau khi import thành công
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};
