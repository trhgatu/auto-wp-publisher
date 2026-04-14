import { axios } from "@/lib/axios";
import type { ImportProductDto } from "@repo/shared";

export const bulkCreateJobs = async (
  data: ImportProductDto[],
): Promise<string[]> => {
  const response = await axios.post("/products/bulk", data);
  return response.data;
};
