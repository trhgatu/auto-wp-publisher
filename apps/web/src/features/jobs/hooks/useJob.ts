import { useQuery } from "@tanstack/react-query";
import { getJobById } from "../api/getJobById";

export const useJob = (id: string | undefined) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
       const job = query.state.data;
       if (!job) return false;
       return (job.status === "PENDING" || job.status === "PROCESSING") ? 3000 : false;
    }
  });
};
