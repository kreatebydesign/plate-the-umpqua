import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { listClients } from '@/lib/os/clients/clientQueries'
import ClientFilters, { ClientPagination } from '@/components/os/ClientFilters'

export const metadata: Metadata = {
  title: 'Clients',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function ClientsWorkspacePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/clients' })
  const params = await searchParams

  const result = await listClients(user, {
    view: first(params.view),
    type: first(params.type),
    vip: first(params.vip),
    q: first(params.q),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit),
  })

  const hasActiveFilters =
    result.filters.view !== 'all' ||
    Boolean(result.filters.type) ||
    Boolean(result.filters.vip) ||
    Boolean(result.filters.q) ||
    result.filters.sort !== 'newest'

  return (
    <div>
      <section className={styles.hero} aria-label="Clients overview">
        <p className={styles.heroDate}>Relationship workspace</p>
        <h2 className={styles.heroGreeting}>Clients</h2>
        <p className={styles.heroLine}>
          People and partners behind Plate experiences—contact, inquiry history,
          and upcoming hospitality. Private notes and advanced edits stay in
          Payload Admin.
        </p>
        <div className={styles.actions}>
          <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
            Today at Plate
          </Link>
          {result.canManageInAdmin ? (
            <Link
              href="/admin/collections/clients"
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.metrics} aria-label="Client counts">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Total clients</p>
          <p className={styles.metricValue}>{result.counts.total ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Open inquiries</p>
          <p className={styles.metricValue}>
            {result.counts.withOpenInquiries ?? '—'}
          </p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Upcoming events</p>
          <p className={styles.metricValue}>
            {result.counts.withUpcomingEvents ?? '—'}
          </p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Needs attention</p>
          <p className={styles.metricValue}>{result.counts.attention ?? '—'}</p>
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
        <ClientFilters result={result} />
      </section>

      <section className={styles.panel} aria-labelledby="client-results-title">
        <div className={styles.panelHeader}>
          <h2 id="client-results-title" className={styles.panelTitle}>
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
                ? 'No clients match these filters. Clear filters to see all relationships.'
                : 'No client records are available yet. New hospitality contacts will appear here.'}
          </p>
        ) : (
          <ul className={styles.inquiryList}>
            {result.rows.map((row) => (
              <li key={row.id} className={styles.inquiryItem}>
                <Link href={row.href} className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>{row.fullName}</p>
                    <span
                      className={`${styles.statusChip} ${
                        row.needsAttention ? styles.statusChipAlert : ''
                      }`}
                    >
                      {row.clientTypeLabel}
                    </span>
                  </div>
                  <p className={styles.listMeta}>
                    {[
                      row.email,
                      row.phone,
                      row.vipStatusLabel,
                      row.hasUpcomingEvent ? 'Upcoming event' : null,
                      row.hasOpenInquiry ? 'Open inquiry' : null,
                      row.updatedLabel !== '—'
                        ? `Updated ${row.updatedLabel}`
                        : null,
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

        <ClientPagination result={result} />
      </section>
    </div>
  )
}
