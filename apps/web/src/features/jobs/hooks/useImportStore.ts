import { create } from "zustand";
import type { ImportProductDto } from "@repo/shared";
import type { WCCategory } from "../api/getWpCategories";
import type { CategoryMapping } from "../api/getMappings";

type Step = "upload" | "preview" | "mapping";

interface ImportState {
  step: Step;
  data: ImportProductDto[];
  isDragging: boolean;
  categoryMapping: Record<string, string>;

  // Actions
  setStep: (step: Step) => void;
  setData: (data: ImportProductDto[]) => void;
  setIsDragging: (isDragging: boolean) => void;
  setMapping: (excelCat: string, wpId: string) => void;
  setFullMapping: (mapping: Record<string, string>) => void;
  reset: () => void;
}

export const useImportStore = create<ImportState>((set) => ({
  step: "upload",
  data: [],
  isDragging: false,
  categoryMapping: {},

  setStep: (step) => set({ step }),
  setData: (data) => set({ data }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setMapping: (excelCat, wpId) =>
    set((state) => ({
      categoryMapping: { ...state.categoryMapping, [excelCat]: wpId },
    })),
  setFullMapping: (categoryMapping) => set({ categoryMapping }),
  reset: () =>
    set({
      step: "upload",
      data: [],
      isDragging: false,
      categoryMapping: {},
    }),
}));

// Selectors / Helpers
export const selectUniqueExcelCategories = (state: ImportState) => {
  const categories = state.data
    .map((d) => d.category || "")
    .filter((c) => c !== "");
  return Array.from(new Set(categories)).sort();
};

export const selectAllMapped = (
  state: ImportState,
  wpCategories: WCCategory[],
  savedMappings: CategoryMapping[],
) => {
  const uniqueCats = selectUniqueExcelCategories(state);
  if (uniqueCats.length === 0) return false;

  return uniqueCats.every((cat) => {
    const mappingId = state.categoryMapping[cat];
    if (!mappingId) return false;

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    const hasDirectMatch = wpCategories.some(
      (wp) =>
        normalize(wp.name).includes(normalize(cat)) ||
        normalize(cat).includes(normalize(wp.name)),
    );
    const hasSavedMatch = savedMappings.some((m) => m.excelValue === cat);
    return hasDirectMatch || hasSavedMatch;
  });
};
