import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import config from '../../../../payload.config'
import { getPayload } from 'payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LEAD_SOURCE_LABELS = {
  website: 'Website',
  concierge: 'Concierge',
  packages: 'Packages',
  'partner-concierge': 'Partner Concierge Program',
  'community-partnership': 'Private Community Partnership',
  realtor: 'Realtor',
  'wine-country': 'Wine Country',
  referral: 'Referral',
} as const

type LeadSource = keyof typeof LEAD_SOURCE_LABELS

type Inquiry = {
  name?: string
  email?: string
  phone?: string
  location?: string
  guests?: string
  budget?: string
  packageInterest?: string
  urgency?: string
  occasion?: string
  details?: string
  source?: string
}

function clean(value?: string) {
  return value?.trim() || ''
}

function normalizeLeadSource(value?: string): LeadSource {
  const source = clean(value)

  if (source && source in LEAD_SOURCE_LABELS) {
    return source as LeadSource
  }

  return 'website'
}

function getLeadSourceLabel(source: LeadSource) {
  return LEAD_SOURCE_LABELS[source]
}

function isConciergeChannelLead(leadSource: LeadSource) {
  return (
    leadSource === 'partner-concierge' ||
    leadSource === 'community-partnership'
  )
}

function getLeadType(data: Inquiry, leadSource: LeadSource) {
  const budget = clean(data.budget)
  const pkg = clean(data.packageInterest)
  const urgency = clean(data.urgency)

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

function getSubject(
  type: string,
  leadSource: LeadSource,
  pkg?: string,
) {
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
        ${clean(value) || '—'}
      </td>
    </tr>
  `
}

function mapOccasion(value?: string, leadSource?: LeadSource) {
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

function mapExperienceStyle(pkg?: string, leadSource?: LeadSource) {
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

function isPartnerLead(leadSource: LeadSource, pkg?: string) {
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

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email service is not configured.',
        },
        {
          status: 500,
        },
      )
    }

    const body = (await req.json()) as Inquiry

    const name = clean(body.name)
    const email = clean(body.email)
    const leadSource = normalizeLeadSource(body.source)
    const leadSourceLabel = getLeadSourceLabel(leadSource)

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields.',
        },
        {
          status: 400,
        },
      )
    }

    const payload = await getPayload({
      config,
    })

    const resend = new Resend(apiKey)

    const existingClients = await payload.find({
      collection: 'clients' as any,
      limit: 1,

      where: {
        email: {
          equals: email,
        },
      },
    })

    let clientID: string

    if (existingClients.docs.length > 0) {
      clientID = String(existingClients.docs[0].id)
    } else {
      const createdClient = await payload.create({
        collection: 'clients' as any,

        data: {
          fullName: name,
          email,
          phone: clean(body.phone),

          clientType: isPartnerLead(
            leadSource,
            body.packageInterest,
          )
            ? 'realtor'
            : 'private',

          vipStatus:
            body.budget === '2000+' ||
            isConciergeChannelLead(leadSource)
              ? 'vip'
              : 'standard',

          preferredExperienceStyle: mapExperienceStyle(
            body.packageInterest,
            leadSource,
          ),

          averageSpendRange: clean(body.budget),

          relationshipNotes: `
Lead Source: ${leadSourceLabel}

Location:
${clean(body.location)}

Occasion:
${clean(body.occasion)}

Timeline:
${clean(body.urgency)}
          `,
        },
      })

      clientID = String(createdClient.id)
    }

    const inquiry = await payload.create({
      collection: 'inquiries' as any,

      data: {
        leadSource,

        eventTitle:
          clean(body.occasion) || getDefaultEventTitle(leadSource),

        client: clientID,

        guestCount:
          Number(body.guests) || undefined,

        preferredRegion:
          clean(body.location) || 'Umpqua Valley',

        experienceVision:
          clean(body.details) ||
          `Client submitted a new hospitality inquiry through ${leadSourceLabel}.`,

        occasion: mapOccasion(body.occasion, leadSource),

        status: 'newLead',

        priorityLevel:
          body.budget === '2000+' ||
          isConciergeChannelLead(leadSource)
            ? 'vip'
            : 'standard',
      },
    })

    const leadType = getLeadType(body, leadSource)

    const subject = getSubject(
      leadType,
      leadSource,
      body.packageInterest,
    )

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
            ${row('Name', body.name)}
            ${row('Email', body.email)}
            ${row('Phone', body.phone)}
            ${row('Location', body.location)}
            ${row('Guests', body.guests)}
            ${row('Budget', body.budget)}
            ${row('Package', body.packageInterest)}
            ${row('Timeline', body.urgency)}
            ${row('Occasion', body.occasion)}
          </table>

          <div style="margin-top:24px;color:#efe6d4;">
            <p style="color:#c4a465;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;">
              Details
            </p>

            <p style="color:#efe6d4;line-height:1.7;">
              ${clean(body.details) || '—'}
            </p>
          </div>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from:
        'Plate The Umpqua <info@platetheumpqua.com>',

      to: ['platetheumpqua@gmail.com'],

      replyTo: email,

      subject,

      html,
    })

    if (result.error) {
      console.error(
        'Resend email error:',
        result.error,
      )
    }

    return NextResponse.json({
      success: true,
      inquiryID: inquiry.id,
      leadType,
      leadSource,
      emailID: result.data?.id,
    })
  } catch (err) {
    console.error('Inquiry route error:', err)

    return NextResponse.json(
      {
        success: false,
        message: 'Inquiry submission failed.',
      },
      {
        status: 500,
      },
    )
  }
}
