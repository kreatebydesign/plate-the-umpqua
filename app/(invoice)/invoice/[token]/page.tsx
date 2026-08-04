import type { Metadata } from 'next'
import { headers } from 'next/headers'
import styles from '../../invoice.module.css'
import InvoiceDocument from '@/components/invoices/InvoiceDocument'
import { lookupPublicInvoice } from '@/lib/os/invoices/publicInvoice'
import {
  getInvoiceClientKey,
  isInvoiceViewRateLimited,
} from '@/lib/os/invoices/invoiceRateLimit'

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ token: string }>

export default async function PublicInvoicePage({ params }: { params: Params }) {
  const { token } = await params
  const hdrs = await headers()
  const fakeReq = new Request('https://platetheumpqua.com/invoice', {
    headers: hdrs,
  })
  const clientKey = getInvoiceClientKey(fakeReq)
  if (isInvoiceViewRateLimited(clientKey)) {
    return (
      <main className={styles.page}>
        <p className={styles.brand}>Plate The Umpqua</p>
        <div className={styles.stateCard} role="status">
          <h1 className={styles.stateTitle}>Please try again shortly</h1>
          <p className={styles.stateCopy}>
            Too many invoice views were requested from this network. Wait a few minutes
            and open the link again.
          </p>
        </div>
      </main>
    )
  }

  const result = await lookupPublicInvoice(token)

  if (result.state !== 'valid' || !result.view) {
    const copy =
      result.state === 'voided'
        ? {
            title: 'This invoice is no longer active',
            body: 'This invoice has been voided. Please contact Plate The Umpqua if you need a replacement.',
          }
        : {
            title: 'This invoice link is not available',
            body: 'The secure invoice link is invalid or no longer available. Please contact Plate The Umpqua for a new link.',
          }
    return (
      <main className={styles.page}>
        <p className={styles.brand}>Plate The Umpqua</p>
        <div className={styles.stateCard} role="status">
          <h1 className={styles.stateTitle}>{copy.title}</h1>
          <p className={styles.stateCopy}>{copy.body}</p>
        </div>
        <p className={styles.footer}>Private hospitality · Roseburg & the Umpqua Valley</p>
      </main>
    )
  }

  return <InvoiceDocument invoice={result.view} token={token} />
}
