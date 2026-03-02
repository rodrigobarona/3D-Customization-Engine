import { Toaster } from "sonner";

export const metadata = {
  title: "Zone Studio | 3D Customization Engine",
  description:
    "Visual editor for creating and managing personalization zones on 3D product textures.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors />
    </>
  );
}
