# Skills Registry

Complete catalog of all installed agent skills and tools for the 3D Customization Engine.

---

## Tier 1 — Core 3D Engine (7 skills)

| Skill | Source | Purpose |
|-------|--------|---------|
| **threejs-textures** | cloudai-x/threejs-skills | CanvasTexture, UV mapping, environment maps |
| **threejs-loaders** | cloudai-x/threejs-skills | GLB/GLTF loading, Draco, KTX2 |
| **threejs-postprocessing** | cloudai-x/threejs-skills | Tone mapping, HDRI, post-processing effects |
| **r3f-fundamentals** | bbeierle12/skill-mcp-claude | R3F scene setup, Canvas, hierarchy |
| **r3f-materials** | bbeierle12/skill-mcp-claude | Material system, texture application |
| **react-three-fiber** | anthemflynn/ccmp | R3F patterns, Drei, state integration |
| **asset-pipeline-3d** | anthemflynn/ccmp | GLB optimization, compression, LOD |

---

## Tier 2 — Framework / UI / State (4 skills)

| Skill | Source | Purpose |
|-------|--------|---------|
| **shadcn-ui** | jezweb/claude-skills | Component library, forms, data tables |
| **tailwind-theme-builder** | jezweb/claude-skills | TailwindCSS v4, semantic tokens, dark mode |
| **nextjs-performance** | giuseppe-trisciuoglio/developer-kit | Lazy loading, code splitting, Core Web Vitals |
| **zod** | bobmatnyc/claude-mpm-skills | Validation schemas, type inference |
| **zustand** | lobehub/lobehub | State management, slices, actions |

---

## Tier 3 — Storage Connectors (2 skills)

| Skill | Source | Purpose |
|-------|--------|---------|
| **vercel-blob** | ovachiever/droid-tings | Vercel Blob uploads, presigned URLs |
| **cloudflare-r2** | ovachiever/droid-tings | R2 S3-compatible storage, CORS, presigned URLs |

---

## Tier 4 — Multi-Tenant / DB (4 skills)

| Skill | Source | Purpose |
|-------|--------|---------|
| **multi-tenant-platform-architecture** | mblode/agent-skills | Domain strategy, tenant isolation, routing |
| **neon-postgres** | sickn33/antigravity-awesome-skills | Neon serverless Postgres, branching, pooling |
| **drizzle-migrations** | bobmatnyc/claude-mpm-skills | Migration-first workflow, Drizzle |
| **postgres-drizzle** | ccheney/robust-skills | PostgreSQL + Drizzle ORM, schema, queries |

---

## Tier 5 — API / Auth / Billing (7 skills)

| Skill | Source | Purpose |
|-------|--------|---------|
| **api-designer** | 404kidwiz/claude-supercode-skills | REST/GraphQL, OpenAPI, HATEOAS, pagination |
| **workos** | workos/skills | **OFFICIAL** — AuthKit, SSO, RBAC |
| **workos-authkit-nextjs** | workos/skills | **OFFICIAL** — AuthKit + Next.js App Router |
| **stripe-subscriptions** | andrelandgraf/fullstackrecipes | Subscriptions, billing portal, webhooks |
| **payment-gateway-integration** | aj-geddes/useful-ai-prompts | Stripe, PayPal, Square integration |
| **rate-limiting-implementation** | aj-geddes/useful-ai-prompts | Rate limiting, throttling, quotas |

---

## Tier 6 — Quality / Security (5 skills)

| Skill | Source | Purpose |
|-------|--------|---------|
| **playwright-e2e-testing** | bobmatnyc/claude-mpm-skills | E2E testing, cross-browser automation |
| **input-sanitization** | dengineproblem/agents-monorepo | XSS prevention, encoding, validation |
| **secure-headers-csp-builder** | patricio0312rev/skills | CSP, security headers, rollout |
| **frontend-security-coder** | sickn33/antigravity-awesome-skills | XSS prevention, output sanitization |
| **vercel-networking-domains** | bobmatnyc/claude-mpm-skills | Domains, DNS, redirects, CDN |

---

## Context7 Library IDs

Use these IDs with the Context7 plugin for up-to-date documentation:

| Library | Context7 ID |
|---------|-------------|
| React Three Fiber | `/pmndrs/react-three-fiber` |
| Drei | `/pmndrs/drei` |
| Three.js | `/mrdoob/three.js` |
| gltf-transform | `/websites/gltf-transform_dev` |
| Next.js 16 | `/vercel/next.js/v16.1.6` |
| Zustand | `/pmndrs/zustand` |
| Vercel | `/websites/vercel` |
| Cloudflare | `/websites/developers_cloudflare` |
| Drizzle ORM | `/drizzle-team/drizzle-orm-docs` |
| WorkOS | `/websites/workos`, `/llmstxt/workos_llms-full_txt`, `/workos/workos-node` |
| Upstash Ratelimit | `/upstash/ratelimit-js` |
| Upstash Redis | `/upstash/redis-js` |

**EasyPay:** No Context7 — docs at [https://docs.easypay.pt/](https://docs.easypay.pt/)

---

## MCP Servers Connected (11)

| Server | Purpose |
|--------|---------|
| **Vercel** | Deployment, domains, config |
| **Sentry** | Error monitoring, tracing |
| **Stripe** | Payments, billing |
| **Neon Postgres** | Database |
| **shadcn** | UI components |
| **Playwright** | E2E testing |
| **PostHog** | Product analytics |
| **Figma** | Design-to-code |
| **Linear** | Issue tracking |
| **Upstash** | Redis, rate limiting |
| **Context7** | Documentation lookup |

---

## Pre-installed Cursor Skills

| Skill | Purpose |
|-------|---------|
| **Vercel React Best Practices** | React/Next.js performance patterns |
| **Sentry** | Tracing, logging, metrics, AI monitoring, code review |
| **Stripe Best Practices** | Stripe integration patterns |
| **run-smoke-tests** | Playwright smoke tests |
| **check-compiler-errors** | Compile and type-check |
| **deslop** | Remove AI-generated code slop |
| **fix-ci** | Fix failing CI jobs |
| **new-branch-and-pr** | Create branch and open PR |
| **review-and-ship** | Structured review and PR merge |
