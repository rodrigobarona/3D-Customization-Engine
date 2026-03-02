"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStudioStore } from "@/store/studio-store";
import type { PersonalizationZone } from "@/lib/schemas";

const TEXTURE_SIZE = 2048;
const MIN_ZONE_SIZE = 20;

const BASE_TEXTURE_PATHS: Record<string, string> = {
  "/3d/Men-Regular-Apparel-Fit-Sporty-T-Shirt/Men Sporty T-Shirt.glb":
    "/3d/Men-Regular-Apparel-Fit-Sporty-T-Shirt/Men Sporty T-Shirt (1)/textures/Default_material_baseColor.jpeg",
};

const ZONE_COLORS: Record<string, string> = {
  text: "rgba(59, 130, 246, 0.35)",
  number: "rgba(168, 85, 247, 0.35)",
  image: "rgba(34, 197, 94, 0.35)",
};
const ZONE_BORDERS: Record<string, string> = {
  text: "rgb(59, 130, 246)",
  number: "rgb(168, 85, 247)",
  image: "rgb(34, 197, 94)",
};

type DragState =
  | { type: "idle" }
  | { type: "move"; zoneId: string; startX: number; startY: number; origX: number; origY: number }
  | { type: "resize"; zoneId: string; handle: ResizeHandle; startX: number; startY: number; origUV: { x: number; y: number; width: number; height: number } }
  | { type: "draw"; startX: number; startY: number; currentX: number; currentY: number };

type ResizeHandle = "nw" | "ne" | "sw" | "se";

export function UVMapEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [drag, setDrag] = useState<DragState>({ type: "idle" });

  const zones = useStudioStore((s) => s.zones);
  const selectedZoneId = useStudioStore((s) => s.selectedZoneId);
  const activeTool = useStudioStore((s) => s.activeTool);
  const zoom = useStudioStore((s) => s.zoom);
  const showGrid = useStudioStore((s) => s.showGrid);
  const showTexture = useStudioStore((s) => s.showTexture);
  const modelUrl = useStudioStore((s) => s.modelUrl);
  const setSelectedZoneId = useStudioStore((s) => s.setSelectedZoneId);
  const updateZoneUV = useStudioStore((s) => s.updateZoneUV);
  const addZone = useStudioStore((s) => s.addZone);
  const setActiveTool = useStudioStore((s) => s.setActiveTool);
  const setZoom = useStudioStore((s) => s.setZoom);

  const textureUrl = useMemo(
    () => (showTexture ? BASE_TEXTURE_PATHS[modelUrl] ?? null : null),
    [showTexture, modelUrl]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(
    containerSize.width / TEXTURE_SIZE,
    containerSize.height / TEXTURE_SIZE
  ) * zoom;

  const canvasW = TEXTURE_SIZE * scale;
  const canvasH = TEXTURE_SIZE * scale;
  const offsetX = (containerSize.width - canvasW) / 2;
  const offsetY = (containerSize.height - canvasH) / 2;

  const screenToUV = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const sx = clientX - rect.left - offsetX;
      const sy = clientY - rect.top - offsetY;
      return {
        x: Math.round(sx / scale),
        y: Math.round(sy / scale),
      };
    },
    [offsetX, offsetY, scale]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;

      if (activeTool === "draw") {
        const uv = screenToUV(e.clientX, e.clientY);
        setDrag({ type: "draw", startX: uv.x, startY: uv.y, currentX: uv.x, currentY: uv.y });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      setSelectedZoneId(null);
    },
    [activeTool, screenToUV, setSelectedZoneId]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (drag.type === "idle") return;

      if (drag.type === "draw") {
        const uv = screenToUV(e.clientX, e.clientY);
        setDrag({ ...drag, currentX: uv.x, currentY: uv.y });
        return;
      }

      if (drag.type === "move") {
        const uv = screenToUV(e.clientX, e.clientY);
        const dx = uv.x - drag.startX;
        const dy = uv.y - drag.startY;
        const zone = zones.find((z) => z.id === drag.zoneId);
        if (!zone) return;
        updateZoneUV(drag.zoneId, {
          x: clamp(drag.origX + dx, 0, TEXTURE_SIZE - zone.uv.width),
          y: clamp(drag.origY + dy, 0, TEXTURE_SIZE - zone.uv.height),
          width: zone.uv.width,
          height: zone.uv.height,
        });
        return;
      }

      if (drag.type === "resize") {
        const uv = screenToUV(e.clientX, e.clientY);
        const { handle, origUV } = drag;
        let { x, y, width, height } = origUV;

        const dx = uv.x - drag.startX;
        const dy = uv.y - drag.startY;

        if (handle.includes("w")) {
          const newX = clamp(x + dx, 0, x + width - MIN_ZONE_SIZE);
          width = width - (newX - x);
          x = newX;
        }
        if (handle.includes("e")) {
          width = clamp(width + dx, MIN_ZONE_SIZE, TEXTURE_SIZE - x);
        }
        if (handle.includes("n")) {
          const newY = clamp(y + dy, 0, y + height - MIN_ZONE_SIZE);
          height = height - (newY - y);
          y = newY;
        }
        if (handle.includes("s")) {
          height = clamp(height + dy, MIN_ZONE_SIZE, TEXTURE_SIZE - y);
        }

        updateZoneUV(drag.zoneId, { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) });
      }
    },
    [drag, screenToUV, zones, updateZoneUV]
  );

  const handlePointerUp = useCallback(() => {
    if (drag.type === "draw") {
      const x = Math.min(drag.startX, drag.currentX);
      const y = Math.min(drag.startY, drag.currentY);
      const w = Math.abs(drag.currentX - drag.startX);
      const h = Math.abs(drag.currentY - drag.startY);

      if (w >= MIN_ZONE_SIZE && h >= MIN_ZONE_SIZE) {
        const newZone: PersonalizationZone = {
          id: `zone_${Date.now()}`,
          name: `Zone ${zones.length + 1}`,
          type: "text",
          uv: {
            x: clamp(Math.round(x), 0, TEXTURE_SIZE),
            y: clamp(Math.round(y), 0, TEXTURE_SIZE),
            width: Math.round(w),
            height: Math.round(h),
          },
        };
        addZone(newZone);
        setSelectedZoneId(newZone.id);
        setActiveTool("select");
      }
    }
    setDrag({ type: "idle" });
  }, [drag, zones.length, addZone, setSelectedZoneId, setActiveTool]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    },
    [zoom, setZoom]
  );

  const startMove = useCallback(
    (e: React.PointerEvent, zone: PersonalizationZone) => {
      if (activeTool !== "select") return;
      e.stopPropagation();
      setSelectedZoneId(zone.id);
      const uv = screenToUV(e.clientX, e.clientY);
      setDrag({
        type: "move",
        zoneId: zone.id,
        startX: uv.x,
        startY: uv.y,
        origX: zone.uv.x,
        origY: zone.uv.y,
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [activeTool, screenToUV, setSelectedZoneId]
  );

  const startResize = useCallback(
    (e: React.PointerEvent, zone: PersonalizationZone, handle: ResizeHandle) => {
      e.stopPropagation();
      const uv = screenToUV(e.clientX, e.clientY);
      setDrag({
        type: "resize",
        zoneId: zone.id,
        handle,
        startX: uv.x,
        startY: uv.y,
        origUV: { ...zone.uv },
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [screenToUV]
  );

  const drawPreview =
    drag.type === "draw"
      ? {
          x: Math.min(drag.startX, drag.currentX),
          y: Math.min(drag.startY, drag.currentY),
          width: Math.abs(drag.currentX - drag.startX),
          height: Math.abs(drag.currentY - drag.startY),
        }
      : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-neutral-900"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: activeTool === "draw" ? "crosshair" : "default" }}
    >
      <div
        className="absolute"
        style={{
          left: offsetX,
          top: offsetY,
          width: canvasW,
          height: canvasH,
        }}
      >
        {/* UV Canvas background */}
        <div className="absolute inset-0 bg-neutral-800 overflow-hidden">
          {textureUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={textureUrl}
              alt="Base texture"
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              draggable={false}
            />
          )}
        </div>

        {/* Grid overlay (rendered above texture) */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: `${scale * 128}px ${scale * 128}px`,
            }}
          />
        )}

        {/* Texture size label */}
        <div className="absolute -top-6 left-0 text-[10px] font-mono text-neutral-500">
          {TEXTURE_SIZE} x {TEXTURE_SIZE} &middot; {Math.round(zoom * 100)}%
        </div>

        {/* Zone overlays */}
        {zones.map((zone) => (
          <ZoneOverlay
            key={zone.id}
            zone={zone}
            scale={scale}
            isSelected={selectedZoneId === zone.id}
            onPointerDown={(e) => startMove(e, zone)}
            onResizeStart={(e, handle) => startResize(e, zone, handle)}
          />
        ))}

        {/* Draw preview */}
        {drawPreview && (
          <div
            className="absolute border-2 border-dashed border-white/60 bg-white/10 pointer-events-none"
            style={{
              left: drawPreview.x * scale,
              top: drawPreview.y * scale,
              width: drawPreview.width * scale,
              height: drawPreview.height * scale,
            }}
          />
        )}
      </div>
    </div>
  );
}

function ZoneOverlay({
  zone,
  scale,
  isSelected,
  onPointerDown,
  onResizeStart,
}: {
  zone: PersonalizationZone;
  scale: number;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent, handle: ResizeHandle) => void;
}) {
  const bg = ZONE_COLORS[zone.type] ?? ZONE_COLORS.text;
  const border = ZONE_BORDERS[zone.type] ?? ZONE_BORDERS.text;
  const handles: ResizeHandle[] = ["nw", "ne", "sw", "se"];

  return (
    <div
      className="absolute select-none"
      style={{
        left: zone.uv.x * scale,
        top: zone.uv.y * scale,
        width: zone.uv.width * scale,
        height: zone.uv.height * scale,
        backgroundColor: bg,
        border: `2px solid ${isSelected ? "white" : border}`,
        boxShadow: isSelected ? "0 0 0 2px rgba(255,255,255,0.4)" : undefined,
        cursor: "move",
        zIndex: isSelected ? 20 : 10,
      }}
      onPointerDown={onPointerDown}
    >
      {/* Zone label */}
      <div
        className="absolute -top-5 left-0 truncate whitespace-nowrap rounded px-1 py-0.5 text-[10px] font-medium text-white pointer-events-none"
        style={{ backgroundColor: border, maxWidth: zone.uv.width * scale }}
      >
        {zone.name}
      </div>

      {/* Type badge */}
      <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-mono text-white/70 pointer-events-none">
        {zone.type}
      </div>

      {/* Resize handles (only when selected) */}
      {isSelected &&
        handles.map((h) => (
          <div
            key={h}
            className="absolute h-3 w-3 rounded-sm border border-white bg-white/90"
            style={{
              top: h.includes("n") ? -6 : undefined,
              bottom: h.includes("s") ? -6 : undefined,
              left: h.includes("w") ? -6 : undefined,
              right: h.includes("e") ? -6 : undefined,
              cursor: h === "nw" || h === "se" ? "nwse-resize" : "nesw-resize",
              zIndex: 30,
            }}
            onPointerDown={(e) => onResizeStart(e, h)}
          />
        ))}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
