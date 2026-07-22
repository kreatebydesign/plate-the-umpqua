import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { listInquiries } from '@/lib/os/inquiries/inquiryQueries'
import InquiryFilters, { InquiryPagination } from '@/components/os/InquiryFilters'

export const metadata: Metadata = {
  title: 'Inquiries',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function InquiriesWorkspacePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/inquiries' })
  const params = await searchParams

  const result = await listInquiries(user, {
    pipeline: first(params.pipeline),
    source: first(params.source),
    occasion: first(params.occasion),
    q: first(params.q),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit),
  })

  const hasActiveFilters =
    result.filters.pipeline !== 'open' ||
    Boolean(result.filters.source) ||
    Boolean(result.filters.occasion) ||
    Boolean(result.filters.q) ||
    result.filters.sort !== 'newest'

  return (
    <div>
      <section className={styles.hero} aria-label="Inquiries overview">
        <p className={styles.heroDate}>Hospitality intake pipeline</p>
        <h2 className={styles.heroGreeting}>Inquiries</h2>
        <p className={styles.heroLine}>
          Review private dining requests, partner concierge leads, and community
          partnership conversations. Update operational status here; advanced
          administration remains in Payload Admin.
        </p>
        <div className={styles.actions}>
          <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
            Today at Plate
          </Link>
          {result.canManageInAdmin ? (
            <Link
              href="/admin/collections/inquiries"
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.metrics} aria-label="Pipeline counts">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Open</p>
          <p className={styles.metricValue}>{result.counts.open ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>New</p>
          <p className={styles.metricValue}>{result.counts.new ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Approved</p>
          <p className={styles.metricValue}>{result.counts.approved ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>All</p>
          <p className={styles.metricValue}>{result.counts.all ?? '—'}</p>
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
        <InquiryFilters result={result} />
      </section>

      <section className={styles.panel} aria-labelledby="inquiry-results-title">
        <div className={styles.panelHeader}>
          <h2 id="inquiry-results-title" className={styles.panelTitle}>
            Results
          </h2>
          <p className={styles.panelAction}>
            {result.totalDocs} match{result.totalDocs === 1 ? '' : 'es'}
          </p>
        </div>

        {result.rows.length === 0 ? (
          <p className={styles.empty}>
            {result.page > result.totalPages && result.totalDocs > 0
              ? 'This page is beyond the available results. Return to page 1 or clear filters.'
              : hasActiveFilters
                ? 'No inquiries match these filters. Clear filters to see the open pipeline.'
                : 'No inquiries are in the collection yet. New website and partner requests will appear here.'}
          </p>
        ) : (
          <ul className={styles.inquiryList}>
            {result.rows.map((row) => (
              <li key={row.id} className={styles.inquiryItem}>
                <Link href={row.href} className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>{row.clientName || row.title}</p>
                    <span
                      className={`${styles.statusChip} ${
                        row.needsFollowUp ? styles.statusChipAlert : ''
                      }`}
                    >
                      {row.statusLabel}
                    </span>
                  </div>
                  <p className={styles.listMeta}>
                    {[
                      row.title !== row.clientName ? row.title : null,
                      row.occasionLabel,
                      row.sourceLabel,
                      `Received ${row.receivedLabel}`,
                      row.eventDateLabel ? `Event ${row.eventDateLabel}` : null,
                      row.guestCount != null ? `${row.guestCount} guests` : null,
                      row.clientEmail,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {row.needsFollowUp ? (
                    <p className={styles.followHint}>Follow-up needed</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <InquiryPagination result={result} />
      </section>
    </div>
  )
}
