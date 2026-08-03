# Square invoicing — activation checklist

Plate OS invoices are ready for manual billing today. Square is intentionally **not connected**.

## Current state

- Admin UI shows **Square: Not connected**
- No fake Connect button
- Invoice and payment records include Square ID fields for future sync
- Access tokens must never be stored in MongoDB as plaintext

## Credentials and configuration required later

1. `SQUARE_APPLICATION_ID`
2. `SQUARE_ACCESS_TOKEN` (environment variable only)
3. `SQUARE_LOCATION_ID`
4. `SQUARE_WEBHOOK_SIGNATURE_KEY`
5. OAuth redirect URI for production (and preview if used)
6. Webhook endpoint for payment / invoice events
7. Idempotency-key strategy for payment-link creation
8. Webhook event ID deduplication (`invoice-payments.squareWebhookEventId`)

## Suggested implementation order

1. OAuth connect flow that stores only encrypted/refreshable credentials in env or a secrets manager
2. Create Square payment link from an invoice; persist `square.paymentLinkId` / `paymentLinkUrl`
3. Webhook handler that records immutable `invoice-payments` rows and recomputes balances
4. Operator UI actions: “Create Square payment link”, “Refresh Square status”

## Do not

- Commit Square secrets
- Store access tokens on the invoice document
- Mark invoices paid from unverified webhook payloads
