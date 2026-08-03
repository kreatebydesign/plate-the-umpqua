import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { getInvoiceDetail } from '@/lib/os/invoices/invoiceQueries'
import { loadInvoiceEditorOptions } from '@/lib/os/invoices/editorOptions'
import InvoiceEditorForm from '@/components/os/invoices/InvoiceEditorForm'
import type { BillingTypeValue } from '@/lib/os/invoices/invoiceConstants'

export const metadata: Metadata = {
  title: 'Edit invoice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditInvoicePage({ params }: { params: Params }) {
  const { id } = await params
  const user = await requirePlateOperator({ returnTo: `/os/invoices/${id}/edit` })
  if (!canWriteOperational(asPlateUser(user))) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Editing invoices requires director or curator access.</p>
        <Link href={`/os/invoices/${id}`} className={styles.button}>
          Back to invoice
        </Link>
      </div>
    )
  }

  const [invoice, options] = await Promise.all([
    getInvoiceDetail(user, id),
    loadInvoiceEditorOptions(user),
  ])
  if (!invoice) notFound()

  if (invoice.status === 'voided') {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Voided invoices cannot be edited.</p>
        <Link href={`/os/invoices/${id}`} className={styles.button}>
          Back to invoice
        </Link>
      </div>
    )
  }

  return (
    <div>
      <section className={styles.hero}>
        <p className={styles.heroDate}>{invoice.invoiceNumber}</p>
        <h2 className={styles.heroGreeting}>Edit invoice</h2>
        <div className={styles.actions}>
          <Link
            href={`/os/invoices/${id}`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Cancel
          </Link>
        </div>
      </section>
      <InvoiceEditorForm
        mode="edit"
        invoiceId={invoice.id}
        clients={options.clients}
        events={options.events}
        initial={{
          clientId: invoice.clientId || '',
          eventId: invoice.eventId || '',
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          paymentTerms: invoice.paymentTerms,
          paymentTermsCustom: invoice.paymentTermsCustom || '',
          billToName: invoice.billing.name,
          billToEmail: invoice.billing.email,
          billToPhone: invoice.billing.phone || '',
          billToCompany: invoice.billing.company || '',
          lineItems: invoice.lineItems.map((line) => ({
            itemKey: line.itemKey,
            description: line.description,
            detail: line.detail || '',
            billingType: line.billingType as BillingTypeValue,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            isCredit: line.isCredit,
          })),
          discountType: invoice.discountType,
          discountValue: invoice.discountValue,
          taxRateBps: invoice.taxRateBps,
          depositRequiredCents: invoice.depositRequiredCents,
          clientMemo: invoice.clientMemo || '',
          internalNotes: invoice.internalNotes || '',
        }}
      />
    </div>
  )
}
