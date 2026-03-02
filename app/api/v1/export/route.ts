import { NextResponse } from "next/server";
import { ExportRequestSchema } from "@/lib/schemas";
import { getMockProduct } from "@/data/mock-product";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ExportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const product = getMockProduct(parsed.data.product_id);
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    texture_png_url: `https://storage.example.com/exports/${parsed.data.product_id}/texture.png`,
    config_json: parsed.data,
    message:
      "In production, the texture engine runs server-side with node-canvas and uploads to storage",
  });
}
