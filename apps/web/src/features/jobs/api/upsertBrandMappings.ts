import { axios } from "@/lib/axios";

export interface BrandMappingDto {
  excelValue: string;
  wpBrandId: string;
  wpBrandName: string;
}

export const upsertBrandMappings = async (
  mappings: BrandMappingDto[],
): Promise<{ success: boolean }> => {
  const response = await axios.post("/brands/mappings", mappings);
  return response.data;
};
