import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  RECIPE_CATEGORY_LABELS,
  RECIPE_CATEGORY_VALUES,
  RECIPE_SORT_OPTIONS,
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_VALUES,
  RECIPE_VIEW_OPTIONS,
} from '@/lib/os/recipes/recipeConstants'
import type { RecipeListResult } from '@/lib/os/recipes/recipeQueries'

type Props = {
  result: RecipeListResult
}

function hrefFor(result: RecipeListResult, page: number) {
  const params = new URLSearchParams()
  const { filters, limit } = result
  if (filters.view !== 'all') params.set('view', filters.view)
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.q) params.set('q', filters.q)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (limit !== 20) params.set('limit', String(limit))
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/os/recipes?${qs}` : '/os/recipes'
}

export default function RecipeFilters({ result }: Props) {
  const { filters } = result

  return (
    <form className={styles.filterBar} method="get" action="/os/recipes">
      <label className={styles.fieldLabel} htmlFor="recipe-view">
        View
        <select
          id="recipe-view"
          name="view"
          className={styles.fieldControl}
          defaultValue={filters.view}
        >
          {RECIPE_VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="recipe-status">
        Status
        <select
          id="recipe-status"
          name="status"
          className={styles.fieldControl}
          defaultValue={filters.status || ''}
        >
          <option value="">All statuses</option>
          {RECIPE_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {RECIPE_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="recipe-category">
        Category
        <select
          id="recipe-category"
          name="category"
          className={styles.fieldControl}
          defaultValue={filters.category || ''}
        >
          <option value="">All categories</option>
          {RECIPE_CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {RECIPE_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="recipe-sort">
        Sort
        <select
          id="recipe-sort"
          name="sort"
          className={styles.fieldControl}
          defaultValue={filters.sort}
        >
          {RECIPE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="recipe-q">
        Search
        <input
          id="recipe-q"
          name="q"
          className={styles.fieldControl}
          defaultValue={filters.q}
          placeholder="Recipe name"
          maxLength={80}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.button}>
          Apply filters
        </button>
        <Link href="/os/recipes" className={`${styles.button} ${styles.buttonQuiet}`}>
          Clear
        </Link>
      </div>
    </form>
  )
}

export function RecipePagination({ result }: { result: RecipeListResult }) {
  const { page, totalPages, hasNextPage, hasPrevPage, totalDocs } = result
  return (
    <div className={styles.pagination}>
      <p className={styles.paginationStatus}>
        Page {page} of {Math.max(totalPages, 1)} · {totalDocs} total
      </p>
      <div className={styles.actions}>
        {hasPrevPage ? (
          <Link href={hrefFor(result, page - 1)} className={styles.button}>
            Previous
          </Link>
        ) : (
          <span className={styles.paginationDisabled}>Previous</span>
        )}
        {hasNextPage ? (
          <Link href={hrefFor(result, page + 1)} className={styles.button}>
            Next
          </Link>
        ) : (
          <span className={styles.paginationDisabled}>Next</span>
        )}
      </div>
    </div>
  )
}
