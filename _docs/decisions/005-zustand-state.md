# ADR-005: Zustand for 3D Configurator State

**Status**: Accepted
**Date**: 2026-03-02

## Context
Configurator state (zones, colors, fonts, texture) must be reactive and sync between UI controls and 3D renderer in real-time.

## Decision
Zustand store.

## Alternatives Considered
- **React Context**: Re-render everything
- **Redux**: Too heavy
- **Jotai**: Atomic but complex for this use case

## Consequences
Minimal re-renders, subscribe from R3F components, middleware for devtools.
