import {
  getPartnerConciergeLeadBoard,
  type PartnerLeadRow,
} from '@/lib/admin/partnerConciergeLeads'

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail: string
}) {
  return (
    <article className="kxd-partner-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function LeadCard({ lead }: { lead: PartnerLeadRow }) {
  return (
    <article className="kxd-partner-lead-card">
      <div className="kxd-partner-lead-card__top">
        <div>
          <p className="kxd-partner-lead-card__eyebrow">
            {lead.isNew ? 'New Partner Lead' : lead.statusLabel}
          </p>

          <h3>{lead.contactName}</h3>

          <p className="kxd-partner-lead-card__title">
            {lead.eventTitle}
          </p>
        </div>

        <div className="kxd-partner-lead-card__badges">
          {lead.isHighValue && (
            <span className="kxd-partner-badge kxd-partner-badge--gold">
              High Value
            </span>
          )}

          {lead.isNew && (
            <span className="kxd-partner-badge kxd-partner-badge--new">
              Follow Up
            </span>
          )}
        </div>
      </div>

      <dl className="kxd-partner-lead-card__meta">
        <div>
          <dt>Email</dt>
          <dd>{lead.email}</dd>
        </div>

        <div>
          <dt>Phone</dt>
          <dd>{lead.phone || '—'}</dd>
        </div>

        <div>
          <dt>Audience</dt>
          <dd>{lead.audience || '—'}</dd>
        </div>

        <div>
          <dt>Budget</dt>
          <dd>{lead.budget || '—'}</dd>
        </div>

        <div>
          <dt>Timeframe</dt>
          <dd>{lead.timeframe || lead.eventDate || '—'}</dd>
        </div>

        <div>
          <dt>Created</dt>
          <dd>{lead.createdLabel}</dd>
        </div>
      </dl>

      <div className="kxd-partner-lead-card__footer">
        <span>{lead.statusLabel}</span>

        <a href={lead.inquiryUrl}>
          Open Inquiry
        </a>
      </div>
    </article>
  )
}

function LeadTable({ leads }: { leads: PartnerLeadRow[] }) {
  return (
    <div className="kxd-partner-table-wrap">
      <table className="kxd-partner-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Audience</th>
            <th>Budget</th>
            <th>Timeframe</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <strong>{lead.contactName}</strong>
                <span>{lead.eventTitle}</span>
              </td>

              <td>{lead.email}</td>
              <td>{lead.phone || '—'}</td>
              <td>{lead.audience || '—'}</td>
              <td>{lead.budget || '—'}</td>
              <td>{lead.timeframe || lead.eventDate || '—'}</td>

              <td>
                <span
                  className={`kxd-partner-table__status ${
                    lead.isNew
                      ? 'kxd-partner-table__status--new'
                      : ''
                  }`}
                >
                  {lead.statusLabel}
                </span>
              </td>

              <td>{lead.createdLabel}</td>

              <td>
                <a href={lead.inquiryUrl}>
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function PartnerConciergeDashboard() {
  const { leads, stats } = await getPartnerConciergeLeadBoard()

  return (
    <div className="kxd-partner-dashboard">
      <section className="kxd-partner-hero">
        <div>
          <p className="kxd-partner-kicker">
            Partner Concierge CRM
          </p>

          <h1>
            Professional relationship leads, ready for follow-up.
          </h1>

          <p>
            Every record below came from the Partner Concierge Program
            channel. Review contact details, budget signals, and inquiry
            status — then open the Payload record to move the conversation
            forward.
          </p>
        </div>

        <div className="kxd-partner-hero__actions">
          <a href="/admin">
            Back to Command Center
          </a>

          <a href="/partner-concierge">
            Public Partner Page
          </a>
        </div>
      </section>

      <section className="kxd-partner-stats">
        <StatCard
          label="Total Partner Leads"
          value={stats.total}
          detail="All inquiries tagged partner-concierge"
        />

        <StatCard
          label="New / Active"
          value={stats.newLeads}
          detail="Leads still in new or discovery-needed status"
        />

        <StatCard
          label="High Value"
          value={stats.highValue}
          detail="VIP priority or $2,000+ budget signal"
        />

        <StatCard
          label="VIP Priority"
          value={stats.vipPriority}
          detail="Flagged for concierge-level handling"
        />
      </section>

      <section className="kxd-partner-board">
        <div className="kxd-partner-board__header">
          <div>
            <span>Recent Partner Inquiries</span>
            <h2>
              {stats.total > 0
                ? 'Latest leads from /partner-concierge'
                : 'No partner leads yet'}
            </h2>
          </div>

          <a href="/admin/collections/inquiries?where[leadSource][equals]=partner-concierge">
            Open filtered list
          </a>
        </div>

        {leads.length === 0 ? (
          <div className="kxd-partner-empty">
            <p className="kxd-partner-empty__eyebrow">
              Pipeline Empty
            </p>

            <h3>
              Drive professionals to the Partner Concierge page.
            </h3>

            <p>
              Share <strong>/partner-concierge</strong> with realtors,
              wealth managers, medical practices, attorneys, and executive
              teams. When they submit an inquiry, the lead will appear
              here automatically with Partner Concierge source tracking.
            </p>

            <div className="kxd-partner-empty__actions">
              <a href="/partner-concierge">
                View public page
              </a>

              <a href="/admin/collections/inquiries/create">
                Create inquiry manually
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="kxd-partner-cards">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>

            <LeadTable leads={leads} />
          </>
        )}
      </section>
    </div>
  )
}
