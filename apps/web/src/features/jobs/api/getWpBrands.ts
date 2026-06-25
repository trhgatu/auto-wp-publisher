import { axios } from "@/lib/axios";

export interface WCBrand {
  id: number;
  name: string;
  parent: number;
}

export const getWpBrands = async (): Promise<WCBrand[]> => {
  const response = await axios.get("/brands/wp");
  return response.data;
};
