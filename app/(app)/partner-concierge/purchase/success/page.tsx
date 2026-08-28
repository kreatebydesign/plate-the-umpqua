import type { Metadata } from 'next'
import Link from 'next/link'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import { loadPartnerPurchaseConfirmation } from '@/lib/os/partnerConcierge/purchaseConfirmation'
import { normalizeInvoiceTokenParam } from '@/lib/os/invoices/invoiceToken'

const work = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Partner Concierge Purchase Confirmation',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function PartnerPurchaseSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const ref = first(params.ref)
  const token = ref ? normalizeInvoiceTokenParam(ref) : null
  const confirmation = token ? await loadPartnerPurchaseConfirmation(token) : null

  const isPaid = confirmation?.status === 'paid'
  const isPending = confirmation?.status === 'pending'
  const isInvalid = !confirmation || confirmation.status === 'invalid'

  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen bg-[#14120e] px-5 py-28 text-[#efe6d4] md:px-6`}
    >
      <div className="mx-auto max-w-2xl border border-[#c4a465]/16 bg-[#100e0b] p-8 md:p-10">
        {isInvalid ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]">
              Confirmation unavailable
            </p>
            <h1
              className="mt-5 text-[clamp(2rem,8vw,3.2rem)] leading-tight tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              We could not locate this purchase.
            </h1>
            <p className="mt-5 text-sm leading-7 text-[#bfb39f]">
              If you completed payment, Martin will follow up directly. You can also return to
              Partner Concierge or send a request for information.
            </p>
          </>
        ) : isPaid ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]">
              Payment confirmed
            </p>
            <h1
              className="mt-5 text-[clamp(2rem,8vw,3.4rem)] leading-tight tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Your Partner Package is confirmed.
            </h1>
            <p className="mt-5 text-sm leading-7 text-[#e9decb]/84 md:text-base">
              Thank you for choosing Plate The Umpqua. Martin will follow up with your
              certificate fulfillment details.
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]">
              Payment pending
            </p>
            <h1
              className="mt-5 text-[clamp(2rem,8vw,3.2rem)] leading-tight tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Checkout started — payment not confirmed yet.
            </h1>
            <p className="mt-5 text-sm leading-7 text-[#bfb39f]">
              If you completed payment, this page may take a moment to update. Martin will follow
              up once payment is confirmed.
            </p>
          </>
        )}

        {confirmation && !isInvalid ? (
          <dl className="mt-8 grid gap-4 border-t border-[#c4a465]/12 pt-8 text-sm">
            {confirmation.packageTitle ? (
              <div className="grid gap-1">
                <dt className="text-[10px] uppercase tracking-[0.24em] text-[#c4a465]/75">
                  Package
                </dt>
                <dd className="text-[#efe6d4]">{confirmation.packageTitle}</dd>
              </div>
            ) : null}
            {confirmation.industryLabel ? (
              <div className="grid gap-1">
                <dt className="text-[10px] uppercase tracking-[0.24em] text-[#c4a465]/75">
                  Industry
                </dt>
                <dd className="text-[#efe6d4]">{confirmation.industryLabel}</dd>
              </div>
            ) : null}
            <div className="grid gap-1">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-[#c4a465]/75">
                Amount
              </dt>
              <dd className="text-[#efe6d4]">{confirmation.totalLabel}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-[#c4a465]/75">
                Purchaser
              </dt>
              <dd className="text-[#efe6d4]">
                {confirmation.billingName}
                {confirmation.billingCompany ? (
                  <span className="block text-[#bfb39f]">{confirmation.billingCompany}</span>
                ) : null}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-[#c4a465]/75">
                Reference
              </dt>
              <dd className="text-[#efe6d4]">{confirmation.invoiceNumber}</dd>
            </div>
            {isPending && confirmation.squarePaymentPending ? (
              <div className="grid gap-1">
                <dt className="text-[10px] uppercase tracking-[0.24em] text-[#c4a465]/75">
                  Status
                </dt>
                <dd className="text-[#bfb39f]">
                  Awaiting Square payment confirmation ({confirmation.amountPaidLabel} received)
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/partner-concierge"
            className="border border-[#c4a465] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] transition hover:bg-[#c4a465] hover:text-[#14120e]"
          >
            Partner Concierge
          </Link>
          <Link
            href="/inquiry?source=partner-concierge"
            className="px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] text-[#efe6d4]/72 transition hover:text-[#c4a465]"
          >
            Contact Martin
          </Link>
        </div>
      </div>
    </main>
  )
}
