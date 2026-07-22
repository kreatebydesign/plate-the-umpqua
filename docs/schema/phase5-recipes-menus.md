# Phase 5 schema note — Recipes & Client Menus

## Database reality

This repository uses **MongoDB** via `@payloadcms/db-mongodb`, not PostgreSQL.
Payload collection configs are the schema source of truth. There is no SQL migration
runner in this project.

## Collections added

### `recipes` (`collections/Recipes.ts`)
Private culinary recipe library. Default `visibility: private`.
Access: `culinaryCollectionAccess`.

### `menus` (`collections/Menus.ts`)
Client menu builder documents with relationships to `clients`, optional `inquiries`
and `events`, nested sections/items, hashed review tokens, bounded review + revision
history.
Access: `culinaryCollectionAccess`.

## Existing collection preserved

`menu-concepts` remains the culinary inspiration library used by packages/proposals.
Do not conflate it with client `menus`.

## Applying locally / in production

1. Deploy code that registers the collections in `payload.config.ts`.
2. Run `npm run generate:types` after pulling.
3. MongoDB creates collections on first write — **do not run a production migration
   manually** for this phase.
4. No new environment variables are required. Optional email send reuses
   existing `RESEND_API_KEY`.

## Future cookbook / subscription path (not implemented)

Safest next steps when ready:

1. Keep `visibility: publishingCandidate` + `slug` / `publicTitle` / `publicSummary`
   / `heroImage` / `chefIntroduction` as the publishing allowlist.
2. Add a dedicated public (or member) route that only reads recipes with an explicit
   publishing flag — never default-private recipes.
3. Introduce Stripe products / entitlements only after a separate product/security
   pass. Do not reuse menu-review tokens for membership.
4. Prefer a separate media policy for private culinary photos before public archive
   launch (current `media` collection is publicly readable by design).
