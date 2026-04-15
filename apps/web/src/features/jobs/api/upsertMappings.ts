import { axios } from "@/lib/axios";

export interface CategoryMappingDto {
  excelValue: string;
  wpCategoryId: string;
  wpCategoryName: string;
}

export const upsertMappings = async (
  mappings: CategoryMappingDto[],
): Promise<{ success: boolean }> => {
  const response = await axios.post("/categories/mappings", mappings);
  return response.data;
};
