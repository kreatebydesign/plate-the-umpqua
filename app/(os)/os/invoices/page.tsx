import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { listInvoices } from '@/lib/os/invoices/invoiceQueries'
import InvoiceFilters, { InvoicePagination } from '@/components/os/invoices/InvoiceFilters'

export const metadata: Metadata = {
  title: 'Invoices',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/invoices' })
  const params = await searchParams
  const result = await listInvoices(user, {
    status: first(params.status),
    q: first(params.q),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit),
  })

  const hasFilters =
    result.filters.status !== 'all' ||
    Boolean(result.filters.q) ||
    result.filters.sort !== 'newest'

  return (
    <div>
      <section className={styles.hero} aria-label="Invoices overview">
        <p className={styles.heroDate}>Hospitality billing</p>
        <h2 className={styles.heroGreeting}>Invoices</h2>
        <p className={styles.heroLine}>
          Create flat-fee, per-guest, hourly, and credit-aware invoices for Plate The
          Umpqua events. Square payment links can be added once credentials are connected.
        </p>
        <div className={styles.actions}>
          <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
            Today at Plate
          </Link>
          {result.canManage ? (
            <Link href="/os/invoices/new" className={styles.button}>
              Create invoice
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.metrics} aria-label="Invoice counts">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>All</p>
          <p className={styles.metricValue}>{result.counts.all ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Draft</p>
          <p className={styles.metricValue}>{result.counts.draft ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Overdue</p>
          <p className={styles.metricValue}>{result.counts.overdue ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Paid</p>
          <p className={styles.metricValue}>{result.counts.paid ?? '—'}</p>
        </div>
      </section>

      {result.errors.length > 0 ? (
        <div className={styles.panel} style={{ marginBottom: '1rem' }}>
          {result.errors.map((error) => (
            <p key={error} className={styles.sectionError}>
              {error}
            </p>
          ))}
        </div>
      ) : null}

      <section className={styles.panel} aria-label="Filters">
        <InvoiceFilters result={result} />
      </section>

      <section className={styles.panel} aria-labelledby="invoice-results-title">
        <div className={styles.panelHeader}>
          <h2 id="invoice-results-title" className={styles.panelTitle}>
            Results
          </h2>
          <p className={styles.panelAction}>
            {result.totalDocs} match{result.totalDocs === 1 ? '' : 'es'}
          </p>
        </div>

        {result.rows.length === 0 ? (
          <p className={styles.empty}>
            {hasFilters
              ? 'No invoices match these filters.'
              : 'No invoices yet. Create the first draft when you are ready to bill a hospitality date.'}
          </p>
        ) : (
          <ul className={styles.inquiryList}>
            {result.rows.map((row) => (
              <li key={row.id} className={styles.inquiryItem}>
                <Link href={row.href} className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>
                      {row.invoiceNumber}
                      {row.clientName ? ` · ${row.clientName}` : ''}
                    </p>
                    <span className={styles.statusChip}>{row.statusLabel}</span>
                  </div>
                  <p className={styles.listMeta}>
                    {[
                      row.partnerConciergeLabel,
                      row.eventName,
                      `Issued ${row.issueDateLabel}`,
                      `Due ${row.dueDateLabel}`,
                      `Total ${row.totalLabel}`,
                      `Paid ${row.amountPaidLabel}`,
                      `Balance ${row.balanceDueLabel}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <InvoicePagination result={result} />
      </section>
    </div>
  )
}
