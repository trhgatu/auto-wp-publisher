import axios from "axios";

export interface JobDetailItem {
  id: string;
  name: string;
  description: string | null;
  rawContent: string | null;
  aiContent: string | null;
  imageUrl: string | null;
  wpPostId: number | null;
  price: string | null;
  sku: string | null;
  material: string | null;
  carModels: string | null;
  shopeeLink: string | null;
  lazadaLink: string | null;
  tiktokLink: string | null;
  videoUrl: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorLog: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const getJobById = async (id: string): Promise<JobDetailItem> => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};
