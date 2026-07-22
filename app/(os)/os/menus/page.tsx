import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import MenuFilters, { MenuPagination } from '@/components/os/MenuFilters'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { listMenus } from '@/lib/os/menus/menuQueries'

export const metadata: Metadata = {
  title: 'Menus',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function MenusWorkspacePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  const params = await searchParams

  const result = await listMenus(user, {
    view: first(params.view),
    status: first(params.status),
    q: first(params.q),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit),
  })

  return (
    <div>
      <section className={styles.hero} aria-label="Menus overview">
        <p className={styles.heroDate}>Client presentations</p>
        <h2 className={styles.heroGreeting}>Menus</h2>
        <p className={styles.heroLine}>
          Compose Plate-branded private dining menus, preview the client experience,
          and send a secure review link when ready.
        </p>
        <div className={styles.actions}>
          {result.canWrite ? (
            <Link href="/os/menus/new" className={styles.button}>
              New menu
            </Link>
          ) : null}
          <Link href="/os/recipes" className={`${styles.button} ${styles.buttonQuiet}`}>
            Recipe library
          </Link>
          {result.canManageInAdmin ? (
            <Link
              href="/admin/collections/menus"
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.metrics} aria-label="Menu counts">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Total</p>
          <p className={styles.metricValue}>{result.counts.total ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Drafts</p>
          <p className={styles.metricValue}>{result.counts.draft ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>In review</p>
          <p className={styles.metricValue}>{result.counts.inReview ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Approved</p>
          <p className={styles.metricValue}>{result.counts.approved ?? '—'}</p>
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
        <MenuFilters result={result} />
      </section>

      <section className={styles.panel} aria-labelledby="menu-results-title">
        <div className={styles.panelHeader}>
          <h2 id="menu-results-title" className={styles.panelTitle}>
            Results
          </h2>
          <p className={styles.panelAction}>
            {result.totalDocs} match{result.totalDocs === 1 ? '' : 'es'}
          </p>
        </div>

        {result.rows.length === 0 ? (
          <p className={styles.empty}>
            No menus match these filters. Start a new menu for a client, or clear
            filters to see the full list.
          </p>
        ) : (
          <ul className={styles.inquiryList}>
            {result.rows.map((row) => (
              <li key={row.id} className={styles.inquiryItem}>
                <Link href={row.href} className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>{row.internalName}</p>
                    <span className={styles.statusChip}>{row.statusLabel}</span>
                  </div>
                  <p className={styles.listMeta}>
                    {row.occasionTitle}
                    {row.clientName ? ` · ${row.clientName}` : ''}
                    {` · v${row.version}`}
                    {` · ${row.serviceDateLabel}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <MenuPagination result={result} />
      </section>
    </div>
  )
}
