"use client";

import { useEffect, useRef } from "react";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { useTextureFromConfig } from "@/lib/hooks/use-texture-from-config";

interface ConfiguratorModelProps {
  modelUrl: string;
}

export function ConfiguratorModel({ modelUrl }: ConfiguratorModelProps) {
  const { scene } = useGLTF(modelUrl);
  const texture = useTextureFromConfig();
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const mats: THREE.Material[] = [];
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.material) return;
      if ("map" in child.material) {
        mats.push(child.material);
      }
    });
    materialsRef.current = mats;
  }, [scene]);

  useEffect(() => {
    if (!texture || materialsRef.current.length === 0) return;

    for (const mat of materialsRef.current) {
      (mat as THREE.MeshStandardMaterial).map = texture;
      mat.needsUpdate = true;
    }
  }, [texture]);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}
