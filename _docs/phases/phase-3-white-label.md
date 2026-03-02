# Phase 3: White-Label + CMS

**Duration:** 2–3 weeks  
**Status:** Not started

---

## Overview

Phase 3 enables white-label deployment: DatoCMS for product zones and content, runtime theming via CSS variables, an SDK wrapper component, iframe embed mode with postMessage, and domain onboarding via Vercel Domains API.

---

## Tasks

- [ ] Integrate DatoCMS for product zones
- [ ] Implement runtime theming (CSS variables from tenant `theme_config`)
- [ ] Build SDK wrapper component
- [ ] Implement iframe embed mode with postMessage
- [ ] Set up domain onboarding flow (Vercel Domains API)

---

## Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| Products loaded from CMS | Product config (zones, colors, fonts) fetched from DatoCMS |
| Theme changes at runtime | Tenant `theme_config` drives CSS variables; theme applies without reload |
| SDK embeddable | Configurator can be embedded via `<ConfiguratorSDK />` or iframe |
| Custom domains verified | Domain onboarding flow validates and configures custom domains |

---

## Dependencies

- Phase 2 complete

---

## Documentation Deliverables

| Document | Location | Description |
|----------|----------|-------------|
| cms-integration.md | `_docs/cms-integration.md` | DatoCMS schema, sync, product zones |
| sdk-embedding.md | `_docs/sdk-embedding.md` | SDK usage, iframe postMessage API |
| domain-onboarding.md | `_docs/domain-onboarding.md` | Vercel Domains API flow |
