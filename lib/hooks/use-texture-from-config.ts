"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useConfiguratorStore } from "@/store/configurator-store";
import { generateTextureSync, type TextureEngineConfig } from "@/lib/texture-engine";
import { areFontsLoaded, loadConfiguratorFonts } from "@/lib/configurator-fonts";

const DEBOUNCE_MS = 150;

export function useTextureFromConfig(): THREE.CanvasTexture | null {
  const product = useConfiguratorStore((s) => s.product);
  const baseColor = useConfiguratorStore((s) => s.baseColor);
  const zoneValues = useConfiguratorStore((s) => s.zoneValues);

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [fontsReady, setFontsReady] = useState(areFontsLoaded);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConfiguratorFonts().then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!product) return;

    const config: TextureEngineConfig = { product, baseColor, zoneValues };

    const generate = () => {
      const canvas = generateTextureSync(config);

      setTexture((prev) => {
        if (prev) prev.dispose();
        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      });
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(generate, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [product, baseColor, zoneValues, fontsReady]);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return texture;
}
