/**
 * Invoice domain verification — pure calculation/status/token/projection checks.
 * Run: npx tsx scripts/verify-invoices.ts
 */
import assert from 'node:assert/strict'
import { calculateInvoice, lineTotalCents } from '../lib/os/invoices/invoiceCalc'
import { deriveInvoiceStatus } from '../lib/os/invoices/invoiceStatus'
import {
  buildInvoiceSequenceAtomicUpdate,
  formatInvoiceNumber,
} from '../lib/os/invoices/invoiceNumber'
import {
  generateInvoiceToken,
  hashInvoiceToken,
  invoiceTokensMatch,
  normalizeInvoiceTokenParam,
} from '../lib/os/invoices/invoiceToken'
import {
  assertPublicProjectionSafe,
  PUBLIC_INVOICE_FORBIDDEN_KEYS,
} from '../lib/os/invoices/publicInvoice'
import { getSquareConnectionState } from '../lib/os/invoices/squareAdapter'
import { formatUsdFromCents, percentOfCents, taxFromBps } from '../lib/os/invoices/money'
import { startOfTodayInTimezone, addDays } from '../lib/os/formatDate'

function main() {
  // Money helpers
  assert.equal(percentOfCents(10000, 1000), 1000) // 10% of $100
  assert.equal(taxFromBps(10000, 875), 875) // 8.75%
  assert.equal(formatUsdFromCents(12345), '$123.45')

  // Line types
  assert.equal(lineTotalCents({ quantity: 1, unitPriceCents: 250000 }), 250000) // flat/event
  assert.equal(lineTotalCents({ quantity: 12, unitPriceCents: 8500 }), 102000) // per person
  assert.equal(lineTotalCents({ quantity: 2.5, unitPriceCents: 10000 }), 25000) // hourly
  assert.equal(lineTotalCents({ quantity: 3, unitPriceCents: 4000 }), 12000) // quantity
  assert.equal(
    lineTotalCents({ quantity: 1, unitPriceCents: 5000, isCredit: true }),
    -5000,
  )

  // Full invoice with credit, percent discount, tax
  const calc = calculateInvoice({
    lines: [
      { quantity: 1, unitPriceCents: 200000 }, // $2000 event
      { quantity: 10, unitPriceCents: 9500 }, // $950 guests
      { quantity: 1, unitPriceCents: 15000, isCredit: true }, // -$150 credit
    ],
    discountType: 'percent',
    discountValue: 1000, // 10%
    taxRateBps: 0,
    amountPaidCents: 50000,
  })
  assert.equal(calc.subtotalCents, 295000)
  assert.equal(calc.creditCents, 15000)
  // (295000 - 15000) * 10% = 28000
  assert.equal(calc.discountCents, 28000)
  assert.equal(calc.totalCents, 252000)
  assert.equal(calc.balanceDueCents, 202000)

  const fixed = calculateInvoice({
    lines: [{ quantity: 1, unitPriceCents: 10000 }],
    discountType: 'fixed',
    discountValue: 2500,
    taxRateBps: 1000, // 10%
  })
  assert.equal(fixed.discountCents, 2500)
  assert.equal(fixed.taxCents, 750)
  assert.equal(fixed.totalCents, 8250)

  // Status derivation
  const today = startOfTodayInTimezone()
  assert.equal(
    deriveInvoiceStatus({
      voidedAt: new Date().toISOString(),
      totalCents: 100,
      amountPaidCents: 100,
      balanceDueCents: 0,
      paymentCount: 1,
    }),
    'voided',
  )
  assert.equal(
    deriveInvoiceStatus({
      totalCents: 10000,
      amountPaidCents: 10000,
      balanceDueCents: 0,
      paymentCount: 1,
    }),
    'paid',
  )
  assert.equal(
    deriveInvoiceStatus({
      totalCents: 10000,
      amountPaidCents: 2500,
      balanceDueCents: 7500,
      paymentCount: 1,
    }),
    'partiallyPaid',
  )
  assert.equal(
    deriveInvoiceStatus({
      totalCents: 10000,
      amountPaidCents: 0,
      balanceDueCents: 10000,
      dueDate: addDays(today, -2).toISOString(),
      sentAt: new Date().toISOString(),
    }),
    'overdue',
  )
  assert.equal(
    deriveInvoiceStatus({
      totalCents: 10000,
      amountPaidCents: 0,
      balanceDueCents: 10000,
      firstViewedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    }),
    'viewed',
  )
  assert.equal(
    deriveInvoiceStatus({
      totalCents: 10000,
      amountPaidCents: 0,
      balanceDueCents: 10000,
      sentAt: new Date().toISOString(),
    }),
    'sent',
  )
  assert.equal(
    deriveInvoiceStatus({
      currentStatus: 'voided',
      totalCents: 0,
      amountPaidCents: 0,
      balanceDueCents: 0,
    }),
    'voided',
  )

  // Invoice numbers
  assert.equal(formatInvoiceNumber(2026, 1), 'PTU-2026-001')
  assert.equal(formatInvoiceNumber(2026, 42), 'PTU-2026-042')

  // Atomic sequence update must not conflict on updatedAt
  const fixedNow = new Date('2026-08-03T12:00:00.000Z')
  const atomicUpdate = buildInvoiceSequenceAtomicUpdate(2026, fixedNow)
  assert.equal(atomicUpdate.$inc.lastSequence, 1)
  assert.equal(atomicUpdate.$setOnInsert.year, 2026)
  assert.equal(atomicUpdate.$setOnInsert.createdAt.toISOString(), fixedNow.toISOString())
  assert.equal(atomicUpdate.$set.updatedAt.toISOString(), fixedNow.toISOString())
  assert.equal(
    'updatedAt' in atomicUpdate.$setOnInsert,
    false,
    'updatedAt must not appear in both $set and $setOnInsert',
  )
  const setPaths = new Set([
    ...Object.keys(atomicUpdate.$set),
    ...Object.keys(atomicUpdate.$setOnInsert),
  ])
  assert.equal(setPaths.has('updatedAt'), true)
  assert.equal(setPaths.has('createdAt'), true)
  assert.equal(setPaths.has('year'), true)
  // No overlapping keys across $set / $setOnInsert
  for (const key of Object.keys(atomicUpdate.$set)) {
    assert.equal(
      key in atomicUpdate.$setOnInsert,
      false,
      `path conflict on ${key}`,
    )
  }

  // Tokens
  const token = generateInvoiceToken()
  const hash = hashInvoiceToken(token)
  assert.equal(invoiceTokensMatch(token, hash), true)
  assert.equal(invoiceTokensMatch('nope', hash), false)
  assert.equal(normalizeInvoiceTokenParam('../x'), null)
  assert.ok(normalizeInvoiceTokenParam(token))

  // Public projection safety
  const safeView = {
    invoiceNumber: 'PTU-2026-001',
    clientMemo: 'Thank you',
    business: { name: 'Plate The Umpqua' },
  }
  assertPublicProjectionSafe(safeView)
  assert.ok(PUBLIC_INVOICE_FORBIDDEN_KEYS.includes('internalNotes'))
  assert.throws(() =>
    assertPublicProjectionSafe({ invoiceNumber: 'x', internalNotes: 'secret' }),
  )

  // Square stub
  assert.equal(getSquareConnectionState(), 'not_connected')

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          'currency',
          'discounts',
          'credits',
          'tax',
          'line-billing-types',
          'payments-status',
          'overdue',
          'void-lock',
          'invoice-number-format',
          'invoice-sequence-atomic-update',
          'token-privacy',
          'public-projection',
          'square-not-connected',
        ],
      },
      null,
      2,
    ),
  )
}

main()
