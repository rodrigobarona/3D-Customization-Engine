"use client";

import { Suspense, useEffect, useRef } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ConfiguratorModel } from "./configurator-model";
import { useConfiguratorStore } from "@/store/configurator-store";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const ZONE_CAMERA_ANGLES: Record<string, number> = {
  front_text: 0,
  back_name: Math.PI,
  back_number: Math.PI,
  sleeve_logo: Math.PI / 2.5,
};

const ANIMATION_SPEED = 4;
const SNAP_THRESHOLD = 0.01;

interface ConfiguratorSceneProps {
  modelUrl: string;
}

export function ConfiguratorScene({ modelUrl }: ConfiguratorSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[30, 30, 30]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-20, 15, 15]} intensity={0.3} />
      <Suspense fallback={null}>
        <ConfiguratorModel modelUrl={modelUrl} />
        <Environment preset="studio" />
      </Suspense>
      <CameraController controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={100}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
        enablePan={false}
      />
    </>
  );
}

function CameraController({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const activeZoneId = useConfiguratorStore((s) => s.activeZoneId);
  const targetAngle = useRef<number | null>(null);
  const animating = useRef(false);

  useEffect(() => {
    if (!activeZoneId) return;
    const angle = ZONE_CAMERA_ANGLES[activeZoneId];
    if (angle !== undefined) {
      targetAngle.current = angle;
      animating.current = true;
    }
  }, [activeZoneId]);

  useFrame((_, delta) => {
    if (!animating.current || targetAngle.current === null || !controlsRef.current)
      return;

    const controls = controlsRef.current;
    const camera = controls.object;
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    let diff = targetAngle.current - spherical.theta;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    if (Math.abs(diff) < SNAP_THRESHOLD) {
      animating.current = false;
      return;
    }

    spherical.theta = THREE.MathUtils.damp(
      spherical.theta,
      spherical.theta + diff,
      ANIMATION_SPEED,
      delta
    );

    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  });

  return null;
}
