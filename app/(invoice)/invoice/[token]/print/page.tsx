import type { Metadata } from 'next'
import styles from '../../../invoice.module.css'
import InvoiceDocument from '@/components/invoices/InvoiceDocument'
import { getPublicInvoiceDocument } from '@/lib/os/invoices/publicInvoice'

export const metadata: Metadata = {
  title: 'Print invoice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ token: string }>

/**
 * Dedicated client print route — never print the authenticated OS detail page.
 * Does not mark the invoice as Viewed (staff may open this for PDF preview).
 */
export default async function PublicInvoicePrintPage({ params }: { params: Params }) {
  const { token } = await params
  const result = await getPublicInvoiceDocument(token)

  if (result.state !== 'valid' || !result.view) {
    return (
      <main className={styles.page}>
        <p className={styles.brand}>Plate The Umpqua</p>
        <div className={styles.stateCard} role="status">
          <h1 className={styles.stateTitle}>Invoice unavailable</h1>
          <p className={styles.stateCopy}>
            This print view is invalid or no longer available.
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('load',function(){setTimeout(function(){window.print()},250);});`,
        }}
      />
      <InvoiceDocument invoice={result.view} printMode token={token} />
    </>
  )
}
