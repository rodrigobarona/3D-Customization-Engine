"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { useStudioStore } from "@/store/studio-store";
import { ProductConfigSchema } from "@/lib/schemas";
import { STUDIO_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MousePointer2,
  PenTool,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  ImageIcon,
  Download,
  Upload,
  Save,
  ArrowLeft,
} from "lucide-react";

export function StudioToolbar() {
  const activeTool = useStudioStore((s) => s.activeTool);
  const setActiveTool = useStudioStore((s) => s.setActiveTool);
  const zoom = useStudioStore((s) => s.zoom);
  const setZoom = useStudioStore((s) => s.setZoom);
  const showGrid = useStudioStore((s) => s.showGrid);
  const toggleGrid = useStudioStore((s) => s.toggleGrid);
  const showTexture = useStudioStore((s) => s.showTexture);
  const toggleTexture = useStudioStore((s) => s.toggleTexture);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const canUndo = useStudioStore((s) => s.canUndo);
  const canRedo = useStudioStore((s) => s.canRedo);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const state = useStudioStore.getState();
    const config = {
      id: state.productId,
      slug: state.productSlug,
      name: state.productName,
      model_url: state.modelUrl,
      zones: state.zones,
      colors: state.colors,
      fonts: state.fonts,
    };

    const result = ProductConfigSchema.safeParse(config);
    if (!result.success) {
      toast.error("Invalid configuration", {
        description: result.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.slug}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configuration exported");
  }, []);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const raw = JSON.parse(ev.target?.result as string);
          const result = ProductConfigSchema.safeParse(raw);
          if (!result.success) {
            toast.error("Invalid JSON", {
              description: result.error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("\n"),
            });
            return;
          }

          const config = result.data;
          const store = useStudioStore.getState();
          store.setProductMeta({
            id: config.id,
            slug: config.slug,
            name: config.name,
            modelUrl: config.model_url,
          });
          store.setColors(config.colors);
          store.setFonts(config.fonts);
          store.setZones(config.zones);
          toast.success("Configuration imported", {
            description: `Loaded ${config.zones.length} zones`,
          });
        } catch {
          toast.error("Failed to parse JSON file");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    []
  );

  const handleSave = useCallback(() => {
    const state = useStudioStore.getState();
    const config = {
      id: state.productId,
      slug: state.productSlug,
      name: state.productName,
      model_url: state.modelUrl,
      zones: state.zones,
      colors: state.colors,
      fonts: state.fonts,
    };
    try {
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(config));
      toast.success("Saved to local storage");
    } catch {
      toast.error("Failed to save");
    }
  }, []);

  return (
    <div className="flex items-center gap-1 border-b border-border/50 bg-background px-3 py-1.5">
      <Link href="/" className="mr-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Button>
      </Link>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Tool selection */}
      <Button
        variant={activeTool === "select" ? "secondary" : "ghost"}
        size="icon-xs"
        onClick={() => setActiveTool("select")}
        title="Select tool (V)"
      >
        <MousePointer2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={activeTool === "draw" ? "secondary" : "ghost"}
        size="icon-xs"
        onClick={() => setActiveTool("draw")}
        title="Draw zone tool (D)"
      >
        <PenTool className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={undo}
        disabled={!canUndo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={redo}
        disabled={!canRedo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Zoom */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setZoom(zoom - 0.25)}
        title="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-12 text-center text-xs font-mono text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setZoom(zoom + 0.25)}
        title="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant={showGrid ? "secondary" : "ghost"}
        size="icon-xs"
        onClick={toggleGrid}
        title="Toggle grid"
      >
        <Grid3X3 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={showTexture ? "secondary" : "ghost"}
        size="icon-xs"
        onClick={toggleTexture}
        title="Toggle base texture (T)"
      >
        <ImageIcon className="h-3.5 w-3.5" />
      </Button>

      <div className="flex-1" />

      {/* Import / Export / Save */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleExport}
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>

      <Button
        variant="default"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleSave}
      >
        <Save className="h-3.5 w-3.5" />
        Save
      </Button>
    </div>
  );
}
