import { getPartnerConciergeLeadBoard } from '@/lib/admin/partnerConciergeLeads'
import type { Payload } from 'payload'

const coreWorkflow = [
  {
    eyebrow: '01 / Partner CRM',
    title: 'Partner Concierge',
    body:
      'Review partner-program leads, follow up with professionals, and open inquiry records in one executive view.',
    href: '/admin/partners',
  },
  {
    eyebrow: '02 / Pipeline',
    title: 'Private Dining Inquiries',
    body:
      'Review new leads, qualify the experience, and move serious requests into proposal flow.',
    href: '/admin/collections/inquiries',
  },
  {
    eyebrow: '03 / Experiences',
    title: 'Curated Hospitality',
    body:
      'Shape chef-led dinners, estate gatherings, wine country moments, and private event structure.',
    href: '/admin/collections/experiences',
  },
  {
    eyebrow: '04 / Events',
    title: 'Execution Calendar',
    body:
      'Track confirmed experiences, service timing, prep notes, and operational details.',
    href: '/admin/collections/events',
  },
]

const operationsModules = [
  {
    label: 'Clients',
    value:
      'VIP status, preferred experience style, and relationship notes for every guest and partner.',
    href: '/admin/collections/clients',
  },
  {
    label: 'Experience Briefs',
    value:
      'Turn qualified inquiries into design-ready briefs before package and proposal work.',
    href: '/admin/collections/experience-briefs',
  },
  {
    label: 'Menu Concepts',
    value:
      'Culinary direction, seasonal menus, pairings, and service notes.',
    href: '/admin/collections/menu-concepts',
  },
  {
    label: 'Venues',
    value:
      'Estate locations, private homes, winery settings, and preferred service environments.',
    href: '/admin/collections/venues',
  },
  {
    label: 'Vendor Partners',
    value:
      'Trusted florals, rentals, wine partners, service staff, and hospitality support.',
    href: '/admin/collections/vendor-partners',
  },
  {
    label: 'Proposals',
    value:
      'Client-facing experience offers, approvals, scope, and premium presentation flow.',
    href: '/admin/collections/proposals',
  },
  {
    label: 'Brands',
    value:
      'Configure white-label hospitality instances for future KXD Hospitality OS clients.',
    href: '/admin/collections/brands',
  },
]

type DashboardProps = {
  payload: Payload
}

export default async function KXDHospitalityDashboard({
  payload,
}: DashboardProps) {
  const { stats, leads } = await getPartnerConciergeLeadBoard(payload)
  const recentLead = leads[0]

  return (
    <section className="kxd-hospitality-dashboard">
      <div className="kxd-hospitality-hero">
        <div className="kxd-hospitality-hero__content">
          <div className="kxd-hospitality-kicker">
            KXD Hospitality OS
          </div>

          <h1>Plate The Umpqua</h1>

          <p>
            A private operating layer for Martin&apos;s culinary experiences,
            partner concierge leads, estate hospitality, client inquiries,
            vendor relationships, and premium event execution across the
            Umpqua Valley.
          </p>

          <div className="kxd-hospitality-actions">
            <a href="/admin/partners">
              Open Partner Concierge CRM
            </a>

            <a href="/admin/collections/inquiries/create">
              New Inquiry
            </a>

            <a href="/admin/collections/events/create">
              New Event
            </a>

            <a href="/admin/collections/proposals/create">
              New Proposal
            </a>
          </div>
        </div>

        <aside className="kxd-hospitality-hero__signal">
          <span>Partner Concierge</span>

          <strong>{stats.total}</strong>

          <p>
            {stats.newLeads > 0
              ? `${stats.newLeads} new partner lead${stats.newLeads === 1 ? '' : 's'} waiting for follow-up.`
              : 'No new partner leads right now. Drive traffic to /partner-concierge to fill the pipeline.'}
          </p>

          {recentLead ? (
            <a href={recentLead.inquiryUrl}>
              Review latest lead
            </a>
          ) : (
            <a href="/partner-concierge">
              Open public partner page
            </a>
          )}
        </aside>
      </div>

      <div className="kxd-hospitality-metrics">
        <div>
          <span>Partner Leads</span>
          <strong>{stats.total}</strong>
        </div>

        <div>
          <span>New / Active</span>
          <strong>{stats.newLeads}</strong>
        </div>

        <div>
          <span>High Value</span>
          <strong>{stats.highValue}</strong>
        </div>

        <div>
          <span>Primary Flow</span>
          <strong>Inquiry → Proposal → Event</strong>
        </div>
      </div>

      <div className="kxd-hospitality-section">
        <div className="kxd-hospitality-section__header">
          <span>Core Workflow</span>
          <h2>
            Run the experience from first request to final service.
          </h2>
        </div>

        <div className="kxd-hospitality-primary-grid">
          {coreWorkflow.map((module) => (
            <a
              className="kxd-hospitality-primary-card"
              href={module.href}
              key={module.title}
            >
              <span>{module.eyebrow}</span>
              <strong>{module.title}</strong>
              <p>{module.body}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="kxd-hospitality-lower-grid">
        <div className="kxd-hospitality-panel">
          <div className="kxd-hospitality-panel__header">
            <span>Operations</span>
            <h2>Hospitality modules</h2>
          </div>

          <div className="kxd-hospitality-module-list">
            {operationsModules.map((module) => (
              <a href={module.href} key={module.label}>
                <strong>{module.label}</strong>
                <span>{module.value}</span>
              </a>
            ))}
          </div>
        </div>

        <aside className="kxd-hospitality-panel kxd-hospitality-panel--dark">
          <span>Owner View</span>

          <h2>
            Built for Martin to move clean, fast, and premium.
          </h2>

          <p>
            This admin is designed to keep the business organized without
            making the work feel technical. Every module supports hospitality
            clarity: what came in, what needs attention, what is booked, and
            what needs to be prepared next.
          </p>

          {stats.total > 0 && (
            <p>
              {stats.highValue} high-value partner{' '}
              {stats.highValue === 1 ? 'opportunity is' : 'opportunities are'}{' '}
              ready for concierge follow-up.
            </p>
          )}

          <a href="/admin/collections/tasks">
            View Tasks
          </a>
        </aside>
      </div>
    </section>
  )
}
