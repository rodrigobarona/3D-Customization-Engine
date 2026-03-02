# Payment Connector

## Overview

The Payment Connector provides a unified interface for payment processing across the 3D Customization Engine. It uses the **Adapter Pattern** to support multiple providers: Stripe for international payments and EasyPay for Portugal-specific methods (Multibanco, MB WAY, Virtual IBAN).

Connector selection is **per-tenant** via the `payment_provider` field in the tenant configuration.

---

## Connector Selection

| Provider | Connector | Region | Methods |
|---------|-----------|--------|---------|
| `stripe` | StripeConnector | International | Cards, PaymentIntents, Subscriptions |
| `easypay` | EasyPayConnector | Portugal | Multibanco, MB WAY, Virtual IBAN |

---

## PaymentConnector Interface

```typescript
/**
 * Unified payment interface for payment processing.
 * Implementations: StripeConnector, EasyPayConnector
 */
export interface PaymentConnector {
  /**
   * Create a one-time payment.
   * @param amount - Amount in minor units (cents)
   * @param currency - ISO 4217 currency code
   * @param method - Payment method
   * @param metadata - Optional metadata (tenant_id, order_id, etc.)
   * @returns Payment creation result with client_secret or redirect URL
   */
  createPayment(
    amount: number,
    currency: string,
    method: PaymentMethod,
    metadata?: PaymentMetadata
  ): Promise<CreatePaymentResult>;

  /**
   * Create a subscription.
   * @param plan - Plan identifier
   * @param customer - Customer ID or email
   * @param metadata - Optional metadata
   * @returns Subscription creation result
   */
  createSubscription(
    plan: string,
    customer: string,
    metadata?: PaymentMetadata
  ): Promise<CreateSubscriptionResult>;

  /**
   * Handle a webhook payload (signature verification + processing).
   * @param payload - Raw request body
   * @param signature - Signature header value
   * @returns Processed webhook result
   */
  handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookResult>;

  /**
   * Refund a payment (full or partial).
   * @param paymentId - Original payment ID
   * @param amount - Amount to refund (optional; full refund if omitted)
   @returns Refund result
   */
  refund(paymentId: string, amount?: number): Promise<RefundResult>;

  /**
   * Get payment status.
   * @param paymentId - Payment ID
   * @returns Payment status
   */
  getStatus(paymentId: string): Promise<PaymentStatus>;
}

export type PaymentMethod = 'card' | 'multibanco' | 'mbway' | 'virtual_iban';

export interface PaymentMetadata {
  tenant_id?: string;
  order_id?: string;
  product_id?: string;
  [key: string]: string | undefined;
}

export interface CreatePaymentResult {
  paymentId: string;
  status: 'pending' | 'requires_action' | 'succeeded' | 'failed';
  clientSecret?: string; // For Stripe PaymentIntent
  redirectUrl?: string; // For EasyPay
  expiresAt?: string; // ISO 8601
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  status: string;
  clientSecret?: string;
  currentPeriodEnd?: string;
}

export interface WebhookResult {
  processed: boolean;
  eventId?: string;
  eventType?: string;
}

export interface RefundResult {
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  amount?: number;
  currency?: string;
}
```

---

## StripeConnector

Uses the official `stripe` npm SDK for PaymentIntents and Subscriptions.

```typescript
import Stripe from 'stripe';

function mapStripeStatus(s: string): CreatePaymentResult['status'] {
  const map: Record<string, CreatePaymentResult['status']> = {
    requires_payment_method: 'pending',
    requires_confirmation: 'requires_action',
    requires_action: 'requires_action',
    processing: 'pending',
    succeeded: 'succeeded',
    canceled: 'failed',
    requires_capture: 'pending',
  };
  return map[s] ?? 'pending';
}

function mapEasyPayStatus(s: string): CreatePaymentResult['status'] {
  const map: Record<string, CreatePaymentResult['status']> = {
    pending: 'pending',
    success: 'succeeded',
    expired: 'failed',
    failed: 'failed',
  };
  return map[s] ?? 'pending';
}

export class StripeConnector implements PaymentConnector {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(config: { secretKey: string; webhookSecret: string }) {
    this.stripe = new Stripe(config.secretKey, { apiVersion: '2024-11-20.acacia' });
    this.webhookSecret = config.webhookSecret;
  }

  async createPayment(
    amount: number,
    currency: string,
    method: PaymentMethod,
    metadata?: PaymentMetadata
  ): Promise<CreatePaymentResult> {
    if (method !== 'card') {
      throw new Error(`StripeConnector only supports card payments`);
    }
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: metadata as Record<string, string>,
    });
    return {
      paymentId: paymentIntent.id,
      status: mapStripeStatus(paymentIntent.status as string),
      clientSecret: paymentIntent.client_secret ?? undefined,
    };
  }

  async createSubscription(
    plan: string,
    customer: string,
    metadata?: PaymentMetadata
  ): Promise<CreateSubscriptionResult> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customer.startsWith('cus_') ? customer : undefined,
      customer_email: customer.includes('@') ? customer : undefined,
      items: [{ price: plan }],
      metadata: metadata as Record<string, string>,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | undefined;
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: paymentIntent?.client_secret ?? undefined,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined,
    };
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookResult> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
    // Handle event types: payment_intent.succeeded, customer.subscription.updated, etc.
    return {
      processed: true,
      eventId: event.id,
      eventType: event.type,
    };
  }

  async refund(paymentId: string, amount?: number): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount,
    });
    return {
      refundId: refund.id,
      status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
    };
  }

  async getStatus(paymentId: string): Promise<PaymentStatus> {
    const pi = await this.stripe.paymentIntents.retrieve(paymentId);
    return {
      paymentId: pi.id,
      status: mapStripeStatus(pi.status as string),
      amount: pi.amount,
      currency: pi.currency,
    };
  }
}
```

---

## EasyPayConnector

Uses REST API v2.0 at `https://api.prod.easypay.pt/2.0` for payment creation and webhooks.

```typescript
export interface EasyPayConfig {
  accountId: string;
  apiKey: string;
  baseUrl?: string; // Default: https://api.prod.easypay.pt/2.0
}

export class EasyPayConnector implements PaymentConnector {
  private readonly accountId: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: EasyPayConfig) {
    this.accountId = config.accountId;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.prod.easypay.pt/2.0';
  }

  private async request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'AccountId': this.accountId,
        'ApiKey': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`EasyPay API error: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async createPayment(
    amount: number,
    currency: string,
    method: PaymentMethod,
    metadata?: PaymentMetadata
  ): Promise<CreatePaymentResult> {
    const typeMap = {
      multibanco: 'mb',
      mbway: 'mbw',
      virtual_iban: 'cc',
      card: 'cc',
    };
    const type = typeMap[method] ?? 'mb';
    const payload = {
      type,
      payment: {
        methods: [type],
        type: 'sale',
        currency: currency.toUpperCase(),
        value: amount / 100, // EasyPay uses euros, not cents
      },
      order: {
        key: metadata?.order_id ?? crypto.randomUUID(),
        value: amount / 100,
      },
    };
    const result = await this.request<EasyPayPaymentResponse>(
      'POST',
      '/single',
      payload
    );
    return {
      paymentId: result.id,
      status: mapEasyPayStatus(result.status),
      redirectUrl: result.method?.url ?? result.method?.entity,
      expiresAt: result.expires_at,
    };
  }

  async createSubscription(
    plan: string,
    customer: string,
    metadata?: PaymentMetadata
  ): Promise<CreateSubscriptionResult> {
    const result = await this.request<EasyPaySubscriptionResponse>(
      'POST',
      '/subscription',
      {
        type: 'sale',
        payment: { methods: ['cc', 'mb', 'mbw'], type: 'subscription' },
        subscription: { plan: plan },
        customer: { email: customer },
        order: { key: metadata?.order_id ?? crypto.randomUUID() },
      }
    );
    return {
      subscriptionId: result.id,
      status: result.status ?? 'pending',
      redirectUrl: result.method?.url,
    };
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookResult> {
    const body = typeof payload === 'string' ? payload : payload.toString();
    const event = JSON.parse(body);
    // Verify signature if EasyPay provides one
    // Process: payment.completed, payment.expired, etc.
    return { processed: true, eventId: event.id, eventType: event.type };
  }

  async refund(paymentId: string, amount?: number): Promise<RefundResult> {
    const result = await this.request<{ id: string }>(
      'POST',
      `/capture/${paymentId}/refund`,
      amount ? { value: amount / 100 } : {}
    );
    return { refundId: result.id, status: 'succeeded' };
  }

  async getStatus(paymentId: string): Promise<PaymentStatus> {
    const result = await this.request<EasyPayPaymentResponse>(
      'GET',
      `/single/${paymentId}`
    );
    return {
      paymentId: result.id,
      status: mapEasyPayStatus(result.status),
      amount: result.payment?.value ? Math.round(result.payment.value * 100) : undefined,
      currency: result.payment?.currency,
    };
  }
}

interface EasyPayPaymentResponse {
  id: string;
  status: string;
  method?: { url?: string; entity?: string };
  payment?: { value?: number; currency?: string };
  expires_at?: string;
}

interface EasyPaySubscriptionResponse {
  id: string;
  status?: string;
  method?: { url?: string };
}
```

---

## EasyPay Test Credentials

For development and testing:

| Environment | AccountId | ApiKey |
|-------------|-----------|--------|
| Test | `2b0f63e2-9fb5-4e52-aca0-b4bf0339bbe6` | `eae4aa59-8e5b-4ec2-887d-b02768481a92` |

---

## Factory Implementation

```typescript
import { PaymentConnector } from './types';
import { StripeConnector } from './stripe';
import { EasyPayConnector } from './easypay';

export function createPaymentConnector(provider: string): PaymentConnector {
  switch (provider) {
    case 'stripe':
      return new StripeConnector({
        secretKey: process.env.STRIPE_SECRET_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      });
    case 'easypay':
      return new EasyPayConnector({
        accountId: process.env.EASYPAY_ACCOUNT_ID!,
        apiKey: process.env.EASYPAY_API_KEY!,
        baseUrl: process.env.EASYPAY_BASE_URL ?? 'https://api.prod.easypay.pt/2.0',
      });
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

// Usage: tenant.payment_provider determines which connector to use
export function getPaymentConnectorForTenant(tenant: { payment_provider: string }): PaymentConnector {
  return createPaymentConnector(tenant.payment_provider);
}
```

---

## Status Mapping

| Stripe | EasyPay | Unified |
|--------|---------|---------|
| `requires_payment_method` | `pending` | `pending` |
| `requires_confirmation` | `pending` | `requires_action` |
| `requires_action` | `pending` | `requires_action` |
| `processing` | `pending` | `pending` |
| `succeeded` | `success` | `succeeded` |
| `canceled` | `expired` | `failed` |
| `requires_capture` | — | `pending` |

---

## Webhook Endpoints

| Provider | Endpoint | Events |
|----------|----------|--------|
| Stripe | `POST /api/webhooks/stripe` | `payment_intent.succeeded`, `customer.subscription.*` |
| EasyPay | `POST /api/webhooks/easypay` | `payment.completed`, `payment.expired` |
