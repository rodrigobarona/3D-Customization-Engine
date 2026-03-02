import { NextResponse } from "next/server";
import { TextureEngineInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = TextureEngineInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const configHash = hashConfig(parsed.data);

  return NextResponse.json({
    texture_url: `/api/v1/textures/${configHash}.png`,
    config_hash: configHash,
    message: "Preview generation would run server-side in production",
  });
}

function hashConfig(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}
