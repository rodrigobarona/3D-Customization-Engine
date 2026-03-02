import { z } from "zod";

export const ZoneBoundsSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
});

export type ZoneBounds = z.infer<typeof ZoneBoundsSchema>;

export const PersonalizationZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "image"]),
  uv: ZoneBoundsSchema,
  constraints: z
    .object({
      max_characters: z.number().int().positive().optional(),
      max_width: z.number().positive().optional(),
      max_height: z.number().positive().optional(),
      allowed_formats: z.array(z.string()).optional(),
      font_options: z.array(z.string()).optional(),
      min_value: z.number().optional(),
      max_value: z.number().optional(),
    })
    .optional(),
  defaults: z
    .object({
      font: z.string().optional(),
      fontSize: z.number().optional(),
      fill: z.string().optional(),
    })
    .optional(),
  pricing_modifier: z.number().optional(),
});

export type PersonalizationZone = z.infer<typeof PersonalizationZoneSchema>;

export const ColorOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type ColorOption = z.infer<typeof ColorOptionSchema>;

export const FontOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: z.string(),
  url: z.string().url().optional(),
});

export type FontOption = z.infer<typeof FontOptionSchema>;

export const ProductConfigSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  model_url: z.string(),
  default_texture_url: z.string().optional(),
  uv_layout_url: z.string().optional(),
  zones: z.array(PersonalizationZoneSchema),
  colors: z.array(ColorOptionSchema),
  fonts: z.array(FontOptionSchema),
});

export type ProductConfig = z.infer<typeof ProductConfigSchema>;

export const ZoneInputSchema = z.object({
  zone_id: z.string(),
  type: z.enum(["text", "number", "image"]),
  content: z.string().optional(),
  font_id: z.string().optional(),
  fontSize: z.number().optional(),
  fill: z.string().optional(),
});

export type ZoneInput = z.infer<typeof ZoneInputSchema>;

export const TextureEngineInputSchema = z.object({
  product_id: z.string(),
  base_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  zones: z.array(ZoneInputSchema),
});

export type TextureEngineInput = z.infer<typeof TextureEngineInputSchema>;

export const ExportRequestSchema = TextureEngineInputSchema.extend({
  format: z.enum(["png", "pdf", "both"]).default("png"),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

export const ValidateRequestSchema = TextureEngineInputSchema;

export type ValidateRequest = z.infer<typeof ValidateRequestSchema>;
