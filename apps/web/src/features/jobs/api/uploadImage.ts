import { axios } from "@/lib/axios";

export const uploadImage = async (
  file: File,
  id?: string,
  type?: "imageUrl" | "gallery",
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const url = id
    ? `/products/${id}/upload-image${type ? `?type=${type}` : ""}`
    : `/products/upload-image`;

  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
};
