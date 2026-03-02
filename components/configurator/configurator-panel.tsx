"use client";

import { ColorSelector } from "./color-selector";
import { ZoneNavigator } from "./zone-navigator";
import { ZoneEditor } from "./zone-editor";
import { ExportButton } from "./export-button";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useConfiguratorStore } from "@/store/configurator-store";
import { RotateCcw } from "lucide-react";

export function ConfiguratorPanel() {
  const product = useConfiguratorStore((s) => s.product);
  const resetAllZones = useConfiguratorStore((s) => s.resetAllZones);

  if (!product) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{product.name}</h2>
          <p className="text-xs text-muted-foreground">
            Customize your design
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={resetAllZones}
          aria-label="Reset all customizations"
          title="Reset all"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <ColorSelector />

        <Separator />

        <ZoneNavigator />

        <ZoneEditor />
      </div>

      <div className="border-t border-border/50 p-4">
        <ExportButton />
      </div>
    </div>
  );
}
