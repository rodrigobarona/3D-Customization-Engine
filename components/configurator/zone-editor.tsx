"use client";

import { useCallback, useRef } from "react";
import { useConfiguratorStore } from "@/store/configurator-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import type { PersonalizationZone } from "@/lib/schemas";

export function ZoneEditor() {
  const product = useConfiguratorStore((s) => s.product);
  const activeZoneId = useConfiguratorStore((s) => s.activeZoneId);

  if (!product || !activeZoneId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a zone above to customize it
        </p>
      </div>
    );
  }

  const zone = product.zones.find((z) => z.id === activeZoneId);
  if (!zone) return null;

  switch (zone.type) {
    case "text":
      return <TextZoneEditor zone={zone} />;
    case "number":
      return <NumberZoneEditor zone={zone} />;
    case "image":
      return <ImageZoneEditor zone={zone} />;
  }
}

function TextZoneEditor({ zone }: { zone: PersonalizationZone }) {
  const product = useConfiguratorStore((s) => s.product);
  const zoneValues = useConfiguratorStore((s) => s.zoneValues);
  const setZoneContent = useConfiguratorStore((s) => s.setZoneContent);
  const setZoneFontId = useConfiguratorStore((s) => s.setZoneFontId);
  const setZoneFill = useConfiguratorStore((s) => s.setZoneFill);
  const resetZone = useConfiguratorStore((s) => s.resetZone);

  const value = zoneValues[zone.id];
  const content = value?.content ?? "";
  const maxChars = zone.constraints?.max_characters ?? 50;

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{zone.name}</h4>
        {content && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => resetZone(zone.id)}
            aria-label="Clear zone"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`zone-${zone.id}-content`}>Text</Label>
        <Input
          id={`zone-${zone.id}-content`}
          value={content}
          onChange={(e) => setZoneContent(zone.id, e.target.value)}
          maxLength={maxChars}
          placeholder={`Enter ${zone.name.toLowerCase()}...`}
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/{maxChars}
        </p>
      </div>

      {product && product.fonts.length > 0 && (
        <div className="space-y-2">
          <Label>Font</Label>
          <Select
            value={value?.font_id ?? zone.defaults?.font ?? product.fonts[0].id}
            onValueChange={(v) => setZoneFontId(zone.id, v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {product.fonts.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`zone-${zone.id}-color`}>Text Color</Label>
        <div className="flex items-center gap-2">
          <input
            id={`zone-${zone.id}-color`}
            type="color"
            value={value?.fill ?? zone.defaults?.fill ?? "#FFFFFF"}
            onChange={(e) => setZoneFill(zone.id, e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-border"
          />
          <span className="text-xs text-muted-foreground font-mono">
            {value?.fill ?? zone.defaults?.fill ?? "#FFFFFF"}
          </span>
        </div>
      </div>
    </div>
  );
}

function NumberZoneEditor({ zone }: { zone: PersonalizationZone }) {
  const zoneValues = useConfiguratorStore((s) => s.zoneValues);
  const setZoneContent = useConfiguratorStore((s) => s.setZoneContent);
  const setZoneFill = useConfiguratorStore((s) => s.setZoneFill);
  const resetZone = useConfiguratorStore((s) => s.resetZone);

  const value = zoneValues[zone.id];
  const content = value?.content ?? "";
  const minVal = zone.constraints?.min_value ?? 0;
  const maxVal = zone.constraints?.max_value ?? 99;

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{zone.name}</h4>
        {content && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => resetZone(zone.id)}
            aria-label="Clear zone"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`zone-${zone.id}-number`}>Number</Label>
        <Input
          id={`zone-${zone.id}-number`}
          type="number"
          value={content}
          onChange={(e) => {
            const num = parseInt(e.target.value, 10);
            if (isNaN(num)) {
              setZoneContent(zone.id, "");
              return;
            }
            if (num >= minVal && num <= maxVal) {
              setZoneContent(zone.id, String(num));
            }
          }}
          min={minVal}
          max={maxVal}
          placeholder={`${minVal}-${maxVal}`}
        />
        <p className="text-xs text-muted-foreground">
          Range: {minVal} - {maxVal}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`zone-${zone.id}-ncolor`}>Number Color</Label>
        <div className="flex items-center gap-2">
          <input
            id={`zone-${zone.id}-ncolor`}
            type="color"
            value={value?.fill ?? zone.defaults?.fill ?? "#FFFFFF"}
            onChange={(e) => setZoneFill(zone.id, e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-border"
          />
          <span className="text-xs text-muted-foreground font-mono">
            {value?.fill ?? zone.defaults?.fill ?? "#FFFFFF"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ImageZoneEditor({ zone }: { zone: PersonalizationZone }) {
  const zoneValues = useConfiguratorStore((s) => s.zoneValues);
  const setZoneContent = useConfiguratorStore((s) => s.setZoneContent);
  const setZoneImageDataUrl = useConfiguratorStore(
    (s) => s.setZoneImageDataUrl
  );
  const resetZone = useConfiguratorStore((s) => s.resetZone);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const value = zoneValues[zone.id];
  const hasImage = !!value?.imageDataUrl;
  const allowedFormats = zone.constraints?.allowed_formats ?? [
    "png",
    "jpg",
    "jpeg",
    "webp",
  ];
  const acceptStr = allowedFormats.map((f) => `.${f}`).join(",");

  const handleFile = useCallback(
    (file: File) => {
      const formats = zone.constraints?.allowed_formats ?? [
        "png",
        "jpg",
        "jpeg",
        "webp",
      ];
      const validType = formats.some(
        (fmt) =>
          file.type === `image/${fmt}` ||
          (fmt === "jpg" && file.type === "image/jpeg") ||
          (fmt === "svg" && file.type === "image/svg+xml")
      );
      if (!validType) return;

      const maxSize = zone.constraints?.max_width
        ? zone.constraints.max_width * zone.constraints.max_height! * 4
        : 2 * 1024 * 1024;
      if (file.size > maxSize) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setZoneContent(zone.id, file.name);
        setZoneImageDataUrl(zone.id, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [zone, setZoneContent, setZoneImageDataUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{zone.name}</h4>
        {hasImage && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => resetZone(zone.id)}
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {hasImage ? (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-border/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value!.imageDataUrl}
            alt="Uploaded logo"
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/50 p-6 transition-colors hover:border-primary/50 hover:bg-accent/30"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground/70">
            {allowedFormats.map((f) => f.toUpperCase()).join(", ")}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptStr}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
    </div>
  );
}
