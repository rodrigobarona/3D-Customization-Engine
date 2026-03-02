# Phase 1: Core Engine

**Duration:** 3–4 weeks  
**Status:** Not started

---

## Overview

Phase 1 establishes the foundational 3D customization engine: a single-tenant MVP with R3F/Three.js rendering, a deterministic texture engine, REST API v1, and Vercel Blob storage. The goal is to deliver a working jersey configurator with real-time texture updates and export capabilities.

---

## Tasks

- [ ] Set up R3F scene with Three.js
- [ ] Implement texture engine (Canvas 2D, 2048×2048, deterministic)
- [ ] Build REST API v1 (single-tenant)
- [ ] Implement single product (jersey)
- [ ] Set up Vercel Blob storage connector
- [ ] Configure Zustand state store
- [ ] Set up Zod validation schemas

---

## Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| 3D jersey renders | GLB model loads and displays in R3F Canvas |
| Texture updates in real-time | Zone changes (text, color, image) reflect immediately on the 3D model |
| Export produces deterministic PNG | Same config input yields identical PNG output |
| API returns product config | `GET /api/v1/products/:id` returns `model_url`, `zones`, `colors`, `fonts` |

---

## Dependencies

None. This is the first phase.

---

## Documentation Deliverables

| Document | Location | Description |
|----------|----------|-------------|
| setup.md | `_docs/setup.md` | Project setup, env vars, local dev |
| skills-registry.md | `_docs/skills-registry.md` | Agent skills index for the project |
| architecture/system-overview.md | `_docs/architecture/system-overview.md` | High-level system architecture |
| texture-engine.md | `_docs/texture-engine.md` | Texture generation pipeline, Canvas API usage |
| 3d-pipeline.md | `_docs/3d-pipeline.md` | R3F scene, GLB loading, material binding |
| storage-connector.md | `_docs/architecture/storage-connector.md` | Vercel Blob connector interface |
| api/openapi.yaml | `_docs/api/openapi.yaml` | Initial OpenAPI 3.0 spec for REST API v1 |
