import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { listRecipes } from '@/lib/os/recipes/recipeQueries'
import RecipeFilters, { RecipePagination } from '@/components/os/RecipeFilters'

export const metadata: Metadata = {
  title: 'Recipes',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function RecipesWorkspacePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/recipes' })
  const params = await searchParams

  const result = await listRecipes(user, {
    view: first(params.view),
    status: first(params.status),
    category: first(params.category),
    q: first(params.q),
    sort: first(params.sort),
    page: first(params.page),
    limit: first(params.limit),
  })

  return (
    <div>
      <section className={styles.hero} aria-label="Recipes overview">
        <p className={styles.heroDate}>Culinary library</p>
        <h2 className={styles.heroGreeting}>Recipes</h2>
        <p className={styles.heroLine}>
          Save and organize dishes for private dining menus. Recipes stay private by
          default until marked menu-ready or publishing-candidate.
        </p>
        <div className={styles.actions}>
          {result.canWrite ? (
            <Link href="/os/recipes/new" className={styles.button}>
              Add recipe
            </Link>
          ) : null}
          {result.canManageInAdmin ? (
            <Link
              href="/admin/collections/recipes"
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.metrics} aria-label="Recipe counts">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Total</p>
          <p className={styles.metricValue}>{result.counts.total ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Menu-ready</p>
          <p className={styles.metricValue}>{result.counts.menuReady ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Publishing</p>
          <p className={styles.metricValue}>{result.counts.publishing ?? '—'}</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Archived</p>
          <p className={styles.metricValue}>{result.counts.archived ?? '—'}</p>
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
        <RecipeFilters result={result} />
      </section>

      <section className={styles.panel} aria-labelledby="recipe-results-title">
        <div className={styles.panelHeader}>
          <h2 id="recipe-results-title" className={styles.panelTitle}>
            Results
          </h2>
          <p className={styles.panelAction}>
            {result.totalDocs} match{result.totalDocs === 1 ? '' : 'es'}
          </p>
        </div>

        {result.rows.length === 0 ? (
          <p className={styles.empty}>
            No recipes match these filters. Create a recipe to begin the culinary
            library, or clear filters to see everything.
          </p>
        ) : (
          <ul className={styles.inquiryList}>
            {result.rows.map((row) => (
              <li key={row.id} className={styles.inquiryItem}>
                <Link href={row.href} className={styles.inquiryLink}>
                  <div className={styles.inquiryTop}>
                    <p className={styles.listTitle}>{row.name}</p>
                    <span className={styles.statusChip}>{row.statusLabel}</span>
                  </div>
                  <p className={styles.listMeta}>
                    {row.categoryLabel} · {row.visibilityLabel} · Updated{' '}
                    {row.updatedLabel}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <RecipePagination result={result} />
      </section>
    </div>
  )
}
