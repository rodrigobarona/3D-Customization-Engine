"use client";

import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/store/configurator-store";
import { Type, Hash, ImageIcon } from "lucide-react";

const ZONE_ICONS = {
  text: Type,
  number: Hash,
  image: ImageIcon,
} as const;

export function ZoneNavigator() {
  const product = useConfiguratorStore((s) => s.product);
  const activeZoneId = useConfiguratorStore((s) => s.activeZoneId);
  const setActiveZoneId = useConfiguratorStore((s) => s.setActiveZoneId);

  if (!product) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Personalization Zones</h3>
      <div className="grid grid-cols-2 gap-2">
        {product.zones.map((zone) => {
          const Icon = ZONE_ICONS[zone.type];
          const isActive = activeZoneId === zone.id;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setActiveZoneId(isActive ? null : zone.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                isActive
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border/50 bg-card hover:border-border hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{zone.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
