"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useStudioStore } from "@/store/studio-store";
import type { PersonalizationZone } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";

const TEXTURE_SIZE = 2048;

const ZONE_FILLS: Record<string, string> = {
  text: "rgba(59, 130, 246, 0.4)",
  number: "rgba(168, 85, 247, 0.4)",
  image: "rgba(34, 197, 94, 0.4)",
};
const ZONE_STROKES: Record<string, string> = {
  text: "#3b82f6",
  number: "#a855f7",
  image: "#22c55e",
};

export function StudioPreviewToggle() {
  const [open, setOpen] = useState(false);
  const modelUrl = useStudioStore((s) => s.modelUrl);

  if (!modelUrl) return null;

  return (
    <>
      {!open && (
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-4 right-4 z-30 gap-1.5 text-xs shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Eye className="h-3.5 w-3.5" />
          3D Preview
        </Button>
      )}

      {open && (
        <div className="absolute bottom-4 right-4 z-30 h-72 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
            <span className="text-xs font-medium">3D Preview</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="h-[calc(100%-2rem)]">
            <StudioPreviewCanvas modelUrl={modelUrl} />
          </div>
        </div>
      )}
    </>
  );
}

function StudioPreviewCanvas({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 50], fov: 45 }}
      className="touch-none"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[30, 30, 30]} intensity={1} />
        <PreviewModel modelUrl={modelUrl} />
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={20}
        maxDistance={100}
      />
    </Canvas>
  );
}

function PreviewModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const zones = useStudioStore((s) => s.zones);
  const selectedZoneId = useStudioStore((s) => s.selectedZoneId);
  const materialsRef = useRef<THREE.Material[]>([]);

  const texture = useZonePreviewTexture(zones, selectedZoneId);

  useEffect(() => {
    const mats: THREE.Material[] = [];
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.material) return;
      if ("map" in child.material) mats.push(child.material);
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

function useZonePreviewTexture(
  zones: PersonalizationZone[],
  selectedZoneId: string | null
) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const zoneKey = useMemo(
    () =>
      zones.map((z) => `${z.id}:${z.uv.x},${z.uv.y},${z.uv.width},${z.uv.height}:${z.type}`).join("|") +
      `|sel:${selectedZoneId}`,
    [zones, selectedZoneId]
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = TEXTURE_SIZE;
      canvas.height = TEXTURE_SIZE;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

      for (const zone of zones) {
        const { x, y, width, height } = zone.uv;
        const isSelected = zone.id === selectedZoneId;

        ctx.fillStyle = ZONE_FILLS[zone.type] ?? ZONE_FILLS.text;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = isSelected
          ? "#ffffff"
          : (ZONE_STROKES[zone.type] ?? ZONE_STROKES.text);
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "#ffffff";
        const fontSize = Math.min(24, height * 0.3);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(zone.name, x + width / 2, y + height / 2, width - 8);
      }

      setTexture((prev) => {
        if (prev) prev.dispose();
        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [zoneKey, zones, selectedZoneId]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return texture;
}
