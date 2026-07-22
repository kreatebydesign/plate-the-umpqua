import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  EVENT_PIPELINE_OPTIONS,
  EVENT_SORT_OPTIONS,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VALUES,
} from '@/lib/os/events/eventConstants'
import { buildEventListHref } from '@/lib/os/events/eventQueries'
import type { EventListResult } from '@/lib/os/events/eventQueries'

type Props = {
  result: EventListResult
}

export default function EventFilters({ result }: Props) {
  const { filters } = result

  return (
    <form className={styles.filterBar} method="get" action="/os/events">
      <label className={styles.fieldLabel} htmlFor="pipeline">
        View
        <select
          id="pipeline"
          name="pipeline"
          className={styles.fieldControl}
          defaultValue={filters.pipeline}
        >
          {EVENT_PIPELINE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="status">
        Status
        <select
          id="status"
          name="status"
          className={styles.fieldControl}
          defaultValue={filters.status || ''}
        >
          <option value="">All statuses</option>
          {EVENT_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {EVENT_STATUS_LABELS[value]}
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
          {EVENT_SORT_OPTIONS.map((option) => (
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
          placeholder="Event or client name"
          maxLength={80}
          autoComplete="off"
        />
      </label>

      <div className={styles.filterActions}>
        <button type="submit" className={styles.button}>
          Apply
        </button>
        <Link href="/os/events" className={`${styles.button} ${styles.buttonQuiet}`}>
          Clear
        </Link>
      </div>
    </form>
  )
}

export function EventPagination({ result }: { result: EventListResult }) {
  const { page, totalPages, filters } = result
  if (totalPages <= 1) return null

  const prev =
    page > 1
      ? buildEventListHref({
          pipeline: filters.pipeline,
          status: filters.status,
          q: filters.q,
          sort: filters.sort,
          page: page - 1,
        })
      : null
  const next =
    page < totalPages
      ? buildEventListHref({
          pipeline: filters.pipeline,
          status: filters.status,
          q: filters.q,
          sort: filters.sort,
          page: page + 1,
        })
      : null

  return (
    <nav className={styles.pagination} aria-label="Event pages">
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
