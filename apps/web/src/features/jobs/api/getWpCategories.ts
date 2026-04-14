import { axios } from "@/lib/axios";

export interface WCCategory {
  id: number;
  name: string;
  parent: number;
}

export const getWpCategories = async (): Promise<WCCategory[]> => {
  const response = await axios.get("/categories/wp");
  return response.data;
};
