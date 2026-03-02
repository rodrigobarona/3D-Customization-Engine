Excellent. Now we’re designing this as a **true SaaS 3D Customization Platform** — multi-tenant, white-label, DNS-based tenant isolation, and built entirely on Vercel infrastructure.

Below is a **deep technical architecture brief**, structured for engineering execution and suitable for JIRA / Confluence.

---

# 🏗 EPIC: Multi-Tenant 3D Configurator SaaS

**Infrastructure: Vercel + Edge + Headless CMS + Storage**

---

# 1️⃣ Product Vision

Build a **multi-tenant, white-label 3D product customization SaaS** where:

- Each tenant has:
  - Custom domain (e.g., `custom.brand.com`)
  - Custom theme
  - Custom products
  - Custom pricing rules

- The engine is:
  - Commerce-agnostic
  - Headless
  - API-first
  - DNS-aware

- Tenants are logically isolated
- Can scale to 1000+ tenants

---

# 2️⃣ High-Level Multi-Tenant Model

We will use:

> **Single deployment / Shared infrastructure / Logical tenant isolation**

Not separate deployments per tenant.

---

# 3️⃣ Tenant Resolution Strategy

We support:

### 1️⃣ Subdomain mode

```
brandA.engine.com
brandB.engine.com
```

### 2️⃣ Custom domain mode

```
custom.brandA.com
configurator.brandB.com
```

---

# 4️⃣ DNS + Vercel Domain Strategy

## Onboarding Flow

1. Tenant registers in platform
2. We:
   - Create tenant record in DB

3. Tenant chooses:
   - Subdomain
   - OR custom domain

---

## If Subdomain

Use:

```
*.engine.com
```

Configured in Vercel project settings.

---

## If Custom Domain

Use Vercel Domains API:

```
POST /v9/projects/{id}/domains
```

Tenant must:

- Add CNAME:

  ```
  configurator.brand.com → cname.vercel-dns.com
  ```

We verify DNS via API.

---

# 5️⃣ Tenant Data Model

PostgreSQL (Neon or Supabase recommended)

## Tenant Table

```sql
id (uuid)
name
slug
primary_domain
theme_config (jsonb)
plan
status
created_at
```

---

## Domain Table

```sql
id
tenant_id
domain
verified
ssl_status
```

---

## Product Table

```sql
id
tenant_id
name
glb_url
zones (jsonb)
colors (jsonb)
fonts (jsonb)
```

Tenant owns products.

---

# 6️⃣ Request Resolution Flow

Every request:

```
middleware.ts
```

Flow:

1. Read host header
2. Lookup domain → tenant
3. Inject:

   ```
   x-tenant-id
   ```

4. Attach tenant config to request context

Example:

```ts
export async function middleware(req) {
  const host = req.headers.get("host");
  const tenant = await resolveTenant(host);

  req.headers.set("x-tenant-id", tenant.id);

  return NextResponse.next();
}
```

---

# 7️⃣ Runtime Architecture

```id="xk9a3t"
User → DNS → Vercel Edge
                 ↓
            Middleware
                 ↓
         Tenant Resolution
                 ↓
         Dynamic Product Load
                 ↓
         3D Configurator
                 ↓
         Export API (Serverless)
                 ↓
         Storage (R2/S3)
```

---

# 8️⃣ Storage Architecture

## Assets

Store separately:

### Public CDN Assets

- GLB models
- HDRIs
- Fonts

→ Vercel Blob or Cloudflare R2

---

### Private Production Assets

- Exported textures
- PDFs
- Print files

→ Private bucket with signed URLs

---

# 9️⃣ Multi-Tenant Security Model

Isolation rules:

- All DB queries must include tenant_id
- Row-Level Security (if using Supabase)
- Signed URLs for exports
- No cross-tenant object access

---

# 🔟 API Architecture (Tenant-Aware)

All APIs must be tenant-aware.

Example:

```
GET /api/v1/products
```

Internally becomes:

```sql
SELECT * FROM products WHERE tenant_id = ?
```

---

## Export API

```
POST /api/v1/export
```

Payload:

```json
{
  "product_id": "",
  "config": {},
  "tenant_id": ""
}
```

Validation:

- Ensure product belongs to tenant
- Validate zones

---

# 11️⃣ White-Label Theming Layer

Theme JSON:

```json
{
  "primary_color": "#000",
  "secondary_color": "#fff",
  "font_family": "Inter",
  "border_radius": "8px",
  "logo_url": ""
}
```

Loaded at runtime.

Use CSS variables:

```css
:root {
  --primary: #000;
}
```

---

# 12️⃣ 3D Engine Isolation Strategy

Important:

3D engine must be fully product-driven.

No hardcoded UV logic.

Instead:

Zones stored like:

```json
{
  "zone_id": "back_number",
  "uv": {
    "x": 1200,
    "y": 400,
    "width": 600,
    "height": 900
  }
}
```

Texture engine reads zones dynamically.

---

# 13️⃣ Tenant SDK Strategy

Expose:

## Option A — Embed

```
<iframe src="https://brand.engine.com/product/jersey" />
```

Communication via postMessage.

---

## Option B — JS SDK

```js
import { Configurator } from "@engine/sdk";

<Configurator tenant="brandA" product="jersey" onExport={(data) => {}} />;
```

SDK fetches from engine API.

---

# 14️⃣ Infrastructure Scaling on Vercel

Use:

- Edge Middleware for tenant detection
- Serverless Functions for export
- Edge Functions for preview generation (future)
- Incremental Static Regeneration for product configs

---

# 15️⃣ Performance Strategy

Per Tenant:

- CDN caching of GLB
- CDN caching of HDRI
- Cache product config (60s)
- Debounce texture regeneration

---

# 16️⃣ Deployment Strategy

Single Vercel project.

Environment variables:

```
DATABASE_URL
BLOB_TOKEN
R2_ACCESS_KEY
R2_SECRET
```

Preview deployments safe because:

- Domain resolution works via middleware
- Production domains mapped dynamically

---

# 17️⃣ Multi-Tenant Billing Architecture

Add:

```
Tenant.plan
Tenant.usage_counter
```

Track:

- Exports per month
- Storage used
- API calls

Enforce limits via middleware.

---

# 18️⃣ Advanced Future Scaling

If scaling to enterprise:

Move to:

- Separate DB schemas per tenant
- Or separate Postgres DB per enterprise
- Edge Config caching
- Dedicated region deployments

---

# 19️⃣ Security Hardening

- CSP headers
- Limit iframe embedding
- Sanitize SVG uploads
- Virus scan large images
- Rate limiting per tenant

---

# 20️⃣ Observability

Use:

- Vercel Analytics
- Sentry
- Custom metrics:

```
tenant_id
export_time
texture_gen_time
memory_usage
```

---

# 21️⃣ Development Phases

## Phase 1

- Core multi-tenant resolution
- Single product
- Export working

## Phase 2

- White-label theming
- SDK
- Domain onboarding

## Phase 3

- Billing
- Usage tracking
- Tenant admin panel

---

# 22️⃣ Definition of Done

✔ Tenant resolved via domain
✔ Custom domain works
✔ Product data isolated
✔ Export isolated
✔ No cross-tenant leaks
✔ SDK embeddable
✔ Production asset generated
✔ Performance acceptable on mobile

---

# 23️⃣ Strategic Outcome

If done correctly:

You are not building a 3D store.

You are building:

> A Multi-Tenant 3D Personalization Infrastructure Layer

Which can power:

- Sports clubs
- POD providers
- Agencies
- Marketplaces
- Enterprise brands

---

If you want next, I can produce:

- 🧠 Database schema with full SQL
- 📘 OpenAPI 3.0 specification draft
- 🏢 SaaS pricing architecture
- 🔐 Security threat model
- ⚙️ DevOps CI/CD plan for Vercel

Tell me where you want to go deeper.
