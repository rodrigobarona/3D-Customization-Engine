"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ConfiguratorSkeleton } from "./configurator-skeleton";
import { ConfiguratorErrorBoundary } from "./configurator-error";

const ConfiguratorCanvas = dynamic(
  () => import("./configurator-canvas"),
  {
    ssr: false,
    loading: () => <ConfiguratorSkeleton />,
  }
);

export function ConfiguratorViewport() {
  return (
    <ConfiguratorErrorBoundary>
      <Suspense fallback={<ConfiguratorSkeleton />}>
        <ConfiguratorCanvas />
      </Suspense>
    </ConfiguratorErrorBoundary>
  );
}
