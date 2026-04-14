import { axios } from "@/lib/axios";

export const trashJob = async (id: string): Promise<void> => {
  await axios.delete(`/products/${id}`);
};
