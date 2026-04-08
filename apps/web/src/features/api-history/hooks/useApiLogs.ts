import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getApiLogs } from "../api/getApiLogs";
import type { GetApiLogsParams } from "../api/getApiLogs";

export const useApiLogs = (params: GetApiLogsParams = {}) => {
  return useQuery({
    queryKey: ["api-logs", params],
    queryFn: () => getApiLogs(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
