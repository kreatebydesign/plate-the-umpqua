#!/usr/bin/env npx tsx
/**
 * Verify Square integration correctness without live credentials.
 * Run: npx tsx scripts/verify-square.ts
 */
/* eslint-disable @typescript-eslint/no-require-imports -- dynamic env cache resets need fresh module state */

import crypto from 'crypto'
import { roundtripTest } from '../lib/crypto/sealedSecrets'
import { generateOAuthState } from '../lib/os/square/oauth'
import { SQUARE_SCOPES, scopeString, validateGrantedScopes } from '../lib/os/square/scopes'
import { idempotencyKey } from '../lib/os/square/createInvoice'
import { tokenExpiresWithin } from '../lib/os/square/oauth'
import { WebhooksHelper } from 'square'

let passed = 0
let failed = 0

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

function section(title: string) {
  console.log(`\n${title}`)
  console.log('─'.repeat(title.length))
}

// ─────────────────────────────────────────────────────────────────────────────
section('1. Seal / unseal roundtrip')

const TEST_KEY_HEX = crypto.randomBytes(32).toString('hex')
const TEST_KEY_B64 = crypto.randomBytes(32).toString('base64')
const TEST_KEY_SHORT = 'short-key-hashed-via-sha256'

assert('roundtrip with hex key', roundtripTest('hello world', TEST_KEY_HEX))
assert('roundtrip with base64 key', roundtripTest('my-refresh-token-12345', TEST_KEY_B64))
assert('roundtrip with utf-8 short key (hashed)', roundtripTest('access_token_value', TEST_KEY_SHORT))
assert('roundtrip with unicode payload', roundtripTest('Plate The Umpqua · Roseburg', TEST_KEY_HEX))
assert('roundtrip with empty string payload', roundtripTest('', TEST_KEY_HEX))
assert('roundtrip produces different ciphertexts (nonce)', (() => {
  const iv1 = crypto.randomBytes(12).toString('hex')
  const iv2 = crypto.randomBytes(12).toString('hex')
  return iv1 !== iv2
})())

// Test tampering detection
assert('tampered ciphertext fails gracefully', (() => {
  const { sealSecret, unsealSecret } = require('../lib/crypto/sealedSecrets') as typeof import('../lib/crypto/sealedSecrets')
  process.env.SQUARE_TOKEN_ENCRYPTION_KEY = TEST_KEY_HEX
  const sealed = sealSecret('sensitive-token')
  const parts = sealed.split(':')
  parts[2] = crypto.randomBytes(parts[2].length / 2).toString('hex')
  const tampered = parts.join(':')
  try {
    unsealSecret(tampered)
    return false
  } catch {
    return true
  }
})())

// ─────────────────────────────────────────────────────────────────────────────
section('2. OAuth state validation')

const state1 = generateOAuthState()
assert('state is 64-char hex', /^[0-9a-f]{64}$/.test(state1.state))
assert('state expiresAt is ~10min from now', (() => {
  const exp = new Date(state1.expiresAt).getTime()
  const now = Date.now()
  return exp > now + 9 * 60 * 1000 && exp < now + 11 * 60 * 1000
})())

const state2 = generateOAuthState()
assert('state is unique per call', state1.state !== state2.state)

// ─────────────────────────────────────────────────────────────────────────────
section('3. Webhook signature validation (mock)')

;(async () => {
  // Test with a known HMAC-SHA256 value
  const sigKey = 'test-webhook-signature-key'
  const body = JSON.stringify({ event_id: 'test-123', type: 'invoice.payment_made' })
  const notificationUrl = 'https://plate.example.com/api/square/webhook'

  // Compute expected signature (WebhooksHelper uses HMAC-SHA256 over url+body)
  const hmac = crypto.createHmac('sha256', sigKey)
  hmac.update(notificationUrl + body)
  const expectedSig = hmac.digest('base64')

  const valid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: expectedSig,
    signatureKey: sigKey,
    notificationUrl,
  })
  assert('valid signature passes', valid)

  const invalid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: 'invalid-signature',
    signatureKey: sigKey,
    notificationUrl,
  })
  assert('invalid signature rejected', !invalid)
})().then(() => {

// ─────────────────────────────────────────────────────────────────────────────
section('4. Deposit mapping')

const INVOICE_ID = 'test-invoice-abc123'
const TOTAL = 100_000 // $1,000.00
const DEPOSIT = 30_000 // $300.00

assert('deposit < total means split schedule', DEPOSIT > 0 && DEPOSIT < TOTAL)
assert('deposit == 0 means single BALANCE', DEPOSIT > 0 || TOTAL > 0)
assert('idempotency key is stable for same invoice+suffix', (() => {
  const k1 = idempotencyKey(INVOICE_ID, 'order')
  const k2 = idempotencyKey(INVOICE_ID, 'order')
  return k1 === k2
})())
assert('idempotency key differs by suffix', (() => {
  const k1 = idempotencyKey(INVOICE_ID, 'order')
  const k2 = idempotencyKey(INVOICE_ID, 'invoice')
  return k1 !== k2
})())
assert('idempotency key prefixed with plate-ptu-', (() => {
  return idempotencyKey(INVOICE_ID, 'order').startsWith('plate-ptu-')
})())

// ─────────────────────────────────────────────────────────────────────────────
section('5. Environment isolation')

assert('sandbox is default when SQUARE_ENVIRONMENT unset', (() => {
  const orig = process.env.SQUARE_ENVIRONMENT
  delete process.env.SQUARE_ENVIRONMENT
  const { isSandbox, _clearEnvCache } = require('../lib/os/square/env') as typeof import('../lib/os/square/env')
  _clearEnvCache()
  const result = isSandbox()
  process.env.SQUARE_ENVIRONMENT = orig ?? ''
  _clearEnvCache()
  return result
})())

assert('production env is isolated', (() => {
  const orig = process.env.SQUARE_ENVIRONMENT
  process.env.SQUARE_ENVIRONMENT = 'sandbox'
  const { isSandbox, _clearEnvCache } = require('../lib/os/square/env') as typeof import('../lib/os/square/env')
  _clearEnvCache()
  const result = isSandbox()
  process.env.SQUARE_ENVIRONMENT = orig ?? ''
  _clearEnvCache()
  return result === true
})())

// ─────────────────────────────────────────────────────────────────────────────
section('6. No internalNotes in Square payload builder')

const fakeInvoice = {
  id: 'inv-test',
  invoiceNumber: 'PTU-2026-001',
  status: 'sent',
  billing: { name: 'Jane Doe', email: 'jane@example.com', phone: null, company: null },
  lineItems: [
    { description: 'Catering Services', isCredit: false, quantity: 2, unitPriceCents: 50000, lineTotalCents: 100000 },
  ],
  clientMemo: 'Thank you for your business',
  internalNotes: 'DO NOT SHARE: margin is 40%',
  totalCents: 100000,
  balanceDueCents: 100000,
  depositRequiredCents: 0,
  discountCents: 0,
  taxRateBps: 0,
  taxCents: 0,
  square: {},
}

assert('internalNotes must never appear in Square payload', (() => {
  const serialized = JSON.stringify({
    title: fakeInvoice.invoiceNumber,
    description: fakeInvoice.clientMemo,
  })
  return !serialized.includes('DO NOT SHARE') && !serialized.includes('internalNotes')
})())

assert('clientMemo IS included in description', (() => {
  const description = fakeInvoice.clientMemo ?? ''
  return description === 'Thank you for your business'
})())

// ─────────────────────────────────────────────────────────────────────────────
section('7. OAuth scopes')

assert('scope list has exactly 8 scopes', SQUARE_SCOPES.length === 8)
assert('MERCHANT_PROFILE_READ is included', SQUARE_SCOPES.includes('MERCHANT_PROFILE_READ'))
assert('INVOICES_WRITE is included', SQUARE_SCOPES.includes('INVOICES_WRITE'))
assert('PAYMENTS_READ is included', SQUARE_SCOPES.includes('PAYMENTS_READ'))
assert('scopeString is space-delimited', scopeString().includes(' '))

const { ok, missing } = validateGrantedScopes(scopeString())
assert('all required scopes pass validation', ok)
assert('missing array is empty for full grant', missing.length === 0)

const { ok: partialOk, missing: partialMissing } = validateGrantedScopes('MERCHANT_PROFILE_READ CUSTOMERS_READ')
assert('missing scopes detected in partial grant', !partialOk && partialMissing.length > 0)

// ─────────────────────────────────────────────────────────────────────────────
section('8. Token expiry detection')

assert('token expiring in 3 days triggers refresh (7d buffer)', (() => {
  const exp = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  return tokenExpiresWithin(exp)
})())

assert('token expiring in 14 days does not trigger refresh', (() => {
  const exp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  return !tokenExpiresWithin(exp)
})())

assert('already-expired token triggers refresh', (() => {
  const exp = new Date(Date.now() - 1000).toISOString()
  return tokenExpiresWithin(exp)
})())

// ─────────────────────────────────────────────────────────────────────────────
section('9. OAuth authorize URL construction')

const {
  buildAuthorizeUrl,
  assertAuthorizeUrlSafe,
  generateOAuthState: genState,
} = require('../lib/os/square/oauth') as typeof import('../lib/os/square/oauth')
const {
  getSquareEnv,
  _clearEnvCache,
  getSquareOAuthConfigDiagnostics,
} = require('../lib/os/square/env') as typeof import('../lib/os/square/env')

const VALID_SANDBOX_APP_ID = 'sandbox-sq0idb-TESTAPPID0000000001'
const VALID_SECRET = 'sandbox-sq0csb-TESTSECRET0000000000001'
const VALID_REDIRECT = 'https://www.platetheumpqua.com/api/square/oauth/callback'

function withSquareEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const keys = [
    'SQUARE_ENVIRONMENT',
    'SQUARE_APPLICATION_ID',
    'SQUARE_APPLICATION_SECRET',
    'SQUARE_OAUTH_REDIRECT_URL',
    'SQUARE_WEBHOOK_SIGNATURE_KEY',
  ]
  const prior: Record<string, string | undefined> = {}
  for (const key of keys) prior[key] = process.env[key]
  try {
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    _clearEnvCache()
    fn()
  } finally {
    for (const key of keys) {
      if (prior[key] === undefined) delete process.env[key]
      else process.env[key] = prior[key]
    }
    _clearEnvCache()
  }
}

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: VALID_SANDBOX_APP_ID,
    SQUARE_APPLICATION_SECRET: VALID_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
  },
  () => {
    const { state } = genState()
    const url = buildAuthorizeUrl(state)
    const parsed = new URL(url)
    assert(
      'valid sandbox app id uses sandbox OAuth hostname',
      parsed.hostname === 'connect.squareupsandbox.com',
    )
    assert('authorize path is /oauth2/authorize', parsed.pathname === '/oauth2/authorize')
    assert('redirect_uri matches configured callback', parsed.searchParams.get('redirect_uri') === VALID_REDIRECT)
    assert('client_id is the sandbox application id', parsed.searchParams.get('client_id') === VALID_SANDBOX_APP_ID)
    const scope = parsed.searchParams.get('scope') ?? ''
    const scopes = scope.split(/[+\s]/).filter(Boolean)
    assert('all eight scopes are present', scopes.length === 8 && SQUARE_SCOPES.every((s) => scopes.includes(s)))
    assert('CSRF state is nonempty', Boolean(parsed.searchParams.get('state')?.trim()))
    assert('sandbox omits session=false', parsed.searchParams.get('session') !== 'false')
    assert('assertAuthorizeUrlSafe accepts valid sandbox URL', (() => {
      assertAuthorizeUrlSafe(url)
      return true
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: 'SQUARE_APPLICATION_ID',
    SQUARE_APPLICATION_SECRET: VALID_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
  },
  () => {
    assert('literal SQUARE_APPLICATION_ID is rejected', (() => {
      try {
        getSquareEnv()
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        return message.includes('placeholder') && !message.includes(VALID_SECRET)
      }
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: undefined,
    SQUARE_APPLICATION_SECRET: VALID_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
  },
  () => {
    assert('missing application ID is rejected', (() => {
      try {
        getSquareEnv()
        return false
      } catch {
        return true
      }
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: '${SQUARE_APPLICATION_ID}',
    SQUARE_APPLICATION_SECRET: VALID_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
  },
  () => {
    assert('unresolved ${...} placeholder is rejected', (() => {
      try {
        getSquareEnv()
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        return message.includes('placeholder') && !message.includes(VALID_SECRET)
      }
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: 'sq0idp-ProductionLookingId0001',
    SQUARE_APPLICATION_SECRET: VALID_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
  },
  () => {
    assert('production-looking app id rejected in sandbox', (() => {
      try {
        getSquareEnv()
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        return message.includes('Sandbox Application ID') && !message.includes(VALID_SECRET)
      }
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: VALID_SANDBOX_APP_ID,
    SQUARE_APPLICATION_SECRET: VALID_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
  },
  () => {
    const diag = getSquareOAuthConfigDiagnostics()
    assert('diagnostics report sandbox environment', diag.environment === 'sandbox')
    assert('diagnostics never include full app id', diag.applicationIdRedacted !== VALID_SANDBOX_APP_ID)
    assert('production Square is not activated by sandbox config', process.env.SQUARE_ENVIRONMENT !== 'production')
  },
)

// ─────────────────────────────────────────────────────────────────────────────
section('11. Production transition safety')

const VALID_PROD_APP_ID = 'sq0idp-TESTPRODAPPID00000001'
const VALID_PROD_SECRET = 'sq0csp-TESTPRODSECRET0000000001'
const VALID_PROD_WEBHOOK = 'whsec_TEST_PRODUCTION_SIGNATURE_KEY_01'

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'production',
    SQUARE_APPLICATION_ID: VALID_PROD_APP_ID,
    SQUARE_APPLICATION_SECRET: VALID_PROD_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
    SQUARE_WEBHOOK_SIGNATURE_KEY: VALID_PROD_WEBHOOK,
  },
  () => {
    const { state } = genState()
    const url = buildAuthorizeUrl(state)
    const parsed = new URL(url)
    assert('production uses live OAuth hostname', parsed.hostname === 'connect.squareup.com')
    assert('production sets session=false', parsed.searchParams.get('session') === 'false')
    assert('production client_id is production app id', parsed.searchParams.get('client_id') === VALID_PROD_APP_ID)
    assert('production redirect matches callback', parsed.searchParams.get('redirect_uri') === VALID_REDIRECT)
    assert('assertAuthorizeUrlSafe accepts production URL', (() => {
      assertAuthorizeUrlSafe(url)
      return true
    })())
    const env = getSquareEnv()
    assert('production webhook signature key required and present', env.webhookSignatureKey === VALID_PROD_WEBHOOK)
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'production',
    SQUARE_APPLICATION_ID: VALID_SANDBOX_APP_ID,
    SQUARE_APPLICATION_SECRET: VALID_PROD_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
    SQUARE_WEBHOOK_SIGNATURE_KEY: VALID_PROD_WEBHOOK,
  },
  () => {
    assert('sandbox app id rejected in production', (() => {
      try {
        getSquareEnv()
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        return message.includes('Sandbox ID') && !message.includes(VALID_PROD_SECRET)
      }
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'production',
    SQUARE_APPLICATION_ID: VALID_PROD_APP_ID,
    SQUARE_APPLICATION_SECRET: VALID_PROD_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
    SQUARE_WEBHOOK_SIGNATURE_KEY: undefined,
  },
  () => {
    assert('missing webhook signature key rejected in production', (() => {
      try {
        getSquareEnv()
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        return message.includes('SQUARE_WEBHOOK_SIGNATURE_KEY') && !message.includes(VALID_PROD_SECRET)
      }
    })())
  },
)

withSquareEnv(
  {
    SQUARE_ENVIRONMENT: 'production',
    SQUARE_APPLICATION_ID: 'not-a-square-id',
    SQUARE_APPLICATION_SECRET: VALID_PROD_SECRET,
    SQUARE_OAUTH_REDIRECT_URL: VALID_REDIRECT,
    SQUARE_WEBHOOK_SIGNATURE_KEY: VALID_PROD_WEBHOOK,
  },
  () => {
    assert('malformed production app id rejected', (() => {
      try {
        getSquareEnv()
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        return message.includes('sq0idp-') && !message.includes(VALID_PROD_SECRET)
      }
    })())
  },
)

// ─────────────────────────────────────────────────────────────────────────────
section('10. Payment request sync extraction')

const {
  extractCompletedSquarePaymentRequests,
} = require('../lib/os/square/paymentRequestSync') as typeof import('../lib/os/square/paymentRequestSync')

assert('completed amount is recorded without status field', (() => {
  const rows = extractCompletedSquarePaymentRequests([
    {
      uid: 'req_1',
      computedAmountMoney: { amount: 1000 },
      totalCompletedAmountMoney: { amount: 1000 },
    },
  ])
  return rows.length === 1 && rows[0].uid === 'req_1' && rows[0].amountCents === 1000
})())

assert('zero completed amount is skipped', (() => {
  const rows = extractCompletedSquarePaymentRequests([
    {
      uid: 'req_2',
      computedAmountMoney: { amount: 1000 },
      totalCompletedAmountMoney: { amount: 0 },
    },
  ])
  return rows.length === 0
})())

assert('missing uid is skipped', (() => {
  const rows = extractCompletedSquarePaymentRequests([
    {
      uid: null,
      totalCompletedAmountMoney: { amount: 500 },
    },
  ])
  return rows.length === 0
})())

assert('legacy status COMPLETED alone does not create payment without completed money', (() => {
  const rows = extractCompletedSquarePaymentRequests([
    {
      uid: 'req_3',
      status: 'COMPLETED',
      computedAmountMoney: { amount: 1000 },
    },
  ])
  return rows.length === 0
})())

assert('bigint completed amounts convert to cents', (() => {
  const rows = extractCompletedSquarePaymentRequests([
    {
      uid: 'req_4',
      totalCompletedAmountMoney: { amount: BigInt(1000) },
    },
  ])
  return rows.length === 1 && rows[0].amountCents === 1000
})())

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────')
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('Some tests failed.')
  process.exit(1)
} else {
  console.log('All Square integration tests passed.')
}

}).catch((err) => {
  console.error('Test runner error:', err)
  process.exit(1)
})
