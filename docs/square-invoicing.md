# Square Invoicing Integration

Plate The Umpqua OS integrates with Square for hosted payment collection.
Plate OS is the **source of truth** — Square is used only for secure payment hosting.
Square never receives `internalNotes`. All invoice emails come from Plate, not Square.

---

## Architecture

```
Plate OS → Square API
   ↓
Invoice created in Plate → createSquarePaymentInvoice()
   ↓
Square Customer upserted (by billing email)
   ↓
Square Order created (from Plate line items)
   ↓
Square Invoice created (SHARE_MANUALLY, no automatic Square email)
   ↓
Square Invoice published → public pay URL returned
   ↓
Operator shares Square pay link via Plate-branded email
   ↓
Client pays via Square → webhook fires
   ↓
Plate ledger updated (append-only InvoicePayments)
```

---

## Environment Variables

Set these in `.env.local` (development) or Vercel dashboard (production). **Never commit values.**

| Variable | Description |
|---|---|
| `SQUARE_ENVIRONMENT` | `sandbox` (default) or `production` |
| `SQUARE_APPLICATION_ID` | From Square Developer Dashboard → OAuth |
| `SQUARE_APPLICATION_SECRET` | From Square Developer Dashboard → OAuth (secret) |
| `SQUARE_OAUTH_REDIRECT_URL` | Exact redirect URI registered in Square Dashboard |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | From Square Developer Dashboard → Webhooks |
| `SQUARE_TOKEN_ENCRYPTION_KEY` | 32+ byte secret for AES-256-GCM token encryption |

### OAuth Redirect URI

Register this **exact URL** in your Square Developer Dashboard → OAuth → Redirect URLs:

```
{NEXT_PUBLIC_SITE_URL}/api/square/oauth/callback
```

Example (sandbox/preview):
```
https://plate-the-umpqua.vercel.app/api/square/oauth/callback
```

### Webhook Endpoint

Register this **exact URL** in Square Developer Dashboard → Webhooks → Add Webhook:

```
{NEXT_PUBLIC_SITE_URL}/api/square/webhook
```

Subscribe to these event types:
- `invoice.payment_made`
- `invoice.updated`
- `invoice.published`
- `payment.updated`
- `payment.created`

---

## OAuth Scopes

The OAuth connection requests exactly these scopes (least privilege):

```
MERCHANT_PROFILE_READ
CUSTOMERS_READ
CUSTOMERS_WRITE
ORDERS_READ
ORDERS_WRITE
INVOICES_READ
INVOICES_WRITE
PAYMENTS_READ
```

---

## Token Security

- Access and refresh tokens are encrypted with AES-256-GCM before database storage
- Encryption key: `SQUARE_TOKEN_ENCRYPTION_KEY` (separate from `PAYLOAD_SECRET`)
- Stored in `square-connections` collection (directors-only access)
- Token ciphertext fields have `access: { read: () => false }` — never returned to API clients
- Token refresh runs on a cron every 3 days at `/api/cron/square-token-refresh`

---

## OAuth Flow

1. Director navigates to `/os/settings/square`
2. Click **Connect Square** → server generates state, redirects to Square authorize URL
3. Square redirects back to `/api/square/oauth/callback?code=...&state=...`
4. Callback validates state (CSRF protection), exchanges code for tokens
5. Tokens are sealed and stored in `square-connections`
6. Redirect to `/os/settings/square?connected=1`
7. Director selects location (required before creating invoices)

---

## Invoice Workflow

1. Create a Plate invoice normally via `/os/invoices/new`
2. On the invoice detail page, scroll to **Square Payment** section
3. Click **Create Square payment invoice**
   - Upserts Square customer (by billing email)
   - Creates Square order from Plate line items
   - Creates Square invoice (SHARE_MANUALLY delivery — no Square email)
   - Publishes invoice → returns pay URL
4. Copy the pay link and share it in the Plate-branded invoice email
5. When client pays, Square fires a webhook → Plate ledger updated automatically
6. Use **Sync Square payments** to manually pull status at any time

---

## Delivery Method

All Square invoices use `SHARE_MANUALLY` delivery.  
Square **never** sends emails to clients. The operator sends the Plate-branded email with the Square pay URL embedded.

---

## Sandbox QA Checklist

Before going live, complete this checklist using Sandbox credentials:

- [ ] `SQUARE_ENVIRONMENT=sandbox` is set
- [ ] Square sandbox application created at https://developer.squareup.com
- [ ] `SQUARE_APPLICATION_ID` set to sandbox app ID
- [ ] `SQUARE_APPLICATION_SECRET` set to sandbox app secret
- [ ] OAuth redirect URL registered: `{site_url}/api/square/oauth/callback`
- [ ] Webhook endpoint registered: `{site_url}/api/square/webhook`
- [ ] Webhook event types subscribed (see above)
- [ ] `SQUARE_WEBHOOK_SIGNATURE_KEY` set from sandbox webhook subscription
- [ ] `SQUARE_TOKEN_ENCRYPTION_KEY` set (32+ bytes, unique per env)
- [ ] OAuth flow completes at `/os/settings/square`
- [ ] Location selected and saved
- [ ] Test invoice created in Plate OS
- [ ] "Create Square payment invoice" succeeds
- [ ] Square pay URL is valid and opens in browser
- [ ] Sandbox test payment completes (card: 4111 1111 1111 1111)
- [ ] Webhook fires and Plate payment is recorded
- [ ] Token refresh cron: `GET /api/cron/square-token-refresh` returns `{ ok: true }`
- [ ] `npx tsx scripts/verify-square.ts` passes all tests
- [ ] `npx tsx scripts/verify-invoices.ts` passes all tests

---

## Production Activation Gate

Production Square access requires **explicit operator authorization**. Steps:

1. Complete Sandbox QA checklist above
2. Director reviews and approves production activation
3. Switch `SQUARE_ENVIRONMENT=production` in Vercel production environment
4. Register production OAuth redirect URL in Square Dashboard
5. Register production webhook endpoint in Square Dashboard
6. Set production `SQUARE_APPLICATION_ID`, `SQUARE_APPLICATION_SECRET`, `SQUARE_WEBHOOK_SIGNATURE_KEY`
7. Generate a new `SQUARE_TOKEN_ENCRYPTION_KEY` (production only, never reuse sandbox key)
8. Re-run OAuth flow in production to obtain live tokens
9. Process one live test transaction before client launch

**Never copy sandbox tokens or keys to production.**

---

## Cron Jobs

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/square-token-refresh` | Every 3 days at 9am UTC | Refresh access token before 7-day expiry |
| `/api/cron/feedback-sweep` | Every hour | Existing feedback sweep |

---

## Data Model

### `square-connections`
Stores the active OAuth connection. Token ciphertext is never returned to clients.

### `square-oauth-states`
Short-lived CSRF state tokens (10-minute TTL).

### `square-webhook-events`
Append-only processed event log for webhook deduplication.

### `invoices.square` group
```
customerId       — Square customer ID
orderId          — Square order ID
invoiceId        — Square invoice ID
paymentLinkUrl   — Square-hosted pay URL
publicUrl        — Same as paymentLinkUrl
status           — Square invoice status (UNPAID, PAID, etc.)
version          — Square invoice version
deliveryMethod   — Always SHARE_MANUALLY
lastSyncedAt     — Last sync timestamp
lastError        — Last sync error message
```

### `invoice-payments`
Append-only payment ledger. Square payments added via webhook or manual sync.
`squarePaymentId` unique constraint prevents duplicate entries.
