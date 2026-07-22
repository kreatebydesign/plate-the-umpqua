import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { listEvents } from '@/lib/os/events/eventQueries'
import EventFilters, { EventPagination } from '@/components/os/EventFilters'

export const metadata: Metadata = {
  title: 'Events',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function EventsWorkspacePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/events' })
  const params = await searchParams

  const result = await listEvents(user, {
    pipeline: first(params.pipeline),
    status: first(params.status),
    q: first(params.q),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit),
  })

  const hasActiveFilters =
    result.filters.pipeline !== 'upcoming' ||
    Boolean(result.filters.status) ||
    Boolean(result.filters.q) ||
    result.filters.sort !== 'soonest'

  return (
    <div>
      <section className={styles.hero} aria-label="Events overview">
        <p className={styles.heroDate}>Hospitality calendar</p>
        <h2 className={styles.heroGreeting}>Events</h2>
        <p className={styles.heroLine}>
          Confirmed private dinners and hospitality dates—status, guests, venues,
          and day-of readiness. Advanced editing remains in Payload Admin.
        </p>
        <div className={styles.actions}>
          <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
            Today at Plate
          </Link>
          {result.canManageInAdmin ? (
            <Link
              href="/admin/collections/events"
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.metrics} aria-label="Event counts">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Today</p>
          <p className={styles.metricValue}>{result.counts.today ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Upcoming</p>
          <p className={styles.metricValue}>{result.counts.upcoming ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Needs attention</p>
          <p className={styles.metricValue}>{result.counts.attention ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Completed</p>
          <p className={styles.metricValue}>{result.counts.completed ?? '—'}</p>
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
        <EventFilters result={result} />
      </section>

      <section className={styles.panel} aria-labelledby="event-results-title">
        <div className={styles.panelHeader}>
          <h2 id="event-results-title" className={styles.panelTitle}>
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
                ? 'No events match these filters. Clear filters to see upcoming hospitality dates.'
                : 'No upcoming active events are on the calendar yet. Confirmed dates will appear here.'}
          </p>
        ) : (
          <ul className={styles.inquiryList}>
            {result.rows.map((row) => (
              <li key={row.id} className={styles.inquiryItem}>
                <Link href={row.href} className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>{row.name}</p>
                    <span
                      className={`${styles.statusChip} ${
                        row.needsAttention ? styles.statusChipAlert : ''
                      }`}
                    >
                      {row.statusLabel}
                    </span>
                  </div>
                  <p className={styles.listMeta}>
                    {[
                      row.dateLabel,
                      row.clientName,
                      row.venueName,
                      row.packageName,
                      row.guestCount != null ? `${row.guestCount} guests` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {row.needsAttention && row.attentionReason ? (
                    <p className={styles.followHint}>{row.attentionReason}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <EventPagination result={result} />
      </section>
    </div>
  )
}
