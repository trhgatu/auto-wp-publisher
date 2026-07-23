import { axios } from "@/lib/axios";

export const permanentlyDeleteAllJobs = async (): Promise<void> => {
  await axios.post("/products/permanent-delete-all");
};
