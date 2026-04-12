import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

interface DashboardStats {
  stats: {
    totalProducts: number;
    completedProducts: number;
    processingProducts: number;
    failedProducts: number;
  };
  errorAnalysis: { label: string; value: number; color: string }[];
  recentActivity: { name: string; completed: number; failed: number }[];
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/products/dashboard/stats`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    refetchInterval: 30000,
  });
};
