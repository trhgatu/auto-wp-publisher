import { axios } from "@/lib/axios";

export const trashAllJobs = async (): Promise<void> => {
  await axios.post("/products/trash-all");
};
