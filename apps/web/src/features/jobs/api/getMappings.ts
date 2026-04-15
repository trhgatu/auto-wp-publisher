import { axios } from "@/lib/axios";

export interface CategoryMapping {
  id: string;
  excelValue: string;
  wpCategoryId: string;
  wpCategoryName: string;
}

export const getMappings = async (): Promise<CategoryMapping[]> => {
  const response = await axios.get("/categories/mappings");
  return response.data;
};
