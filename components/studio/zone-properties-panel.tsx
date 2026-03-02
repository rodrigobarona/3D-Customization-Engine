"use client";

import { useStudioStore } from "@/store/studio-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import type { PersonalizationZone } from "@/lib/schemas";

export function ZonePropertiesPanel() {
  const zones = useStudioStore((s) => s.zones);
  const selectedZoneId = useStudioStore((s) => s.selectedZoneId);
  const updateZone = useStudioStore((s) => s.updateZone);
  const removeZone = useStudioStore((s) => s.removeZone);
  const duplicateZone = useStudioStore((s) => s.duplicateZone);

  const zone = zones.find((z) => z.id === selectedZoneId);

  if (!zone) {
    return (
      <div className="flex w-72 flex-col items-center justify-center border-l border-border/50 bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Select a zone to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-72 flex-col border-l border-border/50 bg-background">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <h2 className="text-sm font-semibold">Properties</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => duplicateZone(zone.id)}
            title="Duplicate zone"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => removeZone(zone.id)}
            title="Delete zone"
            className="hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <IdentitySection zone={zone} onUpdate={updateZone} />
        <Separator />
        <UVBoundsSection zone={zone} onUpdate={updateZone} />
        <Separator />
        <ConstraintsSection zone={zone} onUpdate={updateZone} />
        <Separator />
        <DefaultsSection zone={zone} onUpdate={updateZone} />
        <Separator />
        <PricingSection zone={zone} onUpdate={updateZone} />
      </div>
    </div>
  );
}

function IdentitySection({
  zone,
  onUpdate,
}: {
  zone: PersonalizationZone;
  onUpdate: (id: string, u: Partial<PersonalizationZone>) => void;
}) {
  return (
    <div className="space-y-3 p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Identity
      </h3>

      <div className="space-y-1.5">
        <Label className="text-xs">ID</Label>
        <Input
          value={zone.id}
          onChange={(e) => onUpdate(zone.id, { id: e.target.value })}
          className="h-8 text-xs font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Name</Label>
        <Input
          value={zone.name}
          onChange={(e) => onUpdate(zone.id, { name: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Type</Label>
        <Select
          value={zone.type}
          onValueChange={(v) =>
            onUpdate(zone.id, { type: v as "text" | "number" | "image" })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function UVBoundsSection({
  zone,
  onUpdate,
}: {
  zone: PersonalizationZone;
  onUpdate: (id: string, u: Partial<PersonalizationZone>) => void;
}) {
  const setUV = (key: "x" | "y" | "width" | "height", raw: string) => {
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 0) return;
    onUpdate(zone.id, { uv: { ...zone.uv, [key]: num } });
  };

  return (
    <div className="space-y-3 p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        UV Bounds (px)
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {(["x", "y", "width", "height"] as const).map((key) => (
          <div key={key} className="space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground">
              {key}
            </Label>
            <Input
              type="number"
              value={zone.uv[key]}
              onChange={(e) => setUV(key, e.target.value)}
              min={0}
              max={2048}
              className="h-7 text-xs font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstraintsSection({
  zone,
  onUpdate,
}: {
  zone: PersonalizationZone;
  onUpdate: (id: string, u: Partial<PersonalizationZone>) => void;
}) {
  const constraints = zone.constraints ?? {};

  const setConstraint = (
    key: string,
    raw: string,
    parser: (v: string) => number | undefined
  ) => {
    const val = parser(raw);
    onUpdate(zone.id, {
      constraints: { ...constraints, [key]: val },
    });
  };

  const parseIntOrUndef = (v: string) => {
    const n = parseInt(v, 10);
    return isNaN(n) ? undefined : n;
  };

  return (
    <div className="space-y-3 p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Constraints
      </h3>

      {(zone.type === "text" || zone.type === "number") && (
        <div className="space-y-1.5">
          <Label className="text-xs">Max characters</Label>
          <Input
            type="number"
            value={constraints.max_characters ?? ""}
            onChange={(e) =>
              setConstraint("max_characters", e.target.value, parseIntOrUndef)
            }
            min={1}
            className="h-8 text-xs"
          />
        </div>
      )}

      {zone.type === "number" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px]">Min value</Label>
            <Input
              type="number"
              value={constraints.min_value ?? ""}
              onChange={(e) =>
                setConstraint("min_value", e.target.value, parseIntOrUndef)
              }
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Max value</Label>
            <Input
              type="number"
              value={constraints.max_value ?? ""}
              onChange={(e) =>
                setConstraint("max_value", e.target.value, parseIntOrUndef)
              }
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      {zone.type === "text" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Font options (comma-sep)</Label>
          <Input
            value={constraints.font_options?.join(", ") ?? ""}
            onChange={(e) =>
              onUpdate(zone.id, {
                constraints: {
                  ...constraints,
                  font_options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
            className="h-8 text-xs"
            placeholder="inter, bebas-neue"
          />
        </div>
      )}

      {zone.type === "image" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Max width</Label>
              <Input
                type="number"
                value={constraints.max_width ?? ""}
                onChange={(e) =>
                  setConstraint("max_width", e.target.value, parseIntOrUndef)
                }
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Max height</Label>
              <Input
                type="number"
                value={constraints.max_height ?? ""}
                onChange={(e) =>
                  setConstraint("max_height", e.target.value, parseIntOrUndef)
                }
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Allowed formats (comma-sep)</Label>
            <Input
              value={constraints.allowed_formats?.join(", ") ?? ""}
              onChange={(e) =>
                onUpdate(zone.id, {
                  constraints: {
                    ...constraints,
                    allowed_formats: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              className="h-8 text-xs"
              placeholder="png, jpg, webp"
            />
          </div>
        </>
      )}
    </div>
  );
}

function DefaultsSection({
  zone,
  onUpdate,
}: {
  zone: PersonalizationZone;
  onUpdate: (id: string, u: Partial<PersonalizationZone>) => void;
}) {
  if (zone.type === "image") return null;

  const defaults = zone.defaults ?? {};

  return (
    <div className="space-y-3 p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Defaults
      </h3>

      <div className="space-y-1.5">
        <Label className="text-xs">Font</Label>
        <Input
          value={defaults.font ?? ""}
          onChange={(e) =>
            onUpdate(zone.id, {
              defaults: { ...defaults, font: e.target.value || undefined },
            })
          }
          className="h-8 text-xs"
          placeholder="Inter"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Font size</Label>
        <Input
          type="number"
          value={defaults.fontSize ?? ""}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onUpdate(zone.id, {
              defaults: {
                ...defaults,
                fontSize: isNaN(n) ? undefined : n,
              },
            });
          }}
          min={1}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Fill color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={defaults.fill ?? "#FFFFFF"}
            onChange={(e) =>
              onUpdate(zone.id, {
                defaults: { ...defaults, fill: e.target.value },
              })
            }
            className="h-8 w-10 cursor-pointer rounded border border-border"
          />
          <span className="text-xs font-mono text-muted-foreground">
            {defaults.fill ?? "#FFFFFF"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PricingSection({
  zone,
  onUpdate,
}: {
  zone: PersonalizationZone;
  onUpdate: (id: string, u: Partial<PersonalizationZone>) => void;
}) {
  return (
    <div className="space-y-3 p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pricing
      </h3>
      <div className="space-y-1.5">
        <Label className="text-xs">Pricing modifier</Label>
        <Input
          type="number"
          step="0.01"
          value={zone.pricing_modifier ?? ""}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onUpdate(zone.id, {
              pricing_modifier: isNaN(n) ? undefined : n,
            });
          }}
          className="h-8 text-xs"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
