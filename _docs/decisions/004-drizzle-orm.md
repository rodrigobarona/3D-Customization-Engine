# ADR-004: Drizzle ORM over Prisma

**Status**: Accepted
**Date**: 2026-03-02

## Context
Multi-tenant queries need tenant_id scoping on every query.

## Decision
Drizzle ORM with Neon serverless driver.

## Alternatives Considered
- **Prisma**: Heavier, cold start issues on serverless
- **Raw SQL**: No type safety
- **Kysely**: Less ecosystem

## Consequences
Type-safe queries, lightweight, perfect serverless fit, easy tenant_id scoping.
