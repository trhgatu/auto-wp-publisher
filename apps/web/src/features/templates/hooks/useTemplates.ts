import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTemplates,
  saveTemplate,
  setDefaultTemplate,
  deleteTemplate,
} from "../api/templates";
import type { SaveTemplateInput } from "../api/templates";

export const useTemplates = () => {
  return useQuery({
    queryKey: ["product-templates"],
    queryFn: getTemplates,
  });
};

export const useSaveTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveTemplateInput) => saveTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
    },
  });
};

export const useSetDefaultTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setDefaultTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
    },
  });
};
