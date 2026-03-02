"use client";

import { useEffect } from "react";
import { ConfiguratorViewport } from "./configurator-viewport";
import { ConfiguratorPanel } from "./configurator-panel";
import { useConfiguratorStore } from "@/store/configurator-store";
import type { ProductConfig } from "@/lib/schemas";

interface ConfiguratorLayoutProps {
  product: ProductConfig;
}

export function ConfiguratorLayout({ product }: ConfiguratorLayoutProps) {
  const setProduct = useConfiguratorStore((s) => s.setProduct);
  const setBaseColor = useConfiguratorStore((s) => s.setBaseColor);

  useEffect(() => {
    setProduct(product);
    if (product.colors.length > 0) {
      setBaseColor(product.colors[0].hex);
    }
  }, [product, setProduct, setBaseColor]);

  return (
    <div className="flex h-dvh w-full flex-col md:flex-row">
      <div className="relative h-[50dvh] w-full bg-muted/20 md:h-full md:flex-[65]">
        <ConfiguratorViewport />
      </div>

      <div className="h-[50dvh] w-full border-t border-border/50 bg-background md:h-full md:max-w-[420px] md:flex-[35] md:border-t-0 md:border-l">
        <ConfiguratorPanel />
      </div>
    </div>
  );
}
