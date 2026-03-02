import type { StateCreator } from "zustand";
import type { ProductConfig } from "@/lib/schemas";
import type { ConfiguratorStore } from "../configurator-store";

export interface ProductSlice {
  product: ProductConfig | null;
  setProduct: (product: ProductConfig) => void;
}

export const createProductSlice: StateCreator<
  ConfiguratorStore,
  [],
  [],
  ProductSlice
> = (set) => ({
  product: null,
  setProduct: (product) => set({ product }),
});
