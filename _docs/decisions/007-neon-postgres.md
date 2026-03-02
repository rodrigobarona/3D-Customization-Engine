# ADR-007: Neon Serverless Postgres

**Status**: Accepted
**Date**: 2026-03-02

## Context
Multi-tenant data storage needs SQL, tenant isolation, serverless-friendly.

## Decision
Neon with @neondatabase/serverless driver.

## Alternatives Considered
- **Supabase**: More opinionated
- **PlanetScale**: MySQL
- **Turso**: SQLite, limited for complex queries

## Consequences
True Postgres, branching for dev, serverless HTTP driver, auto-scaling, Vercel integration.
