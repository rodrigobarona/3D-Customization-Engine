"use client";

import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useTextureFromConfig } from "@/lib/hooks/use-texture-from-config";
import { useConfiguratorStore } from "@/store/configurator-store";

interface ConfiguratorModelProps {
  modelUrl: string;
}

export function ConfiguratorModel({ modelUrl }: ConfiguratorModelProps) {
  const { scene } = useGLTF(modelUrl);
  const texture = useTextureFromConfig();
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const product = useConfiguratorStore((s) => s.product);

  useEffect(() => {
    if (!product) return;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (
          mat.name === "Default_material" ||
          mat.name === "Material" ||
          mat.map
        ) {
          materialRef.current = mat;
        }
      }
    });
  }, [scene, product]);

  useEffect(() => {
    if (!materialRef.current || !texture) return;

    materialRef.current.map = texture;
    materialRef.current.needsUpdate = true;
  }, [texture]);

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, -1, 0]}
      rotation={[0, 0, 0]}
    />
  );
}
