# Validation Schemas (Zod)

TypeScript Zod schema definitions for API and domain validation.

---

## ProductConfig

Product configuration returned by `GET /api/v1/products/:id`.

```typescript
import { z } from 'zod';

const ZoneBoundsSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

const PersonalizationZoneSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'number', 'image']),
  label: z.string().optional(),
  bounds: ZoneBoundsSchema.optional(),
  max_length: z.number().int().positive().optional(),
  max_value: z.number().optional(),
  min_value: z.number().optional(),
  allowed_formats: z.array(z.string()).optional(),
  max_file_size_bytes: z.number().int().positive().optional(),
});

const ColorOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const FontOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
});

export const ProductConfigSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  model_url: z.string().url(),
  zones: z.array(PersonalizationZoneSchema),
  colors: z.array(ColorOptionSchema).optional(),
  fonts: z.array(FontOptionSchema).optional(),
});

export type ProductConfig = z.infer<typeof ProductConfigSchema>;
export type PersonalizationZone = z.infer<typeof PersonalizationZoneSchema>;
```

---

## PersonalizationZone

Zone definition within a product (reused above).

```typescript
export type PersonalizationZone = z.infer<typeof PersonalizationZoneSchema>;
```

---

## TextureEngineInput

Input for texture generation (preview and export).

```typescript
const ZoneInputSchema = z.object({
  zone_id: z.string(),
  type: z.enum(['text', 'number', 'image']),
  value: z.union([z.string(), z.number()]).optional(),
  font_id: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const TextureEngineInputSchema = z.object({
  product_id: z.string(),
  base_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  zones: z.array(ZoneInputSchema),
});

export type TextureEngineInput = z.infer<typeof TextureEngineInputSchema>;
export type ZoneInput = z.infer<typeof ZoneInputSchema>;
```

---

## ExportRequest

Export endpoint request body.

```typescript
export const ExportRequestSchema = TextureEngineInputSchema.extend({
  format: z.enum(['png', 'pdf', 'both']).default('both'),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;
```

---

## TenantConfig

Tenant configuration from database.

```typescript
export const TenantConfigSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  theme_config: z.record(z.unknown()).optional(),
  payment_provider: z.enum(['stripe', 'easypay']).optional(),
  storage_provider: z.enum(['vercel', 'r2']).optional(),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;
```

---

## ThemeConfig

Runtime theming (CSS variables).

```typescript
export const ThemeConfigSchema = z.object({
  '--primary': z.string().optional(),
  '--primary-foreground': z.string().optional(),
  '--secondary': z.string().optional(),
  '--accent': z.string().optional(),
  '--background': z.string().optional(),
  '--foreground': z.string().optional(),
  '--border': z.string().optional(),
  '--radius': z.string().optional(),
}).passthrough();

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
```

---

## PaymentRequest

Generic payment request for connector interface.

```typescript
export const PaymentRequestSchema = z.object({
  tenant_id: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  metadata: z.record(z.string()).optional(),
  customer_id: z.string().optional(),
  return_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
```

---

## Usage in Route Handlers

```typescript
import { ExportRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ExportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { product_id, base_color, zones, format } = parsed.data;
  // ...
}
```

---

## Schema Index

| Schema                | Use Case                          |
|-----------------------|-----------------------------------|
| ProductConfigSchema   | Product API response              |
| PersonalizationZoneSchema | Zone definition in product   |
| TextureEngineInputSchema | Preview/export input          |
| ExportRequestSchema   | Export API request                |
| TenantConfigSchema    | Tenant DB model                   |
| ThemeConfigSchema     | Runtime theming                   |
| PaymentRequestSchema  | Payment connector input           |
