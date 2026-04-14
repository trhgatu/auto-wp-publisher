import { axios } from "@/lib/axios";

export interface JobDetail {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorLog: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  imageUrl?: string | null;
  galleryImageUrls?: string | null;
  price?: string | null;
  sku?: string | null;
  description?: string | null;
  rawContent?: string | null;
  aiContent?: string | null;
  material?: string | null;
  carModels?: string | null;
  wpPostId?: string | null;
  shopeeLink?: string | null;
  lazadaLink?: string | null;
  tiktokLink?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getJobById = async (id: string): Promise<JobDetail> => {
  const response = await axios.get(`/products/${id}`);
  return response.data;
};
