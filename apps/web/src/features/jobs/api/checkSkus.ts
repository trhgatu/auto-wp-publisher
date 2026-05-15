import { axios } from "@/lib/axios";

export interface ExistingProductInfo {
  id: string;
  sku: string;
  status: string;
  wpUrl?: string;
}

export const checkSkus = async (
  skus: string[],
): Promise<ExistingProductInfo[]> => {
  if (skus.length === 0) return [];
  const response = await axios.get("/products/check-skus", {
    params: { skus: skus.join(",") },
  });
  return response.data;
};
