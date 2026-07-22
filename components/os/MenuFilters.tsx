import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  MENU_SORT_OPTIONS,
  MENU_STATUS_LABELS,
  MENU_STATUS_VALUES,
  MENU_VIEW_OPTIONS,
} from '@/lib/os/menus/menuConstants'
import type { MenuListResult } from '@/lib/os/menus/menuQueries'

type Props = {
  result: MenuListResult
}

function hrefFor(result: MenuListResult, page: number) {
  const params = new URLSearchParams()
  const { filters, limit } = result
  if (filters.view !== 'all') params.set('view', filters.view)
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (limit !== 20) params.set('limit', String(limit))
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/os/menus?${qs}` : '/os/menus'
}

export default function MenuFilters({ result }: Props) {
  const { filters } = result

  return (
    <form className={styles.filterBar} method="get" action="/os/menus">
      <label className={styles.fieldLabel} htmlFor="menu-view">
        View
        <select
          id="menu-view"
          name="view"
          className={styles.fieldControl}
          defaultValue={filters.view}
        >
          {MENU_VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="menu-status">
        Status
        <select
          id="menu-status"
          name="status"
          className={styles.fieldControl}
          defaultValue={filters.status || ''}
        >
          <option value="">All statuses</option>
          {MENU_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {MENU_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="menu-sort">
        Sort
        <select
          id="menu-sort"
          name="sort"
          className={styles.fieldControl}
          defaultValue={filters.sort}
        >
          {MENU_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="menu-q">
        Search
        <input
          id="menu-q"
          name="q"
          className={styles.fieldControl}
          defaultValue={filters.q}
          placeholder="Menu or occasion"
          maxLength={80}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.button}>
          Apply filters
        </button>
        <Link href="/os/menus" className={`${styles.button} ${styles.buttonQuiet}`}>
          Clear
        </Link>
      </div>
    </form>
  )
}

export function MenuPagination({ result }: { result: MenuListResult }) {
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
