import type { StateCreator } from "zustand";
import type { ConfiguratorStore } from "../configurator-store";

export interface ZoneValue {
  zone_id: string;
  content: string;
  font_id?: string;
  fontSize?: number;
  fill?: string;
  imageDataUrl?: string;
}

export interface ConfigSlice {
  baseColor: string;
  zoneValues: Record<string, ZoneValue>;
  setBaseColor: (color: string) => void;
  setZoneContent: (zoneId: string, content: string) => void;
  setZoneFontId: (zoneId: string, fontId: string) => void;
  setZoneFontSize: (zoneId: string, fontSize: number) => void;
  setZoneFill: (zoneId: string, fill: string) => void;
  setZoneImageDataUrl: (zoneId: string, dataUrl: string) => void;
  resetZone: (zoneId: string) => void;
  resetAllZones: () => void;
}

export const createConfigSlice: StateCreator<
  ConfiguratorStore,
  [],
  [],
  ConfigSlice
> = (set) => ({
  baseColor: "#1B2A4A",
  zoneValues: {},

  setBaseColor: (color) => set({ baseColor: color }),

  setZoneContent: (zoneId, content) =>
    set((state) => ({
      zoneValues: {
        ...state.zoneValues,
        [zoneId]: { ...getZoneOrDefault(state.zoneValues, zoneId), content },
      },
    })),

  setZoneFontId: (zoneId, fontId) =>
    set((state) => ({
      zoneValues: {
        ...state.zoneValues,
        [zoneId]: {
          ...getZoneOrDefault(state.zoneValues, zoneId),
          font_id: fontId,
        },
      },
    })),

  setZoneFontSize: (zoneId, fontSize) =>
    set((state) => ({
      zoneValues: {
        ...state.zoneValues,
        [zoneId]: {
          ...getZoneOrDefault(state.zoneValues, zoneId),
          fontSize,
        },
      },
    })),

  setZoneFill: (zoneId, fill) =>
    set((state) => ({
      zoneValues: {
        ...state.zoneValues,
        [zoneId]: { ...getZoneOrDefault(state.zoneValues, zoneId), fill },
      },
    })),

  setZoneImageDataUrl: (zoneId, dataUrl) =>
    set((state) => ({
      zoneValues: {
        ...state.zoneValues,
        [zoneId]: {
          ...getZoneOrDefault(state.zoneValues, zoneId),
          imageDataUrl: dataUrl,
        },
      },
    })),

  resetZone: (zoneId) =>
    set((state) => {
      const next = { ...state.zoneValues };
      delete next[zoneId];
      return { zoneValues: next };
    }),

  resetAllZones: () => set({ zoneValues: {} }),
});

function getZoneOrDefault(
  zones: Record<string, ZoneValue>,
  zoneId: string
): ZoneValue {
  return zones[zoneId] ?? { zone_id: zoneId, content: "" };
}
