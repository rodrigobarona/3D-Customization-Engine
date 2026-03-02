"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ConfiguratorScene } from "./configurator-scene";
import { ConfiguratorSkeleton } from "./configurator-skeleton";
import { useConfiguratorStore } from "@/store/configurator-store";

export default function ConfiguratorCanvas() {
  const product = useConfiguratorStore((s) => s.product);

  if (!product) {
    return <ConfiguratorSkeleton />;
  }

  return (
    <div className="h-full w-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3], fov: 45 }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <ConfiguratorScene modelUrl={product.model_url} />
        </Suspense>
      </Canvas>
    </div>
  );
}
