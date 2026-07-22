import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  clientMailtoHref,
  clientTelHref,
  getClientDetail,
} from '@/lib/os/clients/clientQueries'

export const metadata: Metadata = {
  title: 'Client',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function ClientDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await requirePlateOperator({ returnTo: `/os/clients/${id}` })
  const client = await getClientDetail(user, id)

  if (!client) {
    notFound()
  }

  const mailHref = clientMailtoHref(client.email)
  const phoneHref = clientTelHref(client.phone)

  return (
    <div className={styles.detailLayout}>
      <section className={styles.hero} aria-label="Client header">
        <p className={styles.heroDate}>{client.clientTypeLabel}</p>
        <h2 className={styles.heroGreeting}>{client.fullName}</h2>
        <p className={styles.heroLine}>
          {[client.vipStatusLabel, client.email, client.phone]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {client.needsAttention && client.attentionReason ? (
          <p className={styles.followHint}>{client.attentionReason}</p>
        ) : null}
        <div className={styles.actions}>
          <Link href="/os/clients" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to clients
          </Link>
          {client.canManageInAdmin ? (
            <Link
              href={client.adminHref}
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="contact-title">
          <h2 id="contact-title" className={styles.panelTitle}>
            Contact
          </h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Name</dt>
              <dd>{client.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                {mailHref && client.email ? (
                  <a href={mailHref} aria-label={`Email ${client.fullName}`}>
                    {client.email}
                  </a>
                ) : (
                  client.email || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {phoneHref && client.phone ? (
                  <a href={phoneHref} aria-label={`Call ${client.fullName}`}>
                    {client.phone}
                  </a>
                ) : (
                  client.phone || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>{client.instagram || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="profile-title">
          <h2 id="profile-title" className={styles.panelTitle}>
            Profile
          </h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Client type</dt>
              <dd>{client.clientTypeLabel}</dd>
            </div>
            <div>
              <dt>Relationship level</dt>
              <dd>{client.vipStatusLabel}</dd>
            </div>
            <div>
              <dt>Preferred experience styles</dt>
              <dd>
                {client.preferredExperienceStyles.length > 0
                  ? client.preferredExperienceStyles.join(', ')
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{client.createdLabel}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{client.updatedLabel}</dd>
            </div>
          </dl>
          <p className={styles.fieldHint}>
            This workspace is read-only. Private relationship notes, strategy
            notes, and spend ranges remain in Payload Admin.
          </p>
        </section>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="upcoming-title">
          <div className={styles.panelHeader}>
            <h2 id="upcoming-title" className={styles.panelTitle}>
              Upcoming events
            </h2>
            <p className={styles.panelAction}>
              {client.upcomingEventTotal != null
                ? `${client.upcomingEventTotal} total`
                : '—'}
            </p>
          </div>
          {client.upcomingEvents.length === 0 ? (
            <p className={styles.empty}>
              No upcoming active events are linked to this client.
            </p>
          ) : (
            <ul className={styles.inquiryList}>
              {client.upcomingEvents.map((event) => (
                <li key={event.id} className={styles.inquiryItem}>
                  <Link href={event.href} className={styles.inquiryLink}>
                    <p className={styles.listTitle}>{event.name}</p>
                    <p className={styles.listMeta}>
                      {[event.dateLabel, event.statusLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="open-inq-title">
          <div className={styles.panelHeader}>
            <h2 id="open-inq-title" className={styles.panelTitle}>
              Open inquiries
            </h2>
            <p className={styles.panelAction}>
              {client.openInquiryTotal != null
                ? `${client.openInquiryTotal} total`
                : '—'}
            </p>
          </div>
          {client.openInquiries.length === 0 ? (
            <p className={styles.empty}>
              No open inquiries are linked to this client.
            </p>
          ) : (
            <ul className={styles.inquiryList}>
              {client.openInquiries.map((inquiry) => (
                <li key={inquiry.id} className={styles.inquiryItem}>
                  <Link href={inquiry.href} className={styles.inquiryLink}>
                    <p className={styles.listTitle}>{inquiry.title}</p>
                    <p className={styles.listMeta}>
                      {[inquiry.statusLabel, inquiry.receivedLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="past-title">
          <div className={styles.panelHeader}>
            <h2 id="past-title" className={styles.panelTitle}>
              Past events
            </h2>
            <p className={styles.panelAction}>
              {client.pastEventTotal != null
                ? `${client.pastEventTotal} total`
                : '—'}
            </p>
          </div>
          {client.pastEvents.length === 0 ? (
            <p className={styles.empty}>
              No past events are linked to this client.
            </p>
          ) : (
            <ul className={styles.inquiryList}>
              {client.pastEvents.map((event) => (
                <li key={event.id} className={styles.inquiryItem}>
                  <Link href={event.href} className={styles.inquiryLink}>
                    <p className={styles.listTitle}>{event.name}</p>
                    <p className={styles.listMeta}>
                      {[event.dateLabel, event.statusLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="recent-inq-title">
          <div className={styles.panelHeader}>
            <h2 id="recent-inq-title" className={styles.panelTitle}>
              Recent inquiries
            </h2>
          </div>
          {client.recentInquiries.length === 0 ? (
            <p className={styles.empty}>
              No inquiries are linked to this client yet.
            </p>
          ) : (
            <ul className={styles.inquiryList}>
              {client.recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className={styles.inquiryItem}>
                  <Link href={inquiry.href} className={styles.inquiryLink}>
                    <p className={styles.listTitle}>{inquiry.title}</p>
                    <p className={styles.listMeta}>
                      {[inquiry.statusLabel, inquiry.receivedLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
