import { axios } from "@/lib/axios";

export const permanentlyDeleteJob = async (id: string): Promise<void> => {
  await axios.post(`/products/${id}/permanent-delete`);
};
