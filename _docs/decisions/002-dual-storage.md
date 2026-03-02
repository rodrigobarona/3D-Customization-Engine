# ADR-002: Dual Storage (Vercel Blob + Cloudflare R2)

**Status**: Accepted
**Date**: 2026-03-02

## Context
Need object storage for GLB models, textures, exported PNGs, PDFs.

## Decision
Adapter/connector pattern with `STORAGE_PROVIDER` env var. Vercel Blob for MVP, Cloudflare R2 for production.

## Alternatives Considered
- **S3 only**: Single vendor, higher egress costs
- **Vercel Blob only**: Simpler but vendor lock-in, less cost-effective at scale
- **Cloudflare R2 only**: Skip fast MVP path

## Consequences
Fast MVP with Vercel Blob, production-grade with R2 (S3-compatible, cheaper egress), zero vendor lock-in.
