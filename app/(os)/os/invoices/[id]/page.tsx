import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getInvoiceDetail } from '@/lib/os/invoices/invoiceQueries'
import InvoiceActions from '@/components/os/invoices/InvoiceActions'
import SquareInvoiceActions from '@/components/os/invoices/SquareInvoiceActions'
import { BILLING_TYPE_LABELS, type BillingTypeValue } from '@/lib/os/invoices/invoiceConstants'

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function InvoiceDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await requirePlateOperator({ returnTo: `/os/invoices/${id}` })
  const invoice = await getInvoiceDetail(user, id)
  if (!invoice) notFound()

  return (
    <div className={`${styles.detailLayout} ${styles.invoicePrintRoot}`}>
      <section className={styles.hero} aria-label="Invoice header">
        <p className={styles.heroDate}>
          {invoice.invoiceNumber} · Issued {invoice.issueDateLabel}
        </p>
        <h2 className={styles.heroGreeting}>{invoice.billing.name}</h2>
        <p className={styles.heroLine}>
          {[
            invoice.statusLabel,
            invoice.eventName,
            `Due ${invoice.dueDateLabel}`,
            `Balance ${invoice.balanceDueLabel}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className={`${styles.actions} ${styles.noPrint}`}>
          <Link href="/os/invoices" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to invoices
          </Link>
          {invoice.canEdit ? (
            <Link
              href={`/os/invoices/${invoice.id}/edit`}
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Edit in Plate OS
            </Link>
          ) : null}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Bill to</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Name</dt>
              <dd>{invoice.billing.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${invoice.billing.email}`}>{invoice.billing.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{invoice.billing.phone || '—'}</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>{invoice.billing.company || '—'}</dd>
            </div>
          </dl>
        </section>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Schedule & terms</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Issue date</dt>
              <dd>{invoice.issueDateLabel}</dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>{invoice.dueDateLabel}</dd>
            </div>
            <div>
              <dt>Terms</dt>
              <dd>{invoice.paymentTermsLabel}</dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>
                {invoice.eventId ? (
                  <Link href={`/os/events/${invoice.eventId}`}>{invoice.eventName}</Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Client</dt>
              <dd>
                {invoice.clientId ? (
                  <Link href={`/os/clients/${invoice.clientId}`}>
                    {invoice.clientName || 'Client'}
                  </Link>
                ) : (
                  invoice.clientName || '—'
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Line items</h2>
        <ul className={styles.inquiryList}>
          {invoice.lineItems.map((line) => (
            <li key={line.itemKey} className={styles.inquiryItem}>
              <div className={styles.inquiryLink}>
                <div className={styles.inquiryTop}>
                  <p className={styles.listTitle}>
                    {line.isCredit ? 'Credit · ' : ''}
                    {line.description}
                  </p>
                  <span className={styles.statusChip}>{line.lineTotalLabel}</span>
                </div>
                <p className={styles.listMeta}>
                  {[
                    BILLING_TYPE_LABELS[line.billingType as BillingTypeValue] ||
                      line.billingType,
                    `Qty ${line.quantity}`,
                    line.detail,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <dl className={styles.detailList}>
          <div>
            <dt>Subtotal</dt>
            <dd>{invoice.subtotalLabel}</dd>
          </div>
          <div>
            <dt>Credits</dt>
            <dd>−{invoice.creditLabel}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd>−{invoice.discountLabel}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{invoice.taxLabel}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{invoice.totalLabel}</dd>
          </div>
          <div>
            <dt>Amount paid</dt>
            <dd>{invoice.amountPaidLabel}</dd>
          </div>
          <div>
            <dt>Balance due</dt>
            <dd>{invoice.balanceDueLabel}</dd>
          </div>
          {invoice.depositRequiredCents > 0 ? (
            <div>
              <dt>Deposit required</dt>
              <dd>{invoice.depositRequiredLabel}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {invoice.clientMemo ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Client memo</h2>
          <p className={styles.visionCopy}>{invoice.clientMemo}</p>
        </section>
      ) : null}

      {invoice.internalNotes ? (
        <section className={`${styles.panelSensitive} ${styles.noPrint}`}>
          <h2 className={styles.panelTitle}>Internal notes</h2>
          <p className={styles.fieldHint}>Staff only — never shown on the client invoice.</p>
          <p className={styles.visionCopy}>{invoice.internalNotes}</p>
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Payments</h2>
        {invoice.payments.length === 0 ? (
          <p className={styles.empty}>No payments recorded yet.</p>
        ) : (
          <ul className={styles.inquiryList}>
            {invoice.payments.map((payment) => (
              <li key={payment.id} className={styles.inquiryItem}>
                <div className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>{payment.amountLabel}</p>
                    <span className={styles.statusChip}>{payment.methodLabel}</span>
                  </div>
                  <p className={styles.listMeta}>
                    {[payment.paidAtLabel, payment.reference].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${styles.panel} ${styles.noPrint}`}>
        <h2 className={styles.panelTitle}>Square Payment</h2>
        <SquareInvoiceActions
          invoiceId={invoice.id}
          squareInvoiceId={invoice.squareInvoiceId}
          squarePublicUrl={invoice.squarePublicUrl}
          squareStatus={invoice.squareStatus}
          squareLastSyncedAt={invoice.squareLastSyncedAt}
          squareLastError={invoice.squareLastError}
          squareState={invoice.squareState}
          canManage={invoice.canManage}
          status={String(invoice.status)}
        />
      </section>

      <div className={styles.noPrint}>
        <InvoiceActions
          invoiceId={invoice.id}
          status={String(invoice.status)}
          billToEmail={invoice.billing.email}
          publicLink={invoice.publicLink}
          canEdit={invoice.canEdit}
          canRecordPayment={invoice.canRecordPayment}
          canManage={invoice.canManage}
        />
      </div>
    </div>
  )
}
