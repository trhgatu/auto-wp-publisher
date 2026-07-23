import { axios } from "@/lib/axios";

export const publishJob = async (id: string): Promise<void> => {
  await axios.post(`/products/${id}/publish`);
};
