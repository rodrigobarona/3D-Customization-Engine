import type { StateCreator } from "zustand";
import type { StudioStore } from "../studio-store";

export type StudioTool = "select" | "draw";

export interface StudioUISlice {
  selectedZoneId: string | null;
  activeTool: StudioTool;
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  showTexture: boolean;
  setSelectedZoneId: (id: string | null) => void;
  setActiveTool: (tool: StudioTool) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleTexture: () => void;
}

export const createStudioUISlice: StateCreator<
  StudioStore,
  [],
  [],
  StudioUISlice
> = (set) => ({
  selectedZoneId: null,
  activeTool: "select",
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showGrid: true,
  showTexture: false,

  setSelectedZoneId: (id) => set({ selectedZoneId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleTexture: () => set((s) => ({ showTexture: !s.showTexture })),
});
