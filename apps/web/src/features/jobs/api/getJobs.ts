import axios from "axios";

export interface JobItem {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorLog: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const getJobs = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {},
): Promise<{ items: JobItem[]; total: number }> => {
  const { page = 1, limit = 10, status } = params;
  const offset = (page - 1) * limit;

  const response = await axios.get(`${API_URL}/products`, {
    params: { limit, offset, status },
  });

  return response.data;
};
