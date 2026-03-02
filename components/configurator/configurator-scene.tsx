"use client";

import { Suspense } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { ConfiguratorModel } from "./configurator-model";

interface ConfiguratorSceneProps {
  modelUrl: string;
}

export function ConfiguratorScene({ modelUrl }: ConfiguratorSceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, 2]} intensity={0.3} />
      <Suspense fallback={null}>
        <ConfiguratorModel modelUrl={modelUrl} />
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1.5}
        maxDistance={6}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
        enablePan={false}
      />
    </>
  );
}
