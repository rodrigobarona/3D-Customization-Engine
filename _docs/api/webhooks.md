# Webhook Schemas

Webhook payload schemas for Stripe, EasyPay, and WorkOS integrations.

---

## Stripe

Configure webhook endpoint in Stripe Dashboard. Verify signature with `STRIPE_WEBHOOK_SECRET`.

**Endpoint:** `POST /api/webhooks/stripe`

### payment_intent.succeeded

Fired when a PaymentIntent succeeds.

```json
{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 5000,
      "currency": "eur",
      "metadata": {
        "tenant_id": "tenant_id",
        "order_id": "order_id",
        "config_hash": "config_hash"
      },
      "status": "succeeded"
    }
  }
}
```

**Action:** Update order status, trigger fulfillment.

---

### invoice.paid

Fired when a subscription invoice is paid.

```json
{
  "id": "evt_xxx",
  "type": "invoice.paid",
  "data": {
    "object": {
      "id": "in_xxx",
      "subscription": "sub_xxx",
      "customer": "cus_xxx",
      "amount_paid": 2900,
      "currency": "eur",
      "metadata": {
        "tenant_id": "tenant_id"
      }
    }
  }
}
```

**Action:** Extend subscription period, update tenant billing status.

---

### customer.subscription.updated

Fired when a subscription is updated (plan change, cancellation, etc.).

```json
{
  "id": "evt_xxx",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxx",
      "status": "active",
      "plan": {
        "id": "price_xxx",
        "nickname": "Pro"
      },
      "metadata": {
        "tenant_id": "tenant_id"
      }
    }
  }
}
```

**Action:** Sync plan/feature flags for tenant.

---

## EasyPay

EasyPay sends payment status callbacks to a webhook URL configured per tenant.

**Endpoint:** `POST /api/webhooks/easypay` (or tenant-configured URL)

**Headers:**

| Header        | Description                    |
|---------------|--------------------------------|
| Content-Type  | application/json               |
| User-Agent    | EasyPay-Webhook/1.0            |

### Payment status callback

```json
{
  "id": "ep_xxx",
  "key": "MB-123456789",
  "status": "success",
  "method": "mb",
  "amount": 49.99,
  "currency": "EUR",
  "expiration_time": "2025-03-02T23:59:59Z",
  "metadata": {
    "tenant_id": "tenant_id",
    "order_id": "order_id",
    "config_hash": "config_hash"
  }
}
```

| Field           | Type   | Description                          |
|-----------------|--------|--------------------------------------|
| id              | string | EasyPay payment ID                   |
| key              | string | MB reference / MB WAY ID             |
| status          | string | `success`, `pending`, `expired`, `failed` |
| method          | string | `mb` (Multibanco), `mbway`            |
| amount          | number | Amount in EUR                        |
| metadata        | object | Tenant/order context                 |

**Action:** Update order status, trigger fulfillment.

---

## WorkOS

Configure webhook endpoint in WorkOS Dashboard. Verify signature with `WORKOS_WEBHOOK_SECRET`.

**Endpoint:** `POST /api/webhooks/workos`

### user.created

Fired when a new user is created.

```json
{
  "id": "evt_xxx",
  "event": "user.created",
  "data": {
    "id": "user_xxx",
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "organization_id": "org_xxx"
  }
}
```

**Action:** Sync user to internal DB, create tenant membership if needed.

---

### organization.updated

Fired when an organization is updated.

```json
{
  "id": "evt_xxx",
  "event": "organization.updated",
  "data": {
    "id": "org_xxx",
    "name": "Acme Corp",
    "domain_data": [
      { "domain": "acme.com", "state": "verified" }
    ]
  }
}
```

**Action:** Update tenant org metadata, domain verification status.

---

### Directory Sync (dsync) events

Fired when Directory Sync syncs users/groups.

| Event                    | Description                    |
|--------------------------|--------------------------------|
| dsync.user.created       | User synced from IdP           |
| dsync.user.updated       | User profile updated           |
| dsync.user.deleted       | User removed from IdP          |
| dsync.group.created      | Group synced                   |
| dsync.group.updated      | Group updated                  |
| dsync.group.deleted      | Group removed                  |
| dsync.group_membership.added   | User added to group    |
| dsync.group_membership.removed | User removed from group |

**Example: dsync.user.created**

```json
{
  "id": "evt_xxx",
  "event": "dsync.user.created",
  "data": {
    "id": "user_xxx",
    "email": "user@acme.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "directory_id": "dir_xxx",
    "organization_id": "org_xxx"
  }
}
```

**Action:** Provision/deprovision users, sync group memberships for RBAC.

---

## Webhook Verification

### Stripe

```typescript
import Stripe from 'stripe';

const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  await request.text(),
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### WorkOS

```typescript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const sig = request.headers.get('workos-signature');
const event = workos.webhooks.verifyEvent({
  payload: await request.text(),
  sig,
  secret: process.env.WORKOS_WEBHOOK_SECRET!,
});
```

### EasyPay

Verify using tenant-configured secret or HMAC if provided by EasyPay API.
