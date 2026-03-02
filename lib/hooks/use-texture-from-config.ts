"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useConfiguratorStore } from "@/store/configurator-store";
import { generateTextureSync, type TextureEngineConfig } from "@/lib/texture-engine";

const DEBOUNCE_MS = 150;

export function useTextureFromConfig(): THREE.CanvasTexture | null {
  const product = useConfiguratorStore((s) => s.product);
  const baseColor = useConfiguratorStore((s) => s.baseColor);
  const zoneValues = useConfiguratorStore((s) => s.zoneValues);

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!product) return;

    const config: TextureEngineConfig = { product, baseColor, zoneValues };

    const generate = () => {
      const canvas = generateTextureSync(config);

      setTexture((prev) => {
        if (prev) {
          prev.image = canvas;
          prev.needsUpdate = true;
          return prev;
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      });
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      generate();
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(generate, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [product, baseColor, zoneValues]);

  return texture;
}
