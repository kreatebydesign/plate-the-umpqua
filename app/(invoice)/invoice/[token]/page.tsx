import type { Metadata } from 'next'
import { headers } from 'next/headers'
import styles from '../../invoice.module.css'
import { lookupPublicInvoice } from '@/lib/os/invoices/publicInvoice'
import {
  getInvoiceClientKey,
  isInvoiceViewRateLimited,
} from '@/lib/os/invoices/invoiceRateLimit'

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ token: string }>

export default async function PublicInvoicePage({ params }: { params: Params }) {
  const { token } = await params
  const hdrs = await headers()
  const fakeReq = new Request('https://platetheumpqua.com/invoice', {
    headers: hdrs,
  })
  const clientKey = getInvoiceClientKey(fakeReq)
  if (isInvoiceViewRateLimited(clientKey)) {
    return (
      <main className={styles.page}>
        <p className={styles.brand}>Plate The Umpqua</p>
        <div className={styles.stateCard} role="status">
          <h1 className={styles.stateTitle}>Please try again shortly</h1>
          <p className={styles.stateCopy}>
            Too many invoice views were requested from this network. Wait a few minutes
            and open the link again.
          </p>
        </div>
      </main>
    )
  }

  const result = await lookupPublicInvoice(token)

  if (result.state !== 'valid' || !result.view) {
    const copy =
      result.state === 'voided'
        ? {
            title: 'This invoice is no longer active',
            body: 'This invoice has been voided. Please contact Plate The Umpqua if you need a replacement.',
          }
        : {
            title: 'This invoice link is not available',
            body: 'The secure invoice link is invalid or no longer available. Please contact Plate The Umpqua for a new link.',
          }
    return (
      <main className={styles.page}>
        <p className={styles.brand}>Plate The Umpqua</p>
        <div className={styles.stateCard} role="status">
          <h1 className={styles.stateTitle}>{copy.title}</h1>
          <p className={styles.stateCopy}>{copy.body}</p>
        </div>
        <p className={styles.footer}>Private hospitality · Roseburg & the Umpqua Valley</p>
      </main>
    )
  }

  const invoice = result.view

  return (
    <main className={styles.page}>
      <p className={styles.brand}>{invoice.business.name}</p>
      <div className={styles.actions}>
        <a className={styles.button} href="#print" id="print-trigger">
          Print / Save PDF
        </a>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-trigger')?.addEventListener('click',function(e){e.preventDefault();window.print();});`,
        }}
      />

      <article className={styles.shell} aria-label="Invoice">
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>{invoice.invoiceNumber}</h1>
            <p className={styles.meta}>
              Issued {invoice.issueDateLabel} · Due {invoice.dueDateLabel} ·{' '}
              {invoice.paymentTermsLabel}
            </p>
          </div>
          <p className={styles.balance}>
            <span className={styles.balanceLabel}>Balance due</span>
            {invoice.balanceDueLabel}
          </p>
        </div>

        <div className={styles.grid}>
          <div>
            <p className={styles.blockTitle}>From</p>
            <p className={styles.blockCopy}>
              {invoice.business.name}
              <br />
              {invoice.business.region}
              <br />
              {invoice.business.email}
            </p>
          </div>
          <div>
            <p className={styles.blockTitle}>Bill to</p>
            <p className={styles.blockCopy}>
              {invoice.billTo.name}
              {invoice.billTo.company ? (
                <>
                  <br />
                  {invoice.billTo.company}
                </>
              ) : null}
              <br />
              {invoice.billTo.email}
              {invoice.billTo.phone ? (
                <>
                  <br />
                  {invoice.billTo.phone}
                </>
              ) : null}
            </p>
          </div>
        </div>

        {invoice.event.name ? (
          <div style={{ marginBottom: '1.25rem' }}>
            <p className={styles.blockTitle}>Event</p>
            <p className={styles.blockCopy}>
              {invoice.event.name}
              {invoice.event.dateLabel ? ` · ${invoice.event.dateLabel}` : ''}
            </p>
          </div>
        ) : null}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={`${line.description}-${index}`}>
                <td>
                  {line.isCredit ? 'Credit · ' : ''}
                  {line.description}
                  {line.detail ? (
                    <>
                      <br />
                      <span style={{ color: '#6f675d' }}>{line.detail}</span>
                    </>
                  ) : null}
                </td>
                <td>{line.billingTypeLabel}</td>
                <td>{line.quantity}</td>
                <td>{line.lineTotalLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalsRow}>
            <span>Subtotal</span>
            <span>{invoice.subtotalLabel}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Credits</span>
            <span>−{invoice.creditLabel}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Discount</span>
            <span>−{invoice.discountLabel}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Tax</span>
            <span>{invoice.taxLabel}</span>
          </div>
          <div className={styles.totalsRowStrong}>
            <span>Total</span>
            <span>{invoice.totalLabel}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Amount paid</span>
            <span>{invoice.amountPaidLabel}</span>
          </div>
          <div className={styles.totalsRowStrong}>
            <span>Balance due</span>
            <span>{invoice.balanceDueLabel}</span>
          </div>
          {invoice.depositRequiredLabel ? (
            <div className={styles.totalsRow}>
              <span>Deposit required</span>
              <span>{invoice.depositRequiredLabel}</span>
            </div>
          ) : null}
        </div>

        {invoice.clientMemo ? (
          <p className={styles.memo}>{invoice.clientMemo}</p>
        ) : null}
      </article>

      <p className={styles.footer}>
        Thank you for choosing Plate The Umpqua · {invoice.business.email}
      </p>
    </main>
  )
}
