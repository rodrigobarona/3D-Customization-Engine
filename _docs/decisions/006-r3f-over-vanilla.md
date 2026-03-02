# ADR-006: React Three Fiber over Vanilla Three.js

**Status**: Accepted
**Date**: 2026-03-02

## Context
3D renderer must integrate with React 19 component tree, shadcn UI, Suspense boundaries.

## Decision
R3F + Drei helpers.

## Alternatives Considered
- **Vanilla Three.js**: Imperative, hard to integrate with React
- **Babylon.js**: Different ecosystem
- **A-Frame**: Too high-level

## Consequences
Declarative 3D, React lifecycle, Suspense loading, component reuse.
