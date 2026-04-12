import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJobs } from "../api/getJobs";

export const useJobs = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {},
) => {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => getJobs(params),
    placeholderData: keepPreviousData,
  });
};
