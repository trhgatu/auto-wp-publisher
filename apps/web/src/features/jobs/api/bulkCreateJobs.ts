import axios from "axios";
import type { ImportProductDto } from "@repo/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const bulkCreateJobs = async (
  data: ImportProductDto[],
): Promise<string[]> => {
  const response = await axios.post(`${API_URL}/products/bulk`, data);
  return response.data;
};
