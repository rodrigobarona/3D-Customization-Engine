import { create } from "zustand";
import { createConfigSlice, type ConfigSlice } from "./slices/config-slice";
import { createUISlice, type UISlice } from "./slices/ui-slice";
import { createProductSlice, type ProductSlice } from "./slices/product-slice";

export type ConfiguratorStore = ConfigSlice & UISlice & ProductSlice;

export const useConfiguratorStore = create<ConfiguratorStore>()((...args) => ({
  ...createConfigSlice(...args),
  ...createUISlice(...args),
  ...createProductSlice(...args),
}));
