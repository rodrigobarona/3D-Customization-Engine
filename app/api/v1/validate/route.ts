import { NextResponse } from "next/server";
import { ValidateRequestSchema } from "@/lib/schemas";
import { getMockProduct } from "@/data/mock-product";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ValidateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const product = getMockProduct(parsed.data.product_id);
  if (!product) {
    return NextResponse.json(
      { valid: false, errors: [{ message: "Product not found" }] },
      { status: 404 }
    );
  }

  const errors: Array<{ zone_id: string; message: string }> = [];

  for (const zoneInput of parsed.data.zones) {
    const zoneDef = product.zones.find((z) => z.id === zoneInput.zone_id);
    if (!zoneDef) {
      errors.push({ zone_id: zoneInput.zone_id, message: "Unknown zone" });
      continue;
    }

    if (
      zoneInput.type === "text" &&
      zoneDef.constraints?.max_characters &&
      zoneInput.content &&
      zoneInput.content.length > zoneDef.constraints.max_characters
    ) {
      errors.push({
        zone_id: zoneInput.zone_id,
        message: `Exceeds max ${zoneDef.constraints.max_characters} characters`,
      });
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ valid: false, errors }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}
