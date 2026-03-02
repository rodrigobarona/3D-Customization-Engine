import type { StateCreator } from "zustand";
import type { PersonalizationZone } from "@/lib/schemas";
import type { StudioStore } from "../studio-store";

const MAX_HISTORY = 50;

export interface StudioHistorySlice {
  undoStack: PersonalizationZone[][];
  redoStack: PersonalizationZone[][];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const createStudioHistorySlice: StateCreator<
  StudioStore,
  [],
  [],
  StudioHistorySlice
> = (set, get) => ({
  undoStack: [],
  redoStack: [],

  pushHistory: () => {
    const snapshot = get().zones.map((z) => ({ ...z, uv: { ...z.uv } }));
    set((s) => ({
      undoStack: [...s.undoStack.slice(-MAX_HISTORY + 1), snapshot],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack, zones } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    const currentSnapshot = zones.map((z) => ({ ...z, uv: { ...z.uv } }));
    set({
      zones: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, currentSnapshot],
    });
  },

  redo: () => {
    const { redoStack, zones } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const currentSnapshot = zones.map((z) => ({ ...z, uv: { ...z.uv } }));
    set({
      zones: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, currentSnapshot],
    });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
});
