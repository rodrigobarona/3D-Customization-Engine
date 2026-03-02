# Setup & Onboarding Guide

Complete setup and onboarding guide for the 3D Customization Engine.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **Bun** (package manager & runtime)
- **Git**

### Installing Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Clone & Install

```bash
git clone <repository-url>
cd 3D-Customization-Engine
bun install
```

---

## Environment Variables

Create a `.env.local` file in the project root (or copy from `.env.example`). All required variables:

### `.env.example`

```bash
# =============================================================================
# Database (Neon Postgres)
# =============================================================================
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# =============================================================================
# Storage Provider (vercel | r2)
# =============================================================================
STORAGE_PROVIDER="vercel"

# --- Vercel Blob (when STORAGE_PROVIDER=vercel) ---
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxx"
# BLOB_BASE_PATH=""  # Optional prefix

# --- Cloudflare R2 (when STORAGE_PROVIDER=r2) ---
# R2_ACCESS_KEY_ID=""
# R2_SECRET_ACCESS_KEY=""
# R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
# R2_BUCKET_NAME=""
# R2_ACCOUNT_ID=""   # Alternative: used to construct endpoint if R2_ENDPOINT not set
# R2_PUBLIC_URL=""   # Optional: custom domain for public bucket
# R2_BASE_PATH=""    # Optional prefix

# =============================================================================
# WorkOS Auth (AuthKit / SSO)
# =============================================================================
WORKOS_API_KEY="sk_xxxxxxxxxxxx"
WORKOS_CLIENT_ID="client_xxxxxxxxxxxx"
WORKOS_COOKIE_PASSWORD="32-or-more-characters-secret-for-encryption"
NEXT_PUBLIC_WORKOS_REDIRECT_URI="http://localhost:3000/callback"

# =============================================================================
# Stripe (Payments / Subscriptions)
# =============================================================================
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"

# =============================================================================
# EasyPay (Portugal payments: Multibanco, MB WAY)
# =============================================================================
EASYPAY_ACCOUNT_ID=""
EASYPAY_API_KEY=""
EASYPAY_ENVIRONMENT="test"  # test | production

# =============================================================================
# Upstash Redis (Rate limiting, caching)
# =============================================================================
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN=""

# =============================================================================
# Sentry (Error monitoring)
# =============================================================================
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# =============================================================================
# PostHog (Product analytics)
# =============================================================================
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# =============================================================================
# DatoCMS (Headless CMS)
# =============================================================================
DATOCMS_API_TOKEN=""
DATOCMS_ENVIRONMENT="main"
```

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `STORAGE_PROVIDER` | Yes | `vercel` (Vercel Blob) or `r2` (Cloudflare R2) |
| `BLOB_READ_WRITE_TOKEN` | If Vercel Blob | Vercel Blob token |
| `R2_ACCESS_KEY_ID` | If R2 | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | If R2 | Cloudflare R2 secret key |
| `R2_ENDPOINT` | If R2 | R2 S3 endpoint (e.g. `https://<account_id>.r2.cloudflarestorage.com`) |
| `R2_BUCKET_NAME` | If R2 | R2 bucket name |
| `WORKOS_API_KEY` | Yes | WorkOS API key (starts with `sk_`) |
| `WORKOS_CLIENT_ID` | Yes | WorkOS client ID (starts with `client_`) |
| `WORKOS_COOKIE_PASSWORD` | Yes | 32+ character secret for cookie encryption |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Yes | OAuth redirect URI |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `EASYPAY_ACCOUNT_ID` | If EasyPay | EasyPay account ID |
| `EASYPAY_API_KEY` | If EasyPay | EasyPay API key |
| `EASYPAY_ENVIRONMENT` | If EasyPay | `test` or `production` |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token |
| `SENTRY_DSN` | No | Sentry server DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry client DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host URL |
| `DATOCMS_API_TOKEN` | If DatoCMS | DatoCMS API token |
| `DATOCMS_ENVIRONMENT` | If DatoCMS | DatoCMS environment (e.g. `main`) |

---

## Local Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Setup

### Push schema (development)

```bash
bunx drizzle-kit push
```

### Generate migrations

```bash
bunx drizzle-kit generate
```

### Run migrations

```bash
bunx drizzle-kit migrate
```

---

## Deployment Checklist (Vercel)

### 1. Environment variables

- Add all required env vars in Vercel → Project → Settings → Environment Variables
- Set different values for Production, Preview, and Development if needed
- Ensure `NEXT_PUBLIC_*` vars are available at build time

### 2. Domain configuration

- Add production domain(s) in Vercel → Project → Settings → Domains
- Configure DNS (CNAME records if using Vercel subdomain)
- For multi-tenant: map each tenant domain to the same project

### 3. Blob storage

- **Vercel Blob**: Create store in Vercel dashboard, add `BLOB_READ_WRITE_TOKEN`
- **Cloudflare R2**: Create bucket, API token, and add R2 env vars

### 4. Webhooks

- **Stripe**: Configure webhook endpoint (e.g. `https://your-domain.com/api/webhooks/stripe`) and set `STRIPE_WEBHOOK_SECRET`
- **WorkOS**: Add redirect URIs in WorkOS dashboard

### 5. Database

- Use Neon connection string with connection pooling for serverless
- Ensure `DATABASE_URL` is set for Production and Preview

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bunx drizzle-kit push` | Push schema to DB (dev) |
| `bunx drizzle-kit generate` | Generate migration files |
| `bunx drizzle-kit migrate` | Run migrations |
| `bunx drizzle-kit studio` | Open Drizzle Studio (if configured) |
