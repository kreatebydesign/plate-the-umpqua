'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { PartnerIndustrySlug } from '@/lib/site/partnerConciergeIndustries'
import type { PartnerPackageId } from '@/lib/site/partnerConciergePricing'
import { partnerPackageInquiryHref } from '@/lib/site/partnerConciergePricing'

type PackageSummary = {
  id: PartnerPackageId
  title: string
  priceLabel: string
  tableCount: number
  perExperiencePrice: string
  savingsLabel: string | null
  desc: string
}

type Props = {
  industrySlug: PartnerIndustrySlug
  industryLabel: string
  initialPackageId: PartnerPackageId
  packages: PackageSummary[]
}

export default function PartnerPurchaseForm({
  industrySlug,
  industryLabel,
  initialPackageId,
  packages,
}: Props) {
  const [packageId, setPackageId] = useState<PartnerPackageId>(initialPackageId)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [checkoutKey] = useState(() => crypto.randomUUID())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => packages.find((pkg) => pkg.id === packageId) ?? packages[0],
    [packageId, packages],
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!checkoutKey || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/partner-concierge/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          industrySlug,
          checkoutKey,
          billing: { name, email, phone, company },
          website,
        }),
      })

      const data = (await response.json()) as {
        success?: boolean
        message?: string
        squareUrl?: string
        confirmationToken?: string
      }

      if (!response.ok || !data.success || !data.squareUrl || !data.confirmationToken) {
        setError(data.message || 'Checkout could not be started. Please try again.')
        setSubmitting(false)
        return
      }

      sessionStorage.setItem('partnerPurchaseConfirmation', data.confirmationToken)
      sessionStorage.setItem(
        'partnerPurchaseSuccessUrl',
        `/partner-concierge/purchase/success?ref=${encodeURIComponent(data.confirmationToken)}`,
      )

      window.location.href = data.squareUrl
    } catch {
      setError('Checkout could not be started. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]">
          Partner Concierge · {industryLabel}
        </p>
        <h1
          className="text-[clamp(2.4rem,8vw,3.8rem)] leading-[0.96] tracking-[-0.04em]"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Purchase Package
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[#e9decb]/82 md:text-base">
          Choose your prepaid package, confirm your business details, then complete secure
          payment through Square. Martin will follow up with certificate fulfillment after
          payment.
        </p>
      </div>

      <fieldset className="grid gap-4 border border-[#c4a465]/16 p-5 md:p-6">
        <legend className="px-2 text-[10px] uppercase tracking-[0.28em] text-[#c4a465]">
          Select Package
        </legend>
        {packages.map((pkg) => (
          <label
            key={pkg.id}
            className={`grid cursor-pointer gap-2 border p-4 transition ${
              packageId === pkg.id
                ? 'border-[#c4a465] bg-[#c4a465]/8'
                : 'border-[#c4a465]/18 hover:border-[#c4a465]/35'
            }`}
          >
            <span className="flex items-start justify-between gap-4">
              <span>
                <input
                  type="radio"
                  name="package"
                  value={pkg.id}
                  checked={packageId === pkg.id}
                  onChange={() => setPackageId(pkg.id)}
                  className="sr-only"
                />
                <span className="block text-sm font-medium text-[#efe6d4]">{pkg.title}</span>
                <span className="mt-1 block text-xs leading-6 text-[#bfb39f]">{pkg.desc}</span>
              </span>
              <span className="text-right text-sm text-[#c4a465]">
                {pkg.priceLabel}
                {pkg.savingsLabel ? (
                  <span className="mt-1 block text-[11px] text-[#e9decb]/55">
                    {pkg.savingsLabel}
                  </span>
                ) : null}
              </span>
            </span>
            {pkg.tableCount > 1 ? (
              <span className="text-xs text-[#bfb39f]">
                {pkg.perExperiencePrice} per experience
              </span>
            ) : null}
          </label>
        ))}
      </fieldset>

      {selected ? (
        <div className="border border-[#c4a465]/16 bg-[#14120e]/50 p-5 md:p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4a465]/85">
            Order Summary
          </p>
          <p className="mt-3 text-lg text-[#efe6d4]">{selected.title}</p>
          <p className="mt-2 text-sm text-[#bfb39f]">
            {selected.tableCount === 1
              ? '1 prepaid private dining experience'
              : `${selected.tableCount} prepaid private dining experiences`}
          </p>
          <p className="mt-4 text-2xl text-[#c4a465]" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {selected.priceLabel}
          </p>
        </div>
      ) : null}

      <fieldset className="grid gap-4 border border-[#c4a465]/16 p-5 md:p-6">
        <legend className="px-2 text-[10px] uppercase tracking-[0.28em] text-[#c4a465]">
          Purchaser Information
        </legend>

        <label className="grid gap-2 text-sm">
          <span className="text-[#bfb39f]">Full name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 border border-[#c4a465]/25 bg-[#0f0e0c] px-3 py-2 text-[#efe6d4] outline-none focus:border-[#c4a465]"
            autoComplete="name"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-[#bfb39f]">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 border border-[#c4a465]/25 bg-[#0f0e0c] px-3 py-2 text-[#efe6d4] outline-none focus:border-[#c4a465]"
            autoComplete="email"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-[#bfb39f]">Phone (optional)</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="min-h-11 border border-[#c4a465]/25 bg-[#0f0e0c] px-3 py-2 text-[#efe6d4] outline-none focus:border-[#c4a465]"
            autoComplete="tel"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-[#bfb39f]">Business / company (optional)</span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="min-h-11 border border-[#c4a465]/25 bg-[#0f0e0c] px-3 py-2 text-[#efe6d4] outline-none focus:border-[#c4a465]"
            autoComplete="organization"
          />
        </label>

        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="hidden"
        />
      </fieldset>

      {error ? (
        <p role="alert" className="border border-red-400/30 bg-red-950/20 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting || !checkoutKey}
          className="min-h-11 border border-[#c4a465] px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition hover:bg-[#c4a465] hover:text-[#14120e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Starting secure checkout…' : 'Continue to secure payment'}
        </button>

        <Link
          href={partnerPackageInquiryHref(
            selected?.title === 'Single Experience'
              ? 'Single Experience'
              : selected?.title === 'Professional 5-Pack'
                ? 'Professional 5-Pack'
                : 'Professional 10-Pack',
            industrySlug,
          )}
          className="text-center text-[11px] uppercase tracking-[0.18em] text-[#efe6d4]/72 transition hover:text-[#c4a465] sm:text-left"
        >
          Request information instead
        </Link>
      </div>

      <p className="text-xs leading-6 text-[#bfb39f]">
        Payment is processed securely by Square. Plate The Umpqua never stores card details.
        After payment, return to your confirmation page using the link saved for this checkout.
      </p>
    </form>
  )
}
