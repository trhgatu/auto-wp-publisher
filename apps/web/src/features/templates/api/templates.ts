import { axios } from "@/lib/axios";

export interface ProductTemplateDto {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTemplateInput {
  id?: string;
  name: string;
  content: string;
  isDefault?: boolean;
}

export const getTemplates = async (): Promise<ProductTemplateDto[]> => {
  const response = await axios.get("/templates");
  return response.data;
};

export const getTemplateById = async (
  id: string,
): Promise<ProductTemplateDto> => {
  const response = await axios.get(`/templates/${id}`);
  return response.data;
};

export const saveTemplate = async (
  data: SaveTemplateInput,
): Promise<ProductTemplateDto> => {
  const response = await axios.post("/templates", data);
  return response.data;
};

export const setDefaultTemplate = async (
  id: string,
): Promise<ProductTemplateDto> => {
  const response = await axios.post(`/templates/${id}/set-default`);
  return response.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await axios.delete(`/templates/${id}`);
};
