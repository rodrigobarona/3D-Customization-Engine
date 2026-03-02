import { create } from "zustand";
import {
  createStudioZonesSlice,
  type StudioZonesSlice,
} from "./slices/studio-zones-slice";
import {
  createStudioUISlice,
  type StudioUISlice,
} from "./slices/studio-ui-slice";
import {
  createStudioProductSlice,
  type StudioProductSlice,
} from "./slices/studio-product-slice";
import {
  createStudioHistorySlice,
  type StudioHistorySlice,
} from "./slices/studio-history-slice";

export type StudioStore = StudioZonesSlice &
  StudioUISlice &
  StudioProductSlice &
  StudioHistorySlice;

export const useStudioStore = create<StudioStore>()((...args) => ({
  ...createStudioZonesSlice(...args),
  ...createStudioUISlice(...args),
  ...createStudioProductSlice(...args),
  ...createStudioHistorySlice(...args),
}));
