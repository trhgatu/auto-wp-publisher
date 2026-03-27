import axios from "axios";

export interface JobItem {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorLog: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = "http://localhost:10000/api/v1";

export const getJobs = async (): Promise<JobItem[]> => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};
