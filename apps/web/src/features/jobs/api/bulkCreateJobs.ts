import { axios } from "@/lib/axios";
import type { ImportProductDto } from "@repo/shared";

export const bulkCreateJobs = async (
  data: ImportProductDto[],
  delayQueue: boolean = false,
): Promise<string[]> => {
  const response = await axios.post(
    `/products/bulk${delayQueue ? "?delayQueue=true" : ""}`,
    data,
  );
  return response.data;
};
