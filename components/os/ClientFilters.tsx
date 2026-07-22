import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  CLIENT_SORT_OPTIONS,
  CLIENT_TYPE_LABELS,
  CLIENT_TYPE_VALUES,
  CLIENT_VIEW_OPTIONS,
  CLIENT_VIP_LABELS,
  CLIENT_VIP_VALUES,
} from '@/lib/os/clients/clientConstants'
import { buildClientListHref } from '@/lib/os/clients/clientQueries'
import type { ClientListResult } from '@/lib/os/clients/clientQueries'

type Props = {
  result: ClientListResult
}

export default function ClientFilters({ result }: Props) {
  const { filters } = result

  return (
    <form className={styles.filterBar} method="get" action="/os/clients">
      <label className={styles.fieldLabel} htmlFor="view">
        View
        <select
          id="view"
          name="view"
          className={styles.fieldControl}
          defaultValue={filters.view}
        >
          {CLIENT_VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="type">
        Client type
        <select
          id="type"
          name="type"
          className={styles.fieldControl}
          defaultValue={filters.type || ''}
        >
          <option value="">All types</option>
          {CLIENT_TYPE_VALUES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="vip">
        Relationship
        <select
          id="vip"
          name="vip"
          className={styles.fieldControl}
          defaultValue={filters.vip || ''}
        >
          <option value="">All levels</option>
          {CLIENT_VIP_VALUES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_VIP_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="sort">
        Sort
        <select
          id="sort"
          name="sort"
          className={styles.fieldControl}
          defaultValue={filters.sort}
        >
          {CLIENT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="q">
        Search
        <input
          id="q"
          name="q"
          type="search"
          className={styles.fieldControl}
          defaultValue={filters.q}
          placeholder="Name, email, or phone"
          maxLength={80}
          autoComplete="off"
        />
      </label>

      <div className={styles.filterActions}>
        <button type="submit" className={styles.button}>
          Apply
        </button>
        <Link href="/os/clients" className={`${styles.button} ${styles.buttonQuiet}`}>
          Clear
        </Link>
      </div>
    </form>
  )
}

export function ClientPagination({ result }: { result: ClientListResult }) {
  const { page, totalPages, filters } = result
  if (totalPages <= 1) return null

  const prev =
    page > 1
      ? buildClientListHref({
          view: filters.view,
          type: filters.type,
          vip: filters.vip,
          q: filters.q,
          sort: filters.sort,
          page: page - 1,
        })
      : null
  const next =
    page < totalPages
      ? buildClientListHref({
          view: filters.view,
          type: filters.type,
          vip: filters.vip,
          q: filters.q,
          sort: filters.sort,
          page: page + 1,
        })
      : null

  return (
    <nav className={styles.pagination} aria-label="Client pages">
      {prev ? (
        <Link href={prev} className={`${styles.button} ${styles.buttonQuiet}`}>
          Previous
        </Link>
      ) : (
        <span className={styles.paginationDisabled}>Previous</span>
      )}
      <p className={styles.paginationStatus}>
        Page {page} of {totalPages}
      </p>
      {next ? (
        <Link href={next} className={`${styles.button} ${styles.buttonQuiet}`}>
          Next
        </Link>
      ) : (
        <span className={styles.paginationDisabled}>Next</span>
      )}
    </nav>
  )
}
