import { axios } from "@/lib/axios";

export const permanentlyDeleteJob = async (id: string): Promise<void> => {
  await axios.delete(`/products/${id}/permanent`);
};
