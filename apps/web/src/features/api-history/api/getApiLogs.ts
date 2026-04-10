import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export interface ApiLogItem {
  id: string;
  method: string;
  endpoint: string;
  requestHeader: string | null;
  requestBody: string | null;
  responseBody: string | null;
  statusCode: number;
  duration: number;
  errorMessage: string | null;
  createdAt: string;
}

export interface GetApiLogsResponse {
  items: ApiLogItem[];
  total: number;
}

export interface GetApiLogsParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const getApiLogs = async (
  params: GetApiLogsParams = {},
): Promise<GetApiLogsResponse> => {
  const { limit = 20, offset = 0, search, status, startDate, endDate } = params;

  const response = await axios.get(`${API_URL}/api-logs`, {
    params: {
      limit,
      offset,
      search,
      status,
      startDate,
      endDate,
    },
  });

  return response.data;
};
