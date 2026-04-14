import { axios } from "@/lib/axios";

export const restoreJob = async (id: string): Promise<void> => {
  await axios.post(`/products/${id}/restore`);
};
