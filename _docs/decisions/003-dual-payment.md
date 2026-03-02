# ADR-003: Dual Payment (Stripe + EasyPay Portugal)

**Status**: Accepted
**Date**: 2026-03-02

## Context
SaaS billing needs international + Portuguese market support (Multibanco, MB WAY are dominant in Portugal).

## Decision
PaymentConnector interface, Stripe for international, EasyPay REST API for Portugal.

## Alternatives Considered
- **Stripe only**: Missing Multibanco/MB WAY
- **EasyPay only**: Limited international coverage
- **Adyen**: Expensive

## Consequences
Full Portuguese market coverage, connector per tenant config, EasyPay needs custom REST wrapper.
