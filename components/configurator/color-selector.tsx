"use client";

import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/store/configurator-store";

export function ColorSelector() {
  const product = useConfiguratorStore((s) => s.product);
  const baseColor = useConfiguratorStore((s) => s.baseColor);
  const setBaseColor = useConfiguratorStore((s) => s.setBaseColor);

  if (!product) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Base Color</h3>
        <span className="text-xs text-muted-foreground">
          {product.colors.find((c) => c.hex === baseColor)?.name ?? "Custom"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {product.colors.map((color) => (
          <button
            key={color.id}
            type="button"
            aria-label={`Select ${color.name}`}
            title={color.name}
            onClick={() => setBaseColor(color.hex)}
            className={cn(
              "h-9 w-9 rounded-full border-2 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              baseColor === color.hex
                ? "border-primary ring-2 ring-primary/30 scale-110"
                : "border-border/50"
            )}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}
