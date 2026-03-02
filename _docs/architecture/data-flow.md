# Data Flow

## Request Flow Architecture

This document describes the end-to-end request flow through the 3D Customization Engine, from DNS resolution through the export pipeline.

---

## Request Flow Overview

```mermaid
flowchart TB
    subgraph Flow["Request Flow"]
        A["1. DNS Resolution"] --> B["2. Edge Middleware"]
        B --> C["3. Tenant Lookup"]
        C --> D["4. x-tenant-id Injection"]
        D --> E["5. Next.js Route Handler"]
        E --> F["6. Product Data Fetch"]
        F --> G["7. 3D Scene Render"]
        G --> H["8. Texture Generation"]
        H --> I["9. Export Pipeline"]
    end
```

---

## Sequence Diagram: Page Load & Configurator Init

```mermaid
sequenceDiagram
    participant User
    participant DNS
    participant Edge
    participant Middleware
    participant TenantDB
    participant NextJS
    participant DatoCMS
    participant Client

    User->>DNS: Request brand.engine.com/product/jersey
    DNS->>Edge: Resolve to Vercel Edge
    Edge->>Middleware: Invoke middleware.ts
    Middleware->>Middleware: Extract host from request
    Middleware->>TenantDB: SELECT tenant WHERE domain = host
    TenantDB-->>Middleware: tenant_id, theme_config
    Middleware->>Middleware: Set x-tenant-id header
    Middleware->>NextJS: next() with headers
    NextJS->>NextJS: Route to /product/[slug]
    NextJS->>DatoCMS: Fetch product config (tenant-scoped)
    DatoCMS-->>NextJS: zones, colors, fonts, glb_url
    NextJS->>Client: Render page with product data
    Client->>Client: Lazy load Canvas (Suspense)
    Client->>Client: Load GLB, apply texture
```

---

## Sequence Diagram: Configuration Change & Texture Update

```mermaid
sequenceDiagram
    participant User
    participant Configurator
    participant TextureEngine
    participant Canvas
    participant ThreeJS
    participant Material

    User->>Configurator: Change color / text / image
    Configurator->>Configurator: Update config state
    Configurator->>TextureEngine: generate(config)
    TextureEngine->>TextureEngine: Create 2048x2048 canvas
    TextureEngine->>TextureEngine: Apply base color
    TextureEngine->>TextureEngine: Apply pattern
    TextureEngine->>TextureEngine: Render zones (text/number/image)
    TextureEngine->>Canvas: toDataURL() / toBlob()
    Canvas-->>TextureEngine: Data URL / Blob
    TextureEngine->>ThreeJS: new CanvasTexture(canvas)
    ThreeJS->>Material: material.map = texture
    ThreeJS->>Material: material.needsUpdate = true
    Material-->>User: Re-render with new texture
```

---

## Sequence Diagram: Export Pipeline

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Validator
    participant TextureEngine
    participant Storage
    participant DB

    User->>Client: Click Export
    Client->>API: POST /api/v1/export
    Note over API: x-tenant-id from middleware
    API->>Validator: Zod validate payload
    Validator-->>API: Valid config
    API->>API: Verify product belongs to tenant
    API->>TextureEngine: generateProductionTexture(config)
    TextureEngine-->>API: PNG buffer
    API->>Storage: upload(key, buffer)
    Storage-->>API: blob_url / signed_url
    API->>DB: Store export record (tenant_id, config_hash)
    API-->>Client: { texture_url, config_json }
    Client-->>User: Download / redirect
```

---

## Detailed Flow: Tenant Resolution

```mermaid
flowchart TB
    subgraph Resolution["Tenant Resolution"]
        Host["Host Header"] --> Parse["Parse Domain"]
        Parse --> Subdomain{"Subdomain?"}
        Subdomain -->|brand.engine.com| Slug["Extract slug: brand"]
        Subdomain -->|configurator.brand.com| Custom["Custom domain"]
        Slug --> Lookup["DB: tenants WHERE slug = ?"]
        Custom --> Lookup2["DB: domains WHERE domain = ?"]
        Lookup --> Tenant["tenant_id"]
        Lookup2 --> Tenant
        Tenant --> Inject["Set x-tenant-id"]
        Inject --> Context["Request context"]
    end
```

---

## Detailed Flow: Product Data Fetch

```mermaid
flowchart LR
    subgraph Fetch["Product Data Fetch"]
        Route["Route Handler"] --> Tenant["Read x-tenant-id"]
        Tenant --> Query["SELECT * FROM products<br/>WHERE tenant_id = ? AND slug = ?"]
        Query --> CMS["Optional: DatoCMS sync"]
        CMS --> Response["Return: model_url, zones, colors, fonts"]
    end
```

---

## Detailed Flow: Texture Generation Pipeline

```mermaid
flowchart TB
    subgraph TexGen["Texture Generation"]
        Input["Input JSON"] --> Canvas["Create Canvas 2048x2048"]
        Canvas --> Base["Apply Base Color"]
        Base --> Pattern["Apply Product Pattern"]
        Pattern --> Zones["Render Zones (order matters)"]
        Zones --> Z1["Zone 1: text"]
        Z1 --> Z2["Zone 2: number"]
        Z2 --> Z3["Zone 3: image"]
        Z3 --> Output["Output: Data URL / Blob / Buffer"]
    end
```

---

## Header Propagation

| Stage | Header | Purpose |
|-------|--------|---------|
| Edge Middleware | `x-tenant-id` | Tenant identity for all downstream logic |
| API Routes | `x-tenant-id` | Read from `request.headers.get('x-tenant-id')` |
| Server Components | Via `headers()` | Access tenant for data fetching |
| Client | N/A | Tenant passed via props or React context |

---

## Caching Strategy

| Resource | Cache Location | TTL |
|----------|----------------|-----|
| Tenant config | Edge / Memory | 60s |
| Product config | CDN / React cache | 60s |
| GLB models | CDN | Immutable |
| HDRIs | CDN | Immutable |
| Generated textures | Client memory | Session |
| Export assets | Storage (signed URL) | 24h |

---

## Error Flow

```mermaid
flowchart TB
    subgraph Errors["Error Handling"]
        Err["Error"] --> Type{"Error Type"}
        Type -->|Tenant not found| 404["404 - Tenant not found"]
        Type -->|Product not found| 404P["404 - Product not found"]
        Type -->|Validation| 400["400 - Bad Request"]
        Type -->|Rate limit| 429["429 - Too Many Requests"]
        Type -->|Server| 500["500 - Internal Error"]
        500 --> Sentry["Sentry capture"]
    end
```
