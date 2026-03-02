import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          3D Customization Engine
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Design custom apparel with our real-time 3D configurator.
          Change colors, add text, numbers, and logos.
        </p>
      </div>
      <Link
        href="/configurator"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open Configurator
      </Link>
    </div>
  );
}
