# ADR-008: Upstash for Per-Tenant Rate Limiting

**Status**: Accepted
**Date**: 2026-03-02

## Context
Multi-tenant API needs per-tenant rate limiting at edge.

## Decision
@upstash/ratelimit with Upstash Redis.

## Alternatives Considered
- **In-memory**: Doesn't work across serverless instances
- **Vercel KV**: Upstash under the hood anyway
- **Custom Redis**: Need to manage infrastructure

## Consequences
Serverless-native, HTTP-based, works at edge, per-tenant sliding window, Upstash MCP already connected.
