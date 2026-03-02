# Phase 4: Enterprise / SaaS

**Duration:** 2–3 weeks  
**Status:** Not started

---

## Overview

Phase 4 adds enterprise capabilities: WorkOS AuthKit (SSO, proxy), Payment Connector interface with Stripe and EasyPay implementations, per-tenant rate limiting (Upstash), tenant admin panel, and CSP headers.

---

## Tasks

- [ ] Integrate WorkOS AuthKit (proxy.ts, AuthKitProvider, SSO)
- [ ] Build Payment Connector interface
- [ ] Implement Stripe connector
- [ ] Implement EasyPay connector (REST wrapper)
- [ ] Set up per-tenant rate limiting (Upstash)
- [ ] Build tenant admin panel
- [ ] Implement CSP headers

---

## Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| SSO login works | WorkOS AuthKit authenticates users; SSO for enterprise tenants |
| Stripe billing works | Payment intents, subscriptions, webhooks functional |
| EasyPay Multibanco/MB WAY works | Portugal payment methods via EasyPay REST API |
| Rate limits enforced per tenant | Upstash rate limiter scoped by `tenant_id` |

---

## Dependencies

- Phase 3 complete

---

## Documentation Deliverables

| Document | Location | Description |
|----------|----------|-------------|
| auth-workos.md | `_docs/auth-workos.md` | AuthKit setup, proxy, SSO config |
| architecture/payment-connector.md | `_docs/architecture/payment-connector.md` | Payment adapter, Stripe/EasyPay |
| api/webhooks.md | `_docs/api/webhooks.md` | Stripe, EasyPay, WorkOS webhook schemas |
| rate-limiting.md | `_docs/rate-limiting.md` | Upstash config, per-tenant limits |
