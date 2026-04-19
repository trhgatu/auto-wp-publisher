import { axios } from "@/lib/axios";

export interface JobItem {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorLog: string | null;
  imageUrl?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  rawContent?: string | null;
  wpUrl?: string | null;
  price?: string | null;
  sku?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getJobs = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    onlyTrashed?: boolean;
  } = {},
): Promise<{ items: JobItem[]; total: number }> => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    startDate,
    endDate,
    onlyTrashed,
  } = params;
  const offset = (page - 1) * limit;

  const response = await axios.get("/products", {
    params: {
      limit,
      offset,
      status,
      search,
      startDate,
      endDate,
      onlyTrashed,
    },
  });

  return response.data;
};
