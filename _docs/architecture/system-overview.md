# System Overview

## 3D Customization Engine — Multi-Tenant SaaS Architecture

A production-grade, multi-tenant 3D product customization platform (similar to Nike.com customizer) built with Next.js 16, React 19, Three.js, React Three Fiber, TailwindCSS, and shadcn/ui. The system is designed for white-label deployment, commerce-agnostic operation, and scale to 1000+ tenants.

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser"]
    end

    subgraph TRL["Tenant Resolution Layer"]
        DNS["DNS Resolution"]
        Edge["Edge Middleware"]
        TenantDB[(Tenant DB)]
        DNS --> Edge
        Edge --> TenantDB
    end

    subgraph App["Application Layer"]
        NextJS["Next.js 16 Client"]
        SDK["Configurator SDK"]
        TexEngine["Texture Engine"]
        Renderer["3D Renderer (R3F)"]
        NextJS --> SDK
        SDK --> TexEngine
        TexEngine --> Renderer
    end

    subgraph API["API Layer"]
        REST["REST API v1"]
        Zod["Zod Validation"]
        RateLimit["Upstash Rate Limiter"]
        REST --> Zod
        REST --> RateLimit
    end

    subgraph Storage["Storage Connector Layer"]
        Adapter["Storage Adapter"]
        VercelBlob["Vercel Blob (MVP)"]
        R2["Cloudflare R2 (Prod)"]
        Adapter --> VercelBlob
        Adapter --> R2
    end

    subgraph Payment["Payment Connector Layer"]
        PayAdapter["Payment Adapter"]
        Stripe["Stripe (International)"]
        EasyPay["EasyPay (Portugal)"]
        PayAdapter --> Stripe
        PayAdapter --> EasyPay
    end

    subgraph Data["Data Layer"]
        Drizzle["Drizzle ORM"]
        Neon[(Neon PostgreSQL)]
        Drizzle --> Neon
    end

    subgraph Ext["External Services"]
        DatoCMS["DatoCMS"]
        WorkOS["WorkOS AuthKit"]
        Sentry["Sentry"]
        PostHog["PostHog"]
    end

    Browser --> TRL
    TRL --> App
    App --> API
    API --> Storage
    API --> Payment
    API --> Data
    App --> DatoCMS
    App --> WorkOS
    App --> Sentry
    App --> PostHog
```

---

## Tenant Resolution Layer

Resolves tenant identity from incoming requests before any application logic executes.

```mermaid
flowchart LR
    subgraph Resolution["Tenant Resolution Flow"]
        A["DNS"] --> B["Edge Middleware"]
        B --> C["Tenant DB Lookup"]
        C --> D["x-tenant-id Header"]
        D --> E["Request Context"]
    end
```

| Component | Responsibility |
|-----------|----------------|
| **DNS** | Resolves subdomain (`brand.engine.com`) or custom domain (`configurator.brand.com`) to Vercel Edge |
| **Edge Middleware** | Reads `Host` header, queries Tenant DB by domain, injects `x-tenant-id` |
| **Tenant DB** | Stores `tenants`, `domains`; lookup by `domain` or `slug` (subdomain) |

---

## Application Layer

```mermaid
flowchart TB
    subgraph App["Application Layer"]
        direction TB
        NextJS["Next.js 16 Client"]
        SDK["Configurator SDK (React wrapper)"]
        TexEngine["Texture Engine (Canvas)"]
        Renderer["3D Renderer (R3F + Three.js)"]
        NextJS --> SDK
        SDK --> TexEngine
        TexEngine --> Renderer
    end
```

| Component | Technology | Responsibility |
|-----------|-------------|----------------|
| **Next.js Client** | Next.js 16, React 19 | App Router, SSR, routing, layout |
| **Configurator SDK** | React components | Product config UI, zone controls, theme application |
| **Texture Engine** | Canvas 2D API | Deterministic texture generation from zones |
| **3D Renderer** | R3F, Three.js, Drei | GLB loading, material binding, scene rendering |

---

## API Layer

```mermaid
flowchart LR
    subgraph API["API Layer"]
        Request["Request"] --> Zod["Zod Validation"]
        Zod --> Handler["Route Handler"]
        Handler --> RateLimit["Upstash Rate Limit"]
        RateLimit --> Response["Response"]
    end
```

| Component | Purpose |
|-----------|---------|
| **REST API v1** | Versioned endpoints under `/api/v1/` |
| **Zod Validation** | Request/response schema validation, type inference |
| **Upstash Rate Limiter** | Per-tenant rate limits, abuse prevention |

---

## Storage Connector Layer

Adapter pattern for object storage. Provider selected via `STORAGE_PROVIDER` env var.

```mermaid
flowchart TB
    subgraph Storage["Storage Connector"]
        Interface["StorageConnector Interface"]
        VercelBlob["VercelBlobConnector"]
        R2Connector["CloudflareR2Connector"]
        Interface -.->|implements| VercelBlob
        Interface -.->|implements| R2Connector
    end
```

| Implementation | Use Case | Provider |
|----------------|----------|----------|
| **VercelBlobConnector** | MVP, development | `@vercel/blob` |
| **CloudflareR2Connector** | Production, scale | `@aws-sdk/client-s3` + R2 |

---

## Payment Connector Layer

Adapter pattern for payment processing. Provider selected per tenant via `payment_provider` field.

```mermaid
flowchart TB
    subgraph Payment["Payment Connector"]
        PayInterface["PaymentConnector Interface"]
        StripeConn["StripeConnector"]
        EasyPayConn["EasyPayConnector"]
        PayInterface -.->|implements| StripeConn
        PayInterface -.->|implements| EasyPayConn
    end
```

| Implementation | Region | Methods |
|----------------|--------|---------|
| **StripeConnector** | International | PaymentIntents, Subscriptions, webhooks |
| **EasyPayConnector** | Portugal | Multibanco, MB WAY, Virtual IBAN |

---

## Data Layer

```mermaid
flowchart LR
    subgraph Data["Data Layer"]
        App["Application"] --> Drizzle["Drizzle ORM"]
        Drizzle --> Neon[(Neon PostgreSQL)]
    end
```

| Component | Purpose |
|-----------|---------|
| **Drizzle ORM** | Type-safe queries, migrations, schema management |
| **Neon PostgreSQL** | Serverless Postgres, branching, connection pooling |

---

## External Services

```mermaid
flowchart TB
    subgraph Ext["External Services"]
        DatoCMS["DatoCMS - Headless CMS"]
        WorkOS["WorkOS AuthKit - Auth/SSO"]
        Sentry["Sentry - Error Monitoring"]
        PostHog["PostHog - Product Analytics"]
    end
```

| Service | Purpose |
|---------|---------|
| **DatoCMS** | Product config, zones, colors, fonts; content management |
| **WorkOS AuthKit** | Authentication, SSO, RBAC |
| **Sentry** | Error tracking, performance monitoring |
| **PostHog** | Product analytics, feature flags, session replay |

---

## Deployment Topology

```mermaid
flowchart TB
    subgraph Vercel["Vercel Platform"]
        Edge["Edge Network"]
        Serverless["Serverless Functions"]
        Static["Static Assets"]
    end

    subgraph External["External"]
        Neon[(Neon)]
        Cloudflare["Cloudflare R2"]
        Upstash["Upstash Redis"]
    end

    User["User"] --> Edge
    Edge --> Serverless
    Edge --> Static
    Serverless --> Neon
    Serverless --> Cloudflare
    Serverless --> Upstash
```

---

## Technology Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS, shadcn/ui |
| **3D** | Three.js, @react-three/fiber, @react-three/drei |
| **Backend** | Next.js Route Handlers, Drizzle ORM |
| **Database** | Neon PostgreSQL |
| **Storage** | Vercel Blob (MVP) / Cloudflare R2 (Prod) |
| **Payments** | Stripe / EasyPay |
| **Auth** | WorkOS AuthKit |
| **CMS** | DatoCMS |
| **Observability** | Sentry, PostHog |
