"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useConfiguratorStore } from "@/store/configurator-store";
import { generateTexture } from "@/lib/texture-engine";
import { Download, Loader2 } from "lucide-react";

export function ExportButton() {
  const product = useConfiguratorStore((s) => s.product);
  const baseColor = useConfiguratorStore((s) => s.baseColor);
  const zoneValues = useConfiguratorStore((s) => s.zoneValues);
  const isExporting = useConfiguratorStore((s) => s.isExporting);
  const setIsExporting = useConfiguratorStore((s) => s.setIsExporting);

  const handleExport = useCallback(async () => {
    if (!product || isExporting) return;

    setIsExporting(true);
    try {
      const result = await generateTexture({ product, baseColor, zoneValues });
      const link = document.createElement("a");
      link.download = `${product.slug}-custom-texture.png`;
      link.href = result.dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  }, [product, baseColor, zoneValues, isExporting, setIsExporting]);

  return (
    <Button
      onClick={handleExport}
      disabled={!product || isExporting}
      className="w-full"
      size="lg"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export Texture
        </>
      )}
    </Button>
  );
}
