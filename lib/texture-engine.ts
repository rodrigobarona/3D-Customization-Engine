import type { PersonalizationZone, ProductConfig } from "@/lib/schemas";
import type { ZoneValue } from "@/store/slices/config-slice";

const TEXTURE_SIZE = 2048;

export interface TextureEngineConfig {
  product: ProductConfig;
  baseColor: string;
  zoneValues: Record<string, ZoneValue>;
}

export interface TextureOutput {
  canvas: HTMLCanvasElement;
  dataUrl: string;
}

export async function generateTexture(
  config: TextureEngineConfig
): Promise<TextureOutput> {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = config.baseColor;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  for (const zoneDef of config.product.zones) {
    const zoneValue = config.zoneValues[zoneDef.id];
    if (!zoneValue || !zoneValue.content) continue;

    ctx.save();

    switch (zoneDef.type) {
      case "text":
      case "number":
        renderTextZone(ctx, zoneDef, zoneValue, config.product);
        break;
      case "image":
        await renderImageZone(ctx, zoneDef, zoneValue);
        break;
    }

    ctx.restore();
  }

  return {
    canvas,
    dataUrl: canvas.toDataURL("image/png"),
  };
}

export function generateTextureSync(config: TextureEngineConfig): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = config.baseColor;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  for (const zoneDef of config.product.zones) {
    const zoneValue = config.zoneValues[zoneDef.id];
    if (!zoneValue || !zoneValue.content) continue;

    ctx.save();

    switch (zoneDef.type) {
      case "text":
      case "number":
        renderTextZone(ctx, zoneDef, zoneValue, config.product);
        break;
      case "image":
        if (zoneValue.imageDataUrl) {
          renderCachedImage(ctx, zoneDef, zoneValue.imageDataUrl);
        }
        break;
    }

    ctx.restore();
  }

  return canvas;
}

function renderTextZone(
  ctx: CanvasRenderingContext2D,
  zoneDef: PersonalizationZone,
  zoneValue: ZoneValue,
  product: ProductConfig
) {
  const { x, y, width, height } = zoneDef.uv;
  const content = zoneValue.content;

  const fontId = zoneValue.font_id ?? zoneDef.defaults?.font;
  const fontDef = product.fonts.find(
    (f) => f.id === fontId || f.family === fontId
  );
  const fontFamily = fontDef?.family ?? "Inter";

  const fontSize = zoneValue.fontSize ?? zoneDef.defaults?.fontSize ?? 64;
  const fill = zoneValue.fill ?? zoneDef.defaults?.fill ?? "#FFFFFF";

  ctx.fillStyle = fill;
  ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const measured = ctx.measureText(content);
  const textWidth = measured.width;

  if (textWidth > width) {
    const scaleFactor = width / textWidth;
    const scaledSize = Math.floor(fontSize * scaleFactor * 0.95);
    ctx.font = `bold ${scaledSize}px "${fontFamily}", sans-serif`;
  }

  ctx.fillText(content, centerX, centerY, width);
}

async function renderImageZone(
  ctx: CanvasRenderingContext2D,
  zoneDef: PersonalizationZone,
  zoneValue: ZoneValue
): Promise<void> {
  const src = zoneValue.imageDataUrl ?? zoneValue.content;
  if (!src) return;

  const img = await loadImage(src);
  const { x, y, width, height } = zoneDef.uv;

  const scale = Math.min(width / img.width, height / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const drawX = x + (width - drawW) / 2;
  const drawY = y + (height - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function renderCachedImage(
  ctx: CanvasRenderingContext2D,
  zoneDef: PersonalizationZone,
  dataUrl: string
) {
  const img = new Image();
  img.src = dataUrl;

  if (img.complete && img.naturalWidth > 0) {
    const { x, y, width, height } = zoneDef.uv;
    const scale = Math.min(width / img.width, height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = x + (width - drawW) / 2;
    const drawY = y + (height - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached?.complete) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}
