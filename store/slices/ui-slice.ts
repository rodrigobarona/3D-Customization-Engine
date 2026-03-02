import type { StateCreator } from "zustand";
import type { ConfiguratorStore } from "../configurator-store";

export interface UISlice {
  activeZoneId: string | null;
  isLoading: boolean;
  isExporting: boolean;
  showZoneGuides: boolean;
  setActiveZoneId: (zoneId: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsExporting: (exporting: boolean) => void;
  toggleZoneGuides: () => void;
}

export const createUISlice: StateCreator<
  ConfiguratorStore,
  [],
  [],
  UISlice
> = (set) => ({
  activeZoneId: null,
  isLoading: false,
  isExporting: false,
  showZoneGuides: false,

  setActiveZoneId: (zoneId) => set({ activeZoneId: zoneId }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
  toggleZoneGuides: () =>
    set((state) => ({ showZoneGuides: !state.showZoneGuides })),
});
