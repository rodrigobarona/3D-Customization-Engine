# Phase 2: Multi-Tenant Foundation

**Duration:** 2–3 weeks  
**Status:** Not started

---

## Overview

Phase 2 introduces multi-tenancy: tenant data model, edge middleware for tenant resolution, tenant-scoped API queries, and a switchable storage adapter (Vercel Blob vs Cloudflare R2). Neon Postgres with Drizzle provides the data layer.

---

## Tasks

- [ ] Design tenant data model (Drizzle schema)
- [ ] Implement edge middleware tenant resolution
- [ ] Add `tenant_id` scoping to all API queries
- [ ] Build Cloudflare R2 storage connector
- [ ] Implement storage adapter interface (switchable via env var)
- [ ] Set up Neon Postgres with Drizzle

---

## Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| Subdomain routing works | `brand.engine.com` resolves to correct tenant |
| Custom domain resolves | `configurator.brand.com` maps to tenant |
| Queries isolated by tenant | All DB/API queries include `tenant_id` filter |
| Storage switchable | `STORAGE_PROVIDER=vercel` or `r2` selects connector |

---

## Dependencies

- Phase 1 complete

---

## Documentation Deliverables

| Document | Location | Description |
|----------|----------|-------------|
| architecture/multi-tenant-model.md | `_docs/architecture/multi-tenant-model.md` | Tenant schema, domain mapping |
| architecture/storage-connector.md | `_docs/architecture/storage-connector.md` | Updated with R2 connector, factory |
| api/openapi.yaml | `_docs/api/openapi.yaml` | Add `x-tenant-id` header requirement |
