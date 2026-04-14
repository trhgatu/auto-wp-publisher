import { axios } from "@/lib/axios";
import type { ImportProductDto } from "@repo/shared";

export const createJob = async (data: ImportProductDto): Promise<string> => {
  const response = await axios.post("/products", data);
  return response.data;
};
