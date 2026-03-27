import axios from "axios";
import type { ImportProductDto } from "@repo/shared";

// Trong tương lai URL này có thể dùng env var thay vì cứng
const API_URL = "http://localhost:10000/api/v1";

export const createJob = async (data: ImportProductDto): Promise<string> => {
  const response = await axios.post(`${API_URL}/products`, data);
  return response.data;
};
