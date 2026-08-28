/**
 * Partner Concierge purchase confirmation — loads invoice by public token and syncs Square state.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPayload } from 'payload'
import config from '../../../payload.config'
import { hashInvoiceToken, normalizeInvoiceTokenParam } from '@/lib/os/invoices/invoiceToken'
import { formatUsdFromCents } from '@/lib/os/invoices/money'
import { syncSquareInvoice } from '@/lib/os/square/sync'
import {
  partnerIndustryLabel,
  isPartnerIndustrySlug,
  isPartnerPackageId,
} from './packages'

export type PartnerPurchaseConfirmation = {
  invoiceNumber: string
  status: 'pending' | 'paid' | 'voided' | 'invalid'
  packageTitle: string | null
  industryLabel: string | null
  experienceCount: number | null
  totalLabel: string
  billingName: string
  billingEmail: string
  billingCompany: string | null
  amountPaidLabel: string
  balanceDueLabel: string
  squarePaymentPending: boolean
}

export async function loadPartnerPurchaseConfirmation(
  rawToken: string,
): Promise<PartnerPurchaseConfirmation | null> {
  const token = normalizeInvoiceTokenParam(rawToken)
  if (!token) return null

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'invoices',
    where: { publicTokenHash: { equals: hashInvoiceToken(token) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const doc = found.docs[0]
  if (!doc) return null
  if (doc.publicTokenRevokedAt) return null

  const partner = (doc as { partnerConcierge?: any }).partnerConcierge as
    | {
        isPartnerPurchase?: boolean | null
        industrySlug?: string | null
        packageTitle?: string | null
        experienceCount?: number | null
      }
    | undefined
  if (!partner?.isPartnerPurchase) return null

  const squareInvoiceId = doc.square?.invoiceId
  if (squareInvoiceId) {
    try {
      await syncSquareInvoice(String(doc.id))
    } catch (err) {
      console.warn('[partner-checkout] confirmation sync skipped', err)
    }
  }

  const refreshed = await payload.findByID({
    collection: 'invoices',
    id: doc.id,
    overrideAccess: true,
    depth: 0,
  })

  if (refreshed.voidedAt || refreshed.status === 'voided') {
    return {
      invoiceNumber: refreshed.invoiceNumber,
      status: 'voided',
      packageTitle: partner.packageTitle ?? null,
      industryLabel: isPartnerIndustrySlug(partner.industrySlug)
        ? partnerIndustryLabel(partner.industrySlug)
        : null,
      experienceCount: partner.experienceCount ?? null,
      totalLabel: formatUsdFromCents(Number(refreshed.totalCents || 0)),
      billingName: refreshed.billing?.name || '',
      billingEmail: refreshed.billing?.email || '',
      billingCompany: refreshed.billing?.company || null,
      amountPaidLabel: formatUsdFromCents(Number(refreshed.amountPaidCents || 0)),
      balanceDueLabel: formatUsdFromCents(Number(refreshed.balanceDueCents || 0)),
      squarePaymentPending: false,
    }
  }

  const paid =
    refreshed.status === 'paid' ||
    Number(refreshed.balanceDueCents || 0) <= 0 ||
    Number(refreshed.amountPaidCents || 0) >= Number(refreshed.totalCents || 0)

  return {
    invoiceNumber: refreshed.invoiceNumber,
    status: paid ? 'paid' : 'pending',
    packageTitle: partner.packageTitle ?? null,
    industryLabel: isPartnerIndustrySlug(partner.industrySlug)
      ? partnerIndustryLabel(partner.industrySlug)
      : null,
    experienceCount: partner.experienceCount ?? null,
    totalLabel: formatUsdFromCents(Number(refreshed.totalCents || 0)),
    billingName: refreshed.billing?.name || '',
    billingEmail: refreshed.billing?.email || '',
    billingCompany: refreshed.billing?.company || null,
    amountPaidLabel: formatUsdFromCents(Number(refreshed.amountPaidCents || 0)),
    balanceDueLabel: formatUsdFromCents(Number(refreshed.balanceDueCents || 0)),
    squarePaymentPending: !paid && Boolean(squareInvoiceId),
  }
}

export function partnerPackageTitleFromId(packageId: unknown): string | null {
  if (!isPartnerPackageId(packageId)) return null
  if (packageId === 'single') return 'Single Experience'
  if (packageId === 'five-pack') return 'Professional 5-Pack'
  return 'Professional 10-Pack'
}
