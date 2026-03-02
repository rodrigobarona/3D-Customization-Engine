"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/store/studio-store";
import { MOCK_TSHIRT } from "@/data/mock-product";
import { StudioToolbar } from "@/components/studio/studio-toolbar";
import { ZoneListPanel } from "@/components/studio/zone-list-panel";
import { UVMapEditor } from "@/components/studio/uv-map-editor";
import { ZonePropertiesPanel } from "@/components/studio/zone-properties-panel";
import { StudioPreviewToggle } from "@/components/studio/studio-preview";

function useStudioKeyboard() {
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const setActiveTool = useStudioStore((s) => s.setActiveTool);
  const removeZone = useStudioStore((s) => s.removeZone);
  const selectedZoneId = useStudioStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useStudioStore((s) => s.setSelectedZoneId);
  const toggleTexture = useStudioStore((s) => s.toggleTexture);
  const toggleGrid = useStudioStore((s) => s.toggleGrid);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")
        return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === "v" || e.key === "V") {
        setActiveTool("select");
      } else if (e.key === "d" || e.key === "D") {
        setActiveTool("draw");
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedZoneId) {
        e.preventDefault();
        removeZone(selectedZoneId);
      } else if (e.key === "t" || e.key === "T") {
        toggleTexture();
      } else if (e.key === "g" || e.key === "G") {
        toggleGrid();
      } else if (e.key === "Escape") {
        setSelectedZoneId(null);
        setActiveTool("select");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, setActiveTool, removeZone, selectedZoneId, setSelectedZoneId, toggleTexture, toggleGrid]);
}

export default function StudioPage() {
  const setZones = useStudioStore((s) => s.setZones);
  const setProductMeta = useStudioStore((s) => s.setProductMeta);
  const setColors = useStudioStore((s) => s.setColors);
  const setFonts = useStudioStore((s) => s.setFonts);
  const zones = useStudioStore((s) => s.zones);

  useStudioKeyboard();

  useEffect(() => {
    if (zones.length > 0) return;
    setProductMeta({
      id: MOCK_TSHIRT.id,
      slug: MOCK_TSHIRT.slug,
      name: MOCK_TSHIRT.name,
      modelUrl: MOCK_TSHIRT.model_url,
    });
    setColors(MOCK_TSHIRT.colors);
    setFonts(MOCK_TSHIRT.fonts);
    setZones(MOCK_TSHIRT.zones);
  }, [zones.length, setZones, setProductMeta, setColors, setFonts]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <StudioToolbar />
      <div className="flex flex-1 overflow-hidden">
        <ZoneListPanel />
        <div className="relative flex-1 overflow-hidden">
          <UVMapEditor />
          <StudioPreviewToggle />
        </div>
        <ZonePropertiesPanel />
      </div>
    </div>
  );
}
