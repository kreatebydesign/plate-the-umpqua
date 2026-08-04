import { NextResponse } from 'next/server'
import { getPublicInvoiceDocument } from '@/lib/os/invoices/publicInvoice'
import { renderInvoicePdfBuffer } from '@/lib/os/invoices/invoicePdf'
import {
  getInvoiceClientKey,
  isInvoiceViewRateLimited,
} from '@/lib/os/invoices/invoiceRateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = Promise<{ token: string }>

/**
 * Client-safe PDF download by public token.
 * Does not mark the invoice Viewed — viewing happens on the HTML document.
 */
export async function GET(request: Request, { params }: { params: Params }) {
  const { token } = await params
  const clientKey = getInvoiceClientKey(request)
  if (isInvoiceViewRateLimited(clientKey)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

  const result = await getPublicInvoiceDocument(token)
  if (result.state !== 'valid' || !result.view) {
    return NextResponse.json({ error: 'Invoice not available' }, { status: 404 })
  }

  try {
    const buffer = await renderInvoicePdfBuffer(result.view)
    const filename = `${result.view.invoiceNumber.replace(/[^\w.-]+/g, '_')}.pdf`
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    console.error('[invoice/pdf] render failed', err instanceof Error ? err.message : 'error')
    return NextResponse.json({ error: 'Unable to render PDF' }, { status: 500 })
  }
}
