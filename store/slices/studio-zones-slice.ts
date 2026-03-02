import type { StateCreator } from "zustand";
import type { PersonalizationZone, ZoneBounds } from "@/lib/schemas";
import type { StudioStore } from "../studio-store";

export interface StudioZonesSlice {
  zones: PersonalizationZone[];
  setZones: (zones: PersonalizationZone[]) => void;
  addZone: (zone: PersonalizationZone) => void;
  updateZone: (id: string, updates: Partial<PersonalizationZone>) => void;
  updateZoneUV: (id: string, uv: ZoneBounds) => void;
  removeZone: (id: string) => void;
  reorderZones: (oldIndex: number, newIndex: number) => void;
  duplicateZone: (id: string) => void;
}

export const createStudioZonesSlice: StateCreator<
  StudioStore,
  [],
  [],
  StudioZonesSlice
> = (set, get) => ({
  zones: [],

  setZones: (zones) => {
    get().pushHistory();
    set({ zones });
  },

  addZone: (zone) => {
    get().pushHistory();
    set((s) => ({ zones: [...s.zones, zone] }));
  },

  updateZone: (id, updates) => {
    get().pushHistory();
    set((s) => ({
      zones: s.zones.map((z) => (z.id === id ? { ...z, ...updates } : z)),
    }));
  },

  updateZoneUV: (id, uv) => {
    get().pushHistory();
    set((s) => ({
      zones: s.zones.map((z) => (z.id === id ? { ...z, uv } : z)),
    }));
  },

  removeZone: (id) => {
    get().pushHistory();
    set((s) => ({
      zones: s.zones.filter((z) => z.id !== id),
      selectedZoneId: s.selectedZoneId === id ? null : s.selectedZoneId,
    }));
  },

  reorderZones: (oldIndex, newIndex) => {
    get().pushHistory();
    set((s) => {
      const next = [...s.zones];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return { zones: next };
    });
  },

  duplicateZone: (id) => {
    get().pushHistory();
    set((s) => {
      const source = s.zones.find((z) => z.id === id);
      if (!source) return s;
      const clone: PersonalizationZone = {
        ...source,
        id: `${source.id}_copy_${Date.now()}`,
        name: `${source.name} (copy)`,
        uv: { ...source.uv, x: source.uv.x + 20, y: source.uv.y + 20 },
      };
      return { zones: [...s.zones, clone] };
    });
  },
});
