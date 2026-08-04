import type { InvoiceDocumentModel } from '@/lib/os/invoices/invoiceDocumentModel'
import styles from './invoice-document.module.css'

type Props = {
  invoice: InvoiceDocumentModel
  /** When true, hide on-screen chrome (browser print / dedicated print route). */
  printMode?: boolean
  token?: string
}

/**
 * Dedicated client invoice document.
 * Typography-only Plate The Umpqua wordmark (Cormorant Garamond) — no logo images.
 */
export default function InvoiceDocument({ invoice, printMode = false, token }: Props) {
  const pdfHref = token ? `/api/invoice/${encodeURIComponent(token)}/pdf` : null

  return (
    <div className={`${styles.docRoot} ${printMode ? styles.printMode : ''}`}>
      {!printMode ? (
        <div className={styles.toolbar} data-print-hide>
          <div className={styles.toolbarCopy}>
            <p className={styles.toolbarTitle}>Your invoice</p>
            <p className={styles.toolbarHint}>
              For the cleanest PDF, use Download PDF — or Print and turn off browser headers
              and footers in the print dialog.
            </p>
          </div>
          <div className={styles.toolbarActions}>
            {pdfHref ? (
              <a className={styles.toolbarButton} href={pdfHref}>
                Download PDF
              </a>
            ) : null}
            <button
              type="button"
              className={`${styles.toolbarButton} ${styles.toolbarButtonQuiet}`}
              id="invoice-print-trigger"
            >
              Print / Save PDF
            </button>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `document.getElementById('invoice-print-trigger')?.addEventListener('click',function(e){e.preventDefault();window.print();});`,
            }}
          />
        </div>
      ) : null}

      <article className={styles.sheet} aria-label={`Invoice ${invoice.invoiceNumber}`}>
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <p className={styles.wordmark}>{invoice.business.name}</p>
            <p className={styles.businessMeta}>
              {invoice.business.address ? (
                <>
                  {invoice.business.address}
                  <br />
                </>
              ) : null}
              {invoice.business.region}
              <br />
              {invoice.business.email}
              {invoice.business.phone ? (
                <>
                  <br />
                  {invoice.business.phone}
                </>
              ) : null}
              <br />
              {invoice.business.website}
            </p>
          </div>
          <div className={styles.invoiceMeta}>
            <p className={styles.invoiceLabel}>Invoice</p>
            <p className={styles.invoiceNumber}>{invoice.invoiceNumber}</p>
            <dl className={styles.metaList}>
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
              {invoice.clientStatusLabel ? (
                <div>
                  <dt>Status</dt>
                  <dd>{invoice.clientStatusLabel}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <section className={styles.parties}>
          <div>
            <h2 className={styles.sectionLabel}>Bill to</h2>
            <p className={styles.partyCopy}>
              <strong>{invoice.billTo.name}</strong>
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
          <div>
            <h2 className={styles.sectionLabel}>Event & terms</h2>
            <p className={styles.partyCopy}>
              {invoice.event.name ? (
                <>
                  <strong>{invoice.event.name}</strong>
                  <br />
                </>
              ) : (
                <strong>Private hospitality</strong>
              )}
              {invoice.event.dateLabel ? (
                <>
                  {invoice.event.dateLabel}
                  <br />
                </>
              ) : null}
              {invoice.event.venue ? (
                <>
                  {invoice.event.venue}
                  <br />
                </>
              ) : null}
              {invoice.event.guestCount ? (
                <>
                  {invoice.event.guestCount} guests
                  <br />
                </>
              ) : null}
              Payment terms: {invoice.paymentTermsLabel}
            </p>
          </div>
        </section>

        <section className={styles.dueBanner} aria-label="Amount due">
          <div>
            <p className={styles.dueCaption}>{invoice.amountDueNowCaption}</p>
            <p className={styles.dueAmount}>{invoice.amountDueNowLabel}</p>
          </div>
          {invoice.cents.depositRequired > 0 && invoice.cents.depositDueNow > 0 ? (
            <p className={styles.dueNote}>
              Total invoice {invoice.totalsRows.find((r) => r.key === 'total')?.valueLabel}. Deposit
              due now does not replace the remaining balance after the deposit is paid.
            </p>
          ) : null}
        </section>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colDesc}>Description</th>
              <th className={styles.colBasis}>Basis</th>
              <th className={styles.colQty}>Qty</th>
              <th className={styles.colRate}>Rate</th>
              <th className={styles.colAmt}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={`${line.description}-${index}`} className={line.isCredit ? styles.creditRow : undefined}>
                <td>
                  <span className={styles.lineTitle}>
                    {line.isCredit ? 'Credit · ' : ''}
                    {line.description}
                  </span>
                  {line.detail ? <span className={styles.lineDetail}>{line.detail}</span> : null}
                </td>
                <td>{line.billingTypeLabel}</td>
                <td>{line.quantityLabel}</td>
                <td>{line.unitPriceLabel}</td>
                <td>{line.lineTotalLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totalsWrap}>
          <div className={styles.totalsPanel}>
            {invoice.totalsRows.map((row) => (
              <div
                key={row.key}
                className={[
                  styles.totalsRow,
                  row.emphasis === 'strong' ? styles.totalsStrong : '',
                  row.emphasis === 'due' ? styles.totalsDue : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span>{row.label}</span>
                <span>{row.valueLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {invoice.clientMemo ? (
          <section className={styles.memo}>
            <h2 className={styles.sectionLabel}>Notes</h2>
            <p>{invoice.clientMemo}</p>
          </section>
        ) : null}

        {invoice.squarePaymentUrl ? (
          <section className={styles.payBlock} data-print-hide>
            <a className={styles.payButton} href={invoice.squarePaymentUrl}>
              Pay securely with Square
            </a>
            <p className={styles.payHint}>
              You will complete payment on Square’s secure hosted page. Card details are never
              collected on this site.
            </p>
          </section>
        ) : (
          <section className={styles.payBlock}>
            <h2 className={styles.sectionLabel}>Payment</h2>
            <p className={styles.partyCopy}>
              Please arrange payment with Plate The Umpqua using the instructions provided, or reply
              to {invoice.business.email}.
            </p>
          </section>
        )}

        <footer className={styles.footer}>
          <p className={styles.footerWordmark}>{invoice.business.name}</p>
          <p className={styles.footerThanks}>{invoice.thankYou}</p>
          <p className={styles.footerMeta}>
            {invoice.business.email}
            {invoice.business.phone ? ` · ${invoice.business.phone}` : ''}
            {' · '}
            {invoice.business.website}
          </p>
        </footer>
      </article>
    </div>
  )
}
