# ADR-001: WorkOS over Clerk for Authentication

**Status**: Accepted
**Date**: 2026-03-02

## Context
Multi-tenant SaaS needs enterprise SSO (SAML, OIDC), organizations, directory sync.

## Decision
WorkOS AuthKit with Next.js 16 proxy.ts pattern.

## Alternatives Considered
- **Clerk**: Simpler but less enterprise SSO
- **Auth.js**: Too low-level
- **Supabase Auth**: Tied to Supabase

## Consequences
Enterprise-grade auth, official Next.js 16 skill, organizations map to tenants.
