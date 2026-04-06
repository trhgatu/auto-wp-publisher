import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "../api/createJob";

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      // Invalidate both lists and individual jobs to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};
