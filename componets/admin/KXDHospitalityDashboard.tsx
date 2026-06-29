const primaryModules = [
    {
      eyebrow: '01 / Pipeline',
      title: 'Private Dining Inquiries',
      body: 'Review new leads, qualify the experience, and move serious requests into proposal flow.',
      href: '/admin/collections/inquiries',
    },
    {
      eyebrow: '02 / Experiences',
      title: 'Curated Hospitality',
      body: 'Shape chef-led dinners, estate gatherings, wine country moments, and private event structure.',
      href: '/admin/collections/experiences',
    },
    {
      eyebrow: '03 / Events',
      title: 'Execution Calendar',
      body: 'Track confirmed experiences, service timing, prep notes, and operational details.',
      href: '/admin/collections/events',
    },
  ]
  
  const operationsModules = [
    {
      label: 'Menu Concepts',
      value: 'Culinary direction, seasonal menus, pairings, and service notes.',
      href: '/admin/collections/menu-concepts',
    },
    {
      label: 'Venues',
      value: 'Estate locations, private homes, winery settings, and preferred service environments.',
      href: '/admin/collections/venues',
    },
    {
      label: 'Vendor Partners',
      value: 'Trusted florals, rentals, wine partners, service staff, and hospitality support.',
      href: '/admin/collections/vendor-partners',
    },
    {
      label: 'Proposals',
      value: 'Client-facing experience offers, approvals, scope, and premium presentation flow.',
      href: '/admin/collections/proposals',
    },
  ]
  
  export default function KXDHospitalityDashboard() {
    return (
      <section className="kxd-hospitality-dashboard">
        <div className="kxd-hospitality-hero">
          <div className="kxd-hospitality-hero__content">
            <div className="kxd-hospitality-kicker">KXD Hospitality OS</div>
  
            <h1>Plate The Umpqua</h1>
  
            <p>
              A private operating layer for Martin&apos;s culinary experiences,
              estate hospitality, client inquiries, vendor relationships, and
              premium event execution across the Umpqua Valley.
            </p>
  
            <div className="kxd-hospitality-actions">
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
  
          <div className="kxd-hospitality-hero__signal">
            <span>Private Hospitality Infrastructure</span>
  
            <strong>Live Operating Dashboard</strong>
  
            <p>
              Built by Kreate by Design for refined hospitality brands that need
              their backend to feel as intentional as the guest experience.
            </p>
          </div>
        </div>
  
        <div className="kxd-hospitality-metrics">
          <div>
            <span>Active System</span>
            <strong>Hospitality OS</strong>
          </div>
  
          <div>
            <span>Primary Flow</span>
            <strong>Inquiry → Proposal → Event</strong>
          </div>
  
          <div>
            <span>Brand Layer</span>
            <strong>Plate The Umpqua</strong>
          </div>
        </div>
  
        <div className="kxd-hospitality-section">
          <div className="kxd-hospitality-section__header">
            <span>Core Workflow</span>
            <h2>Run the experience from first request to final service.</h2>
          </div>
  
          <div className="kxd-hospitality-primary-grid">
            {primaryModules.map((module) => (
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
  
          <div className="kxd-hospitality-panel kxd-hospitality-panel--dark">
            <span>Owner View</span>
  
            <h2>Built for Martin to move clean, fast, and premium.</h2>
  
            <p>
              This admin is designed to keep the business organized without making
              the work feel technical. Every module supports hospitality clarity:
              what came in, what needs attention, what is booked, and what needs
              to be prepared next.
            </p>
  
            <a href="/admin/collections/tasks">
              View Tasks
            </a>
          </div>
        </div>
      </section>
    )
  }