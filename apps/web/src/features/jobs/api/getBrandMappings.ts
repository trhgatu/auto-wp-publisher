import { axios } from "@/lib/axios";

export interface BrandMapping {
  id: string;
  excelValue: string;
  wpBrandId: string;
  wpBrandName: string;
}

export const getBrandMappings = async (): Promise<BrandMapping[]> => {
  const response = await axios.get("/brands/mappings");
  return response.data;
};
