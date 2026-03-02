# API Endpoint Reference

REST API v1 for the 3D Customization Engine. All endpoints require the `x-tenant-id` header.

**Base URL:** `https://api.example.com` (production) / `http://localhost:3000` (local)

---

## Authentication

All requests must include the tenant identifier:

```http
x-tenant-id: <tenant-uuid-or-slug>
```

The header is typically injected by edge middleware from subdomain or custom domain resolution.

---

## Endpoints

### GET /api/v1/products/:id

Returns product configuration including model URL, zones, colors, and fonts.

**Parameters**

| Name | In   | Type   | Required | Description      |
|------|------|--------|----------|------------------|
| id   | path | string | Yes      | Product ID/slug  |

**Response 200**

```json
{
  "id": "prod_abc123",
  "slug": "jersey",
  "model_url": "https://cdn.example.com/products/jersey/model.glb",
  "zones": [
    {
      "id": "zone_back_number",
      "type": "number",
      "label": "Back Number",
      "bounds": { "x": 0.2, "y": 0.3, "width": 0.15, "height": 0.08 },
      "max_value": 99,
      "min_value": 1
    },
    {
      "id": "zone_name",
      "type": "text",
      "label": "Name",
      "bounds": { "x": 0.1, "y": 0.5, "width": 0.3, "height": 0.06 },
      "max_length": 12
    }
  ],
  "colors": [
    { "id": "red", "name": "Red", "hex": "#E63946" },
    { "id": "blue", "name": "Blue", "hex": "#1D3557" }
  ],
  "fonts": [
    { "id": "sans", "name": "Sans", "url": "https://fonts.example.com/sans.woff2" }
  ]
}
```

**cURL example**

```bash
curl -X GET "https://api.example.com/api/v1/products/jersey" \
  -H "x-tenant-id: tenant-abc-123"
```

**Error codes**

| Code | Description           |
|------|-----------------------|
| 400  | Bad request           |
| 404  | Product not found     |

---

### POST /api/v1/generate-preview

Generates a preview texture from zone configuration. Returns texture URL and config hash.

**Request body**

```json
{
  "product_id": "prod_abc123",
  "base_color": "#1D3557",
  "zones": [
    {
      "zone_id": "zone_back_number",
      "type": "number",
      "value": 7
    },
    {
      "zone_id": "zone_name",
      "type": "text",
      "value": "RODRIGO",
      "font_id": "sans",
      "color": "#FFFFFF"
    }
  ]
}
```

**Response 200**

```json
{
  "texture_url": "https://blob.example.com/previews/abc123.png",
  "config_hash": "a1b2c3d4e5f6"
}
```

**cURL example**

```bash
curl -X POST "https://api.example.com/api/v1/generate-preview" \
  -H "x-tenant-id: tenant-abc-123" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_abc123",
    "base_color": "#1D3557",
    "zones": [
      { "zone_id": "zone_back_number", "type": "number", "value": 7 },
      { "zone_id": "zone_name", "type": "text", "value": "RODRIGO", "font_id": "sans", "color": "#FFFFFF" }
    ]
  }'
```

**Error codes**

| Code | Description           |
|------|-----------------------|
| 400  | Bad request           |
| 422  | Validation error      |

---

### POST /api/v1/export

Exports deterministic PNG texture, optional vector PDF, and config JSON.

**Request body**

```json
{
  "product_id": "prod_abc123",
  "base_color": "#1D3557",
  "zones": [
    {
      "zone_id": "zone_back_number",
      "type": "number",
      "value": 7
    },
    {
      "zone_id": "zone_name",
      "type": "text",
      "value": "RODRIGO",
      "font_id": "sans",
      "color": "#FFFFFF"
    }
  ],
  "format": "both"
}
```

| Field   | Type   | Required | Description                          |
|---------|--------|----------|--------------------------------------|
| format  | string | No       | `png`, `pdf`, or `both` (default)    |

**Response 200**

```json
{
  "texture_png_url": "https://blob.example.com/exports/tenant-123/a1b2c3.png",
  "vector_pdf_url": "https://blob.example.com/exports/tenant-123/a1b2c3.pdf",
  "config_json": {
    "product_id": "prod_abc123",
    "base_color": "#1D3557",
    "zones": [...]
  },
  "config_hash": "a1b2c3d4e5f6"
}
```

**cURL example**

```bash
curl -X POST "https://api.example.com/api/v1/export" \
  -H "x-tenant-id: tenant-abc-123" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_abc123",
    "base_color": "#1D3557",
    "zones": [
      { "zone_id": "zone_back_number", "type": "number", "value": 7 },
      { "zone_id": "zone_name", "type": "text", "value": "RODRIGO", "font_id": "sans", "color": "#FFFFFF" }
    ],
    "format": "both"
  }'
```

**Error codes**

| Code | Description           |
|------|-----------------------|
| 400  | Bad request           |
| 422  | Validation error      |

---

### POST /api/v1/validate

Validates zone limits, character limits, file size, and formats without generating output.

**Request body**

```json
{
  "product_id": "prod_abc123",
  "zones": [
    {
      "zone_id": "zone_back_number",
      "type": "number",
      "value": 7
    },
    {
      "zone_id": "zone_name",
      "type": "text",
      "value": "RODRIGO"
    }
  ]
}
```

**Response 200 (valid)**

```json
{
  "valid": true
}
```

**Response 200 (invalid)**

```json
{
  "valid": false,
  "errors": [
    {
      "path": "zones.1.value",
      "message": "Text exceeds max length of 12",
      "code": "TOO_LONG"
    }
  ]
}
```

**cURL example**

```bash
curl -X POST "https://api.example.com/api/v1/validate" \
  -H "x-tenant-id: tenant-abc-123" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_abc123",
    "zones": [
      { "zone_id": "zone_back_number", "type": "number", "value": 7 },
      { "zone_id": "zone_name", "type": "text", "value": "RODRIGO" }
    ]
  }'
```

**Error codes**

| Code | Description           |
|------|-----------------------|
| 400  | Bad request           |

---

## Common Error Response

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": []
}
```

| HTTP | Code        | Description                    |
|------|-------------|--------------------------------|
| 400  | BAD_REQUEST | Invalid request format        |
| 404  | NOT_FOUND   | Resource not found            |
| 422  | VALIDATION  | Validation failed             |
| 429  | RATE_LIMIT  | Too many requests             |
| 500  | INTERNAL    | Server error                   |
