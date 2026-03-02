import type { StateCreator } from "zustand";
import type { ColorOption, FontOption } from "@/lib/schemas";
import type { StudioStore } from "../studio-store";

export interface StudioProductSlice {
  productId: string;
  productSlug: string;
  productName: string;
  modelUrl: string;
  colors: ColorOption[];
  fonts: FontOption[];
  setProductMeta: (meta: {
    id: string;
    slug: string;
    name: string;
    modelUrl: string;
  }) => void;
  setColors: (colors: ColorOption[]) => void;
  setFonts: (fonts: FontOption[]) => void;
}

export const createStudioProductSlice: StateCreator<
  StudioStore,
  [],
  [],
  StudioProductSlice
> = (set) => ({
  productId: "new-product",
  productSlug: "new-product",
  productName: "New Product",
  modelUrl: "",
  colors: [],
  fonts: [],

  setProductMeta: ({ id, slug, name, modelUrl }) =>
    set({ productId: id, productSlug: slug, productName: name, modelUrl }),

  setColors: (colors) => set({ colors }),
  setFonts: (fonts) => set({ fonts }),
});
