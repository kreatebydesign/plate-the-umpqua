import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  INQUIRY_LEAD_SOURCE_VALUES,
  INQUIRY_OCCASION_LABELS,
  INQUIRY_OCCASION_VALUES,
  INQUIRY_PIPELINE_OPTIONS,
  INQUIRY_SORT_OPTIONS,
} from '@/lib/os/inquiries/inquiryConstants'
import { LEAD_SOURCE_LABELS } from '@/lib/os/constants'
import { buildInquiryListHref } from '@/lib/os/inquiries/inquiryQueries'
import type { InquiryListResult } from '@/lib/os/inquiries/inquiryQueries'

type Props = {
  result: InquiryListResult
}

export default function InquiryFilters({ result }: Props) {
  const { filters } = result

  return (
    <form className={styles.filterBar} method="get" action="/os/inquiries">
      <label className={styles.fieldLabel} htmlFor="pipeline">
        Pipeline
        <select
          id="pipeline"
          name="pipeline"
          className={styles.fieldControl}
          defaultValue={filters.pipeline}
        >
          {INQUIRY_PIPELINE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="source">
        Source
        <select
          id="source"
          name="source"
          className={styles.fieldControl}
          defaultValue={filters.source || ''}
        >
          <option value="">All sources</option>
          {INQUIRY_LEAD_SOURCE_VALUES.map((value) => (
            <option key={value} value={value}>
              {LEAD_SOURCE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor="occasion">
        Occasion
        <select
          id="occasion"
          name="occasion"
          className={styles.fieldControl}
          defaultValue={filters.occasion || ''}
        >
          <option value="">All occasions</option>
          {INQUIRY_OCCASION_VALUES.map((value) => (
            <option key={value} value={value}>
              {INQUIRY_OCCASION_LABELS[value]}
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
          {INQUIRY_SORT_OPTIONS.map((option) => (
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
          placeholder="Name, email, or title"
          maxLength={80}
          autoComplete="off"
        />
      </label>

      <div className={styles.filterActions}>
        <button type="submit" className={styles.button}>
          Apply
        </button>
        <Link href="/os/inquiries" className={`${styles.button} ${styles.buttonQuiet}`}>
          Clear
        </Link>
      </div>
    </form>
  )
}

export function InquiryPagination({ result }: { result: InquiryListResult }) {
  const { page, totalPages, filters } = result
  if (totalPages <= 1) return null

  const prev =
    page > 1
      ? buildInquiryListHref({
          pipeline: filters.pipeline,
          source: filters.source,
          occasion: filters.occasion,
          q: filters.q,
          sort: filters.sort,
          page: page - 1,
        })
      : null
  const next =
    page < totalPages
      ? buildInquiryListHref({
          pipeline: filters.pipeline,
          source: filters.source,
          occasion: filters.occasion,
          q: filters.q,
          sort: filters.sort,
          page: page + 1,
        })
      : null

  return (
    <nav className={styles.pagination} aria-label="Inquiry pages">
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
