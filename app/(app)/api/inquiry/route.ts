import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import config from '../../../../payload.config'
import { getPayload } from 'payload'
import {
  getInquiryClientKey,
  isPlausibleInquiryOrigin,
  validatePublicInquiry,
  type LeadSource,
  type PublicInquiryInput,
} from '@/lib/inquiry/validatePublicInquiry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: 'Website',
  concierge: 'Concierge',
  packages: 'Packages',
  'partner-concierge': 'Partner Concierge Program',
  'community-partnership': 'Private Community Partnership',
  realtor: 'Realtor',
  'wine-country': 'Wine Country',
  referral: 'Referral',
}

const MAX_BODY_BYTES = 32_000

function getLeadSourceLabel(source: LeadSource) {
  return LEAD_SOURCE_LABELS[source]
}

function isConciergeChannelLead(leadSource: LeadSource) {
  return (
    leadSource === 'partner-concierge' ||
    leadSource === 'community-partnership'
  )
}

function getLeadType(data: PublicInquiryInput, leadSource: LeadSource) {
  const budget = data.budget
  const pkg = data.packageInterest
  const urgency = data.urgency

  if (
    isConciergeChannelLead(leadSource) ||
    leadSource === 'realtor' ||
    pkg === 'Concierge' ||
    budget === '2000+'
  ) {
    return 'REALTOR / PARTNER LEAD'
  }

  if (budget === '750-1500' || pkg === 'Estate') {
    return 'HIGH VALUE LEAD'
  }

  if (urgency === 'this-week') {
    return 'HOT LEAD'
  }

  return 'STANDARD LEAD'
}

function getSubject(type: string, leadSource: LeadSource, pkg?: string) {
  if (leadSource === 'community-partnership') {
    return 'Community Partnership Lead — Private Community Partnership'
  }

  if (leadSource === 'partner-concierge') {
    return 'Partner Concierge Lead — Concierge Program'
  }

  if (type.includes('HIGH VALUE')) {
    return `High Value Lead — ${pkg || 'Inquiry'}`
  }

  if (type.includes('REALTOR')) {
    return 'Realtor / Partner Lead — Concierge Program'
  }

  if (type.includes('HOT')) {
    return 'Hot Lead — Urgent Booking'
  }

  return `New Inquiry — ${pkg || 'Private Dining'}`
}

function row(label: string, value?: string) {
  return `
    <tr>
      <td style="padding:12px 0;color:#c4a465;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;width:35%;border-bottom:1px solid rgba(196,164,101,0.14);">
        ${label}
      </td>

      <td style="padding:12px 0;color:#efe6d4;font-size:14px;border-bottom:1px solid rgba(196,164,101,0.14);">
        ${value?.trim() || '—'}
      </td>
    </tr>
  `
}

function mapOccasion(value: string, leadSource: LeadSource) {
  if (leadSource === 'community-partnership') {
    return 'whiteLabelHospitality'
  }

  if (leadSource === 'partner-concierge') {
    return 'realtorHospitality'
  }

  switch (value) {
    case 'Birthday':
      return 'birthday'
    case 'Anniversary':
      return 'anniversary'
    case 'Proposal':
      return 'proposalEngagement'
    case 'Corporate':
      return 'corporateExecutive'
    case 'Wine Experience':
      return 'wineCountryExperience'
    default:
      return 'privateDinner'
  }
}

function mapExperienceStyle(
  pkg: string,
  leadSource: LeadSource,
): Array<
  'privateDinner' | 'estateDinner' | 'wineCountry' | 'realtorConcierge'
> {
  if (
    leadSource === 'partner-concierge' ||
    leadSource === 'community-partnership' ||
    leadSource === 'realtor'
  ) {
    return ['realtorConcierge']
  }

  switch (pkg) {
    case 'Estate':
      return ['estateDinner']
    case 'Concierge':
      return ['realtorConcierge']
    case 'Wine':
      return ['wineCountry']
    default:
      return ['privateDinner']
  }
}

function isPartnerLead(leadSource: LeadSource, pkg: string) {
  return (
    isConciergeChannelLead(leadSource) ||
    leadSource === 'realtor' ||
    pkg === 'Concierge'
  )
}

function getLeadSourceBanner(leadSource: LeadSource) {
  if (leadSource === 'community-partnership') {
    return `
      <div style="margin:20px 0 8px;padding:16px 18px;border:1px solid rgba(196,164,101,0.35);background:rgba(196,164,101,0.08);">
        <p style="margin:0;color:#c4a465;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;">
          Lead Source
        </p>
        <p style="margin:8px 0 0;color:#efe6d4;font-size:18px;line-height:1.4;">
          Private Community Partnership
        </p>
      </div>
    `
  }

  if (leadSource === 'partner-concierge') {
    return `
      <div style="margin:20px 0 8px;padding:16px 18px;border:1px solid rgba(196,164,101,0.35);background:rgba(196,164,101,0.08);">
        <p style="margin:0;color:#c4a465;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;">
          Lead Source
        </p>
        <p style="margin:8px 0 0;color:#efe6d4;font-size:18px;line-height:1.4;">
          Partner Concierge Program
        </p>
      </div>
    `
  }

  return ''
}

function getDefaultEventTitle(leadSource: LeadSource) {
  if (leadSource === 'community-partnership') {
    return 'Private Community Partnership Inquiry'
  }

  if (leadSource === 'partner-concierge') {
    return 'Partner Concierge Program Inquiry'
  }

  return 'Private Hospitality Inquiry'
}

function parseGuestCount(guests: string): number | undefined {
  if (!guests) return undefined
  if (guests.startsWith('2-4')) return 4
  if (guests.startsWith('5-10')) return 10
  if (guests.startsWith('10-20')) return 20
  if (guests.startsWith('20+')) return 20
  const n = Number(guests)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Request too large.' },
        { status: 413 },
      )
    }

    if (!isPlausibleInquiryOrigin(req)) {
      console.warn('[inquiry] rejected origin', {
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
        client: getInquiryClientKey(req),
      })
      return NextResponse.json(
        { success: false, message: 'Unable to submit inquiry.' },
        { status: 403 },
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[inquiry] RESEND_API_KEY missing')
      return NextResponse.json(
        { success: false, message: 'Inquiry service is temporarily unavailable.' },
        { status: 503 },
      )
    }

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request.' },
        { status: 400 },
      )
    }

    const validated = validatePublicInquiry(raw)
    if (!validated.ok) {
      if (validated.code === 'honeypot' || validated.code === 'timing_fast') {
        console.warn('[inquiry] blocked', {
          code: validated.code,
          client: getInquiryClientKey(req),
        })
      }
      return NextResponse.json(
        { success: false, message: validated.message },
        { status: validated.status },
      )
    }

    const data = validated.data
    const leadSource = data.source
    const leadSourceLabel = getLeadSourceLabel(leadSource)

    const payload = await getPayload({ config })
    const resend = new Resend(apiKey)

    // Local API overrides collection access so the controlled endpoint can write.
    const existingClients = await payload.find({
      collection: 'clients',
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: data.email,
        },
      },
    })

    let clientID: string

    if (existingClients.docs.length > 0) {
      clientID = String(existingClients.docs[0].id)
    } else {
      const createdClient = await payload.create({
        collection: 'clients',
        overrideAccess: true,
        data: {
          fullName: data.name,
          email: data.email,
          phone: data.phone || undefined,
          clientType: isPartnerLead(leadSource, data.packageInterest)
            ? 'realtor'
            : 'private',
          vipStatus:
            data.budget === '2000+' || isConciergeChannelLead(leadSource)
              ? 'vip'
              : 'standard',
          preferredExperienceStyle: mapExperienceStyle(
            data.packageInterest,
            leadSource,
          ),
          averageSpendRange: data.budget || undefined,
          relationshipNotes: `
Lead Source: ${leadSourceLabel}

Location:
${data.location}

Occasion:
${data.occasion}

Timeline:
${data.urgency}
          `.trim(),
        },
      })

      clientID = String(createdClient.id)
    }

    const inquiry = await payload.create({
      collection: 'inquiries',
      overrideAccess: true,
      data: {
        leadSource,
        eventTitle: data.occasion || getDefaultEventTitle(leadSource),
        client: clientID,
        guestCount: parseGuestCount(data.guests),
        preferredRegion: data.location || 'Umpqua Valley',
        experienceVision:
          data.details ||
          `Client submitted a new hospitality inquiry through ${leadSourceLabel}.`,
        occasion: mapOccasion(data.occasion, leadSource),
        status: 'newLead',
        priorityLevel:
          data.budget === '2000+' || isConciergeChannelLead(leadSource)
            ? 'vip'
            : 'standard',
      },
    })

    const leadType = getLeadType(data, leadSource)
    const subject = getSubject(leadType, leadSource, data.packageInterest)
    const leadSourceBanner = getLeadSourceBanner(leadSource)

    const html = `
      <div style="background:#14120e;padding:40px;font-family:Georgia,serif;">
        <div style="max-width:700px;margin:auto;border:1px solid #c4a46533;padding:30px;background:#0f0e0c;">
          <p style="color:#c4a465;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;">
            Plate The Umpqua
          </p>

          <h1 style="color:#efe6d4;font-weight:400;margin:12px 0 8px;">
            ${subject}
          </h1>

          <p style="color:#b9ac97;">
            A new private hospitality inquiry was submitted through platetheumpqua.com.
          </p>

          ${leadSourceBanner}

          <p style="color:#b9ac97;">
            Lead Type: <strong>${leadType}</strong>
          </p>

          <table width="100%" style="border-collapse:collapse;margin-top:20px;">
            ${row('Lead Source', leadSourceLabel)}
            ${row('Name', data.name)}
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
            ${row('Location', data.location)}
            ${row('Guests', data.guests)}
            ${row('Budget', data.budget)}
            ${row('Package', data.packageInterest)}
            ${row('Timeline', data.urgency)}
            ${row('Occasion', data.occasion)}
          </table>

          <div style="margin-top:24px;color:#efe6d4;">
            <p style="color:#c4a465;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;">
              Details
            </p>

            <p style="color:#efe6d4;line-height:1.7;">
              ${data.details || '—'}
            </p>
          </div>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: 'Plate The Umpqua <info@platetheumpqua.com>',
      to: ['platetheumpqua@gmail.com'],
      replyTo: data.email,
      subject,
      html,
    })

    if (result.error) {
      console.error('[inquiry] Resend error:', result.error)
    }

    return NextResponse.json({
      success: true,
      inquiryID: inquiry.id,
      leadType,
      leadSource,
    })
  } catch (err) {
    console.error('[inquiry] route error:', err)
    return NextResponse.json(
      { success: false, message: 'Inquiry submission failed.' },
      { status: 500 },
    )
  }
}

/** Reject enumeration / accidental GET */
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed.' },
    { status: 405 },
  )
}
