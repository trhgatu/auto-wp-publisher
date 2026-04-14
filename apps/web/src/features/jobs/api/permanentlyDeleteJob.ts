import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const permanentlyDeleteJob = async (id: string): Promise<void> => {
  await axios.post(`${API_URL}/products/${id}/permanent-delete`);
};
