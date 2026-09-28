import type { LeadSource } from '@/lib/inquiry/validatePublicInquiry'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function gtagEvent(eventName: string, params: Record<string, string | number>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function trackInquirySubmit(params: {
  source: LeadSource | string
  package_interest?: string
}) {
  gtagEvent('inquiry_submit', {
    lead_source: params.source,
    package_interest: params.package_interest || 'none',
  })
}

export function trackPrimaryCtaClick(params: {
  cta_label: string
  page_path: string
  destination: string
}) {
  gtagEvent('primary_cta_click', {
    cta_label: params.cta_label,
    page_path: params.page_path,
    destination: params.destination,
  })
}
