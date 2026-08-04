/**
 * Local PDF smoke render for invoice document QA.
 * Run: npx tsx scripts/smoke-invoice-pdf.ts
 */
import { writeFileSync } from 'node:fs'
import { buildInvoiceDocumentModel } from '../lib/os/invoices/invoiceDocumentModel'
import { renderInvoicePdfBuffer } from '../lib/os/invoices/invoicePdf'

async function main() {
  const short = buildInvoiceDocumentModel({
    invoiceNumber: 'PTU-2026-QA1',
    status: 'sent',
    issueDate: '2026-08-03T00:00:00.000Z',
    dueDate: '2026-08-17T00:00:00.000Z',
    paymentTerms: 'net14',
    billing: {
      name: 'QA Client',
      email: 'qa@example.com',
      phone: '5415551212',
      company: 'QA Co',
    },
    lineItems: [
      {
        description: 'Private dinner',
        detail: 'Seasonal menu',
        billingType: 'perEvent',
        quantity: 1,
        unitPriceCents: 250000,
        lineTotalCents: 250000,
        isCredit: false,
      },
      {
        description: 'Client food credit',
        billingType: 'flat',
        quantity: 1,
        unitPriceCents: 25000,
        lineTotalCents: -25000,
        isCredit: true,
      },
    ],
    subtotalCents: 250000,
    creditCents: 25000,
    discountCents: 0,
    taxCents: 0,
    totalCents: 225000,
    amountPaidCents: 0,
    balanceDueCents: 225000,
    depositRequiredCents: 20000,
    clientMemo: 'Thank you for celebrating with us.',
  })

  const buf = await renderInvoicePdfBuffer(short)
  writeFileSync('/tmp/ptu-invoice-qa-short.pdf', buf)
  console.log(
    JSON.stringify({
      ok: true,
      bytes: buf.length,
      pdfHeader: buf.slice(0, 5).toString(),
      depositDue: short.cents.depositDueNow,
      amountDueCaption: short.amountDueNowCaption,
      clientStatus: short.clientStatusLabel,
      wordmark: short.business.name,
      hasLogoPath: JSON.stringify(short).includes('logo'),
    }),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
