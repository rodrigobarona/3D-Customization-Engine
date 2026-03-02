"use client";

export function ConfiguratorSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading 3D viewer...
        </p>
      </div>
    </div>
  );
}
