import { getPartnerConciergeLeadBoard } from '@/lib/admin/partnerConciergeLeads'

export default async function KXDHospitalityDashboard() {
  const { stats, leads } = await getPartnerConciergeLeadBoard()
  const recentLead = leads[0]

  return (
    <div className="kxd-hospitality-dashboard">
      <section className="kxd-hospitality-hero">
        <div>
          <p className="kxd-hospitality-kicker">
            KXD Hospitality OS
          </p>

          <h1>
            Private hospitality command center.
          </h1>

          <p>
            Track partner leads, inquiry flow, and experience development
            for Plate The Umpqua — built to scale across future
            white-label hospitality brands.
          </p>

          <div className="kxd-hospitality-actions">
            <a href="/admin/partners">
              Open Partner Concierge CRM
            </a>

            <a href="/admin/collections/inquiries">
              View All Inquiries
            </a>
          </div>
        </div>

        <aside className="kxd-hospitality-hero__signal">
          <div>
            <span>Partner Concierge</span>

            <strong>{stats.total}</strong>

            <p>
              {stats.newLeads > 0
                ? `${stats.newLeads} new partner lead${stats.newLeads === 1 ? '' : 's'} waiting for follow-up.`
                : 'No new partner leads right now. Drive traffic to /partner-concierge to fill the pipeline.'}
            </p>
          </div>

          {recentLead && (
            <a href={recentLead.inquiryUrl}>
              Review latest lead
            </a>
          )}
        </aside>
      </section>

      <section className="kxd-hospitality-metrics">
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
      </section>

      <section>
        <div className="kxd-hospitality-section__header">
          <span>Experience OS</span>
          <h2>Move from inquiry to booked hospitality.</h2>
        </div>

        <div className="kxd-hospitality-primary-grid">
          <a
            className="kxd-hospitality-primary-card"
            href="/admin/partners"
          >
            <span>01 / Partner CRM</span>
            <strong>Partner Concierge</strong>
            <p>
              Review partner-program leads, follow up with professionals,
              and open inquiry records in one executive view.
            </p>
          </a>

          <a
            className="kxd-hospitality-primary-card"
            href="/admin/collections/inquiries"
          >
            <span>02 / Pipeline</span>
            <strong>Inquiries</strong>
            <p>
              Manage discovery, briefs, packages, and proposal stages
              across every hospitality channel.
            </p>
          </a>

          <a
            className="kxd-hospitality-primary-card"
            href="/admin/collections/clients"
          >
            <span>03 / Relationships</span>
            <strong>Clients</strong>
            <p>
              Track VIP status, preferred experience style, and
              relationship notes for every guest and partner.
            </p>
          </a>
        </div>
      </section>

      <section className="kxd-hospitality-lower-grid">
        <div className="kxd-hospitality-panel">
          <div className="kxd-hospitality-panel__header">
            <span>Modules</span>
            <h2>Operating layers</h2>
          </div>

          <div className="kxd-hospitality-module-list">
            <a href="/admin/collections/experience-briefs">
              <strong>Experience Briefs</strong>
              <span>
                Turn qualified inquiries into design-ready briefs.
              </span>
            </a>

            <a href="/admin/collections/experiences">
              <strong>Experiences</strong>
              <span>
                Manage production, margin guardrails, and event flow.
              </span>
            </a>

            <a href="/admin/collections/proposals">
              <strong>Proposals</strong>
              <span>
                Send polished hospitality proposals with confidence.
              </span>
            </a>

            <a href="/admin/collections/brands">
              <strong>Brands</strong>
              <span>
                Configure white-label hospitality instances for future clients.
              </span>
            </a>
          </div>
        </div>

        <aside className="kxd-hospitality-panel kxd-hospitality-panel--dark">
          <span>Partner Growth</span>

          <h2>
            {stats.total > 0
              ? `${stats.highValue} high-value partner opportunities`
              : 'Build the partner pipeline'}
          </h2>

          <p>
            Share the public Partner Concierge page with realtors,
            advisors, medical practices, and executive teams who need
            premium client appreciation experiences.
          </p>

          <a href="/partner-concierge">
            Open public partner page
          </a>
        </aside>
      </section>
    </div>
  )
}
