import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  INVOICE_SORT_OPTIONS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VALUES,
} from '@/lib/os/invoices/invoiceConstants'
import { buildInvoiceListHref } from '@/lib/os/invoices/invoiceQueries'
import type { InvoiceListResult } from '@/lib/os/invoices/invoiceQueries'

export default function InvoiceFilters({ result }: { result: InvoiceListResult }) {
  const { filters } = result
  return (
    <form className={styles.filterBar} method="get" action="/os/invoices">
      <label className={styles.fieldLabel} htmlFor="status">
        Status
        <select
          id="status"
          name="status"
          className={`${styles.fieldControl} ${styles.selectControl}`}
          defaultValue={filters.status}
        >
          <option value="all">All statuses</option>
          {INVOICE_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {INVOICE_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.fieldLabel} htmlFor="sort">
        Sort
        <select
          id="sort"
          name="sort"
          className={`${styles.fieldControl} ${styles.selectControl}`}
          defaultValue={filters.sort}
        >
          {INVOICE_SORT_OPTIONS.map((option) => (
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
          placeholder="Invoice #, client, email"
          maxLength={80}
          autoComplete="off"
        />
      </label>
      <div className={styles.filterActions}>
        <button type="submit" className={styles.button}>
          Apply
        </button>
        <Link href="/os/invoices" className={`${styles.button} ${styles.buttonQuiet}`}>
          Clear
        </Link>
      </div>
    </form>
  )
}

export function InvoicePagination({ result }: { result: InvoiceListResult }) {
  const { page, totalPages, filters } = result
  if (totalPages <= 1) return null
  const prev =
    page > 1
      ? buildInvoiceListHref({
          status: filters.status,
          q: filters.q,
          sort: filters.sort,
          page: page - 1,
        })
      : null
  const next =
    page < totalPages
      ? buildInvoiceListHref({
          status: filters.status,
          q: filters.q,
          sort: filters.sort,
          page: page + 1,
        })
      : null
  return (
    <nav className={styles.pagination} aria-label="Invoice pages">
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
