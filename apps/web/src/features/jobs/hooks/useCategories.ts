import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWpCategories } from "../api/getWpCategories";
import { getMappings } from "../api/getMappings";
import { upsertMappings, type CategoryMappingDto } from "../api/upsertMappings";

export const useCategories = () => {
  return useQuery({
    queryKey: ["wp-categories"],
    queryFn: getWpCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useMappings = () => {
  return useQuery({
    queryKey: ["category-mappings"],
    queryFn: getMappings,
  });
};

export const useUpsertMappings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mappings: CategoryMappingDto[]) => upsertMappings(mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-mappings"] });
    },
  });
};
