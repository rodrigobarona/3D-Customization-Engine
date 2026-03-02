"use client";

import { useControls, folder } from "leva";

export function useDevControls() {
  const lighting = useControls("Lighting", {
    ambientIntensity: { value: 0.4, min: 0, max: 2, step: 0.1 },
    directionalIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    directionalPosition: folder({
      x: { value: 5, min: -10, max: 10 },
      y: { value: 5, min: -10, max: 10 },
      z: { value: 5, min: -10, max: 10 },
    }),
  });

  const camera = useControls("Camera", {
    fov: { value: 45, min: 20, max: 120, step: 1 },
    minDistance: { value: 1.5, min: 0.5, max: 5, step: 0.1 },
    maxDistance: { value: 6, min: 3, max: 20, step: 0.5 },
  });

  const model = useControls("Model", {
    positionY: { value: -1, min: -3, max: 3, step: 0.1 },
    scale: { value: 1, min: 0.1, max: 3, step: 0.1 },
  });

  return { lighting, camera, model };
}
