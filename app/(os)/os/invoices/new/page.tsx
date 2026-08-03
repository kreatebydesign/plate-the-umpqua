import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { loadInvoiceEditorOptions } from '@/lib/os/invoices/editorOptions'
import InvoiceEditorForm from '@/components/os/invoices/InvoiceEditorForm'

export const metadata: Metadata = {
  title: 'Create invoice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
  const user = await requirePlateOperator({ returnTo: '/os/invoices/new' })
  if (!canWriteOperational(asPlateUser(user))) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>
          Creating invoices requires director or curator access.
        </p>
        <Link href="/os/invoices" className={styles.button}>
          Back to invoices
        </Link>
      </div>
    )
  }

  const options = await loadInvoiceEditorOptions(user)

  return (
    <div>
      <section className={styles.hero} aria-label="Create invoice">
        <p className={styles.heroDate}>New draft</p>
        <h2 className={styles.heroGreeting}>Create invoice</h2>
        <p className={styles.heroLine}>
          Select a client, add hospitality line items, and save a draft. Send when
          ready.
        </p>
        <div className={styles.actions}>
          <Link href="/os/invoices" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to invoices
          </Link>
        </div>
      </section>
      <InvoiceEditorForm mode="create" clients={options.clients} events={options.events} />
    </div>
  )
}
