"use client";

import { useEffect, useState } from "react";
import { ConfiguratorLayout } from "@/components/configurator/configurator-layout";
import { MOCK_TSHIRT } from "@/data/mock-product";
import { ProductConfigSchema, type ProductConfig } from "@/lib/schemas";
import { STUDIO_STORAGE_KEY } from "@/lib/constants";

export default function ConfiguratorPage() {
  const [product, setProduct] = useState<ProductConfig>(MOCK_TSHIRT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
      if (!raw) return;
      const parsed = ProductConfigSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        setProduct(parsed.data);
      }
    } catch {
      // localStorage unavailable or corrupt -- use mock
    }
  }, []);

  return <ConfiguratorLayout product={product} />;
}
