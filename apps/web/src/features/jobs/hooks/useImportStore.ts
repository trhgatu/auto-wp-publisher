import { create } from "zustand";
import type { ImportProductDto } from "@repo/shared";
import type { WCCategory } from "../api/getWpCategories";
import type { CategoryMapping } from "../api/getMappings";
import type { WCBrand } from "../api/getWpBrands";
import type { BrandMapping } from "../api/getBrandMappings";

type Step = "upload" | "preview" | "mapping";

interface ImportState {
  step: Step;
  data: ImportProductDto[];
  isDragging: boolean;
  categoryMapping: Record<string, string>;
  brandMapping: Record<string, string>;
  rowFeaturedFile: Record<number, File | null>;
  rowGalleryFiles: Record<number, File[]>;

  // Actions
  setStep: (step: Step) => void;
  setData: (data: ImportProductDto[]) => void;
  setIsDragging: (isDragging: boolean) => void;
  setMapping: (excelCat: string, wpId: string) => void;
  setFullMapping: (mapping: Record<string, string>) => void;
  setBrandMapping: (excelBrand: string, wpId: string) => void;
  setFullBrandMapping: (mapping: Record<string, string>) => void;
  setRowFeaturedFile: (index: number, file: File | null) => void;
  setRowGalleryFiles: (index: number, files: File[]) => void;
  addRowGalleryFile: (index: number, file: File) => void;
  reset: () => void;
}

export const useImportStore = create<ImportState>((set) => ({
  step: "upload",
  data: [],
  isDragging: false,
  categoryMapping: {},
  brandMapping: {},
  rowFeaturedFile: {},
  rowGalleryFiles: {},

  setStep: (step) => set({ step }),
  setData: (data) => set({ data }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setMapping: (excelCat, wpId) =>
    set((state) => ({
      categoryMapping: { ...state.categoryMapping, [excelCat]: wpId },
    })),
  setFullMapping: (categoryMapping) => set({ categoryMapping }),
  setBrandMapping: (excelBrand, wpId) =>
    set((state) => ({
      brandMapping: { ...state.brandMapping, [excelBrand]: wpId },
    })),
  setFullBrandMapping: (brandMapping) => set({ brandMapping }),
  setRowFeaturedFile: (index, file) =>
    set((state) => ({
      rowFeaturedFile: { ...state.rowFeaturedFile, [index]: file },
    })),
  setRowGalleryFiles: (index, files) =>
    set((state) => ({
      rowGalleryFiles: { ...state.rowGalleryFiles, [index]: files },
    })),
  addRowGalleryFile: (index, file) =>
    set((state) => {
      const currentFiles = state.rowGalleryFiles[index] || [];
      return {
        rowGalleryFiles: {
          ...state.rowGalleryFiles,
          [index]: [...currentFiles, file],
        },
      };
    }),
  reset: () =>
    set({
      step: "upload",
      data: [],
      isDragging: false,
      categoryMapping: {},
      brandMapping: {},
      rowFeaturedFile: {},
      rowGalleryFiles: {},
    }),
}));

// Selectors / Helpers
export const selectUniqueExcelCategories = (state: ImportState) => {
  const categories = state.data
    .map((d) => d.category || "")
    .filter((c) => c !== "");
  return Array.from(new Set(categories)).sort();
};

export const selectUniqueExcelBrands = (state: ImportState) => {
  const brands = state.data.map((d) => d.brand || "").filter((b) => b !== "");
  return Array.from(new Set(brands)).sort();
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

export const selectAllBrandsMapped = (
  state: ImportState,
  wpBrands: WCBrand[],
  savedMappings: BrandMapping[],
) => {
  const uniqueBrands = selectUniqueExcelBrands(state);
  if (uniqueBrands.length === 0) return true; // If no brands in Excel, it's considered mapped

  return uniqueBrands.every((brand) => {
    const mappingId = state.brandMapping[brand];
    if (!mappingId) return false;

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    const hasDirectMatch = wpBrands.some(
      (wp) =>
        normalize(wp.name).includes(normalize(brand)) ||
        normalize(brand).includes(normalize(wp.name)),
    );
    const hasSavedMatch = savedMappings.some((m) => m.excelValue === brand);
    return hasDirectMatch || hasSavedMatch;
  });
};
