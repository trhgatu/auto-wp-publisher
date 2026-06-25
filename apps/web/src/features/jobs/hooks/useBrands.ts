import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWpBrands } from "../api/getWpBrands";
import { getBrandMappings } from "../api/getBrandMappings";
import {
  upsertBrandMappings,
  type BrandMappingDto,
} from "../api/upsertBrandMappings";

export const useBrands = () => {
  return useQuery({
    queryKey: ["wp-brands"],
    queryFn: getWpBrands,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useBrandMappings = () => {
  return useQuery({
    queryKey: ["brand-mappings"],
    queryFn: getBrandMappings,
  });
};

export const useUpsertBrandMappings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mappings: BrandMappingDto[]) => upsertBrandMappings(mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-mappings"] });
    },
  });
};
