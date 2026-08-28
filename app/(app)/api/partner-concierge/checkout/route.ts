import { NextResponse } from 'next/server'
import { createPartnerConciergeCheckout } from '@/lib/os/partnerConcierge/createCheckout'
import { validatePartnerCheckout } from '@/lib/os/partnerConcierge/validateCheckout'
import { resolvePartnerPackage } from '@/lib/os/partnerConcierge/packages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 16_000

function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (!site) return true
  try {
    const originHost = new URL(origin).host
    const siteHost = new URL(site).host
    return originHost === siteHost
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ success: false, message: 'Invalid origin.' }, { status: 403 })
  }

  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ success: false, message: 'Request too large.' }, { status: 413 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
  }

  const validated = validatePartnerCheckout(raw)
  if (!validated.ok) {
    return NextResponse.json(
      { success: false, message: validated.message },
      { status: validated.status },
    )
  }

  const pkg = resolvePartnerPackage(validated.data.packageId)
  if (!pkg) {
    return NextResponse.json({ success: false, message: 'Package not available.' }, { status: 400 })
  }

  const result = await createPartnerConciergeCheckout(validated.data)
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: result.status },
    )
  }

  return NextResponse.json({
    success: true,
    squareUrl: result.squareUrl,
    confirmationToken: result.confirmationToken,
    invoiceNumber: result.invoiceNumber,
    reused: result.reused,
    packageTitle: pkg.title,
    priceLabel: pkg.priceLabel,
  })
}

export async function GET() {
  return NextResponse.json({ success: false, message: 'Method not allowed.' }, { status: 405 })
}
