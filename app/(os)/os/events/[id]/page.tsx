import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getEventDetail } from '@/lib/os/events/eventQueries'
import EventOperationalForm from '@/components/os/EventOperationalForm'

export const metadata: Metadata = {
  title: 'Event',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await requirePlateOperator({ returnTo: `/os/events/${id}` })
  const event = await getEventDetail(user, id)

  if (!event) {
    notFound()
  }

  return (
    <div className={styles.detailLayout}>
      <section className={styles.hero} aria-label="Event header">
        <p className={styles.heroDate}>{event.dateLabel}</p>
        <h2 className={styles.heroGreeting}>{event.name}</h2>
        <p className={styles.heroLine}>
          {[
            event.statusLabel,
            event.client.name,
            event.guestCount != null ? `${event.guestCount} guests` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {event.needsAttention && event.attentionReason ? (
          <p className={styles.followHint}>{event.attentionReason}</p>
        ) : null}
        <div className={styles.actions}>
          <Link href="/os/events" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to events
          </Link>
          {event.canEditOperational ? (
            <Link
              href={event.adminHref}
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="schedule-title">
          <h2 id="schedule-title" className={styles.panelTitle}>
            Schedule
          </h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Event date</dt>
              <dd>{event.dateLabel}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{event.statusLabel}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{event.guestCount != null ? event.guestCount : '—'}</dd>
            </div>
            <div>
              <dt>Package</dt>
              <dd>{event.packageName || '—'}</dd>
            </div>
          </dl>
          <p className={styles.fieldHint}>
            This collection stores a single event date. Separate start and end
            times are not available on the record.
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="client-title">
          <h2 id="client-title" className={styles.panelTitle}>
            Client
          </h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Name</dt>
              <dd>
                {event.clientOsHref && event.client.name ? (
                  <Link href={event.clientOsHref}>{event.client.name}</Link>
                ) : (
                  event.client.name || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                {event.client.email ? (
                  <a href={`mailto:${event.client.email}`}>{event.client.email}</a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {event.client.phone ? (
                  <a href={`tel:${event.client.phone.replace(/[^\d+]/g, '')}`}>
                    {event.client.phone}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
          {(event.clientOsHref ||
            (event.canEditOperational && event.clientAdminHref)) && (
            <div className={styles.actions} style={{ marginTop: '0.85rem' }}>
              {event.clientOsHref ? (
                <Link
                  href={event.clientOsHref}
                  className={`${styles.button} ${styles.buttonQuiet}`}
                >
                  Open client record
                </Link>
              ) : null}
              {event.canEditOperational && event.clientAdminHref ? (
                <Link
                  href={event.clientAdminHref}
                  className={`${styles.button} ${styles.buttonQuiet}`}
                >
                  Open client in Admin
                </Link>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="venue-title">
        <h2 id="venue-title" className={styles.panelTitle}>
          Venue
        </h2>
        <dl className={styles.detailList}>
          <div>
            <dt>Name</dt>
            <dd>{event.venue.name || '—'}</dd>
          </div>
          <div>
            <dt>Region</dt>
            <dd>{event.venue.region || '—'}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{event.venue.address || '—'}</dd>
          </div>
        </dl>
      </section>

      {event.arrivalInstructions ? (
        <section className={styles.panel} aria-labelledby="arrival-title">
          <h2 id="arrival-title" className={styles.panelTitle}>
            Arrival instructions
          </h2>
          <p className={styles.visionCopy}>{event.arrivalInstructions}</p>
        </section>
      ) : null}

      {event.specialMoments ? (
        <section className={styles.panel} aria-labelledby="moments-title">
          <h2 id="moments-title" className={styles.panelTitle}>
            Special moments
          </h2>
          <p className={styles.visionCopy}>{event.specialMoments}</p>
        </section>
      ) : null}

      {event.timelineNotes ? (
        <section className={styles.panel} aria-labelledby="timeline-title">
          <h2 id="timeline-title" className={styles.panelTitle}>
            Timeline notes
          </h2>
          <p className={styles.visionCopy}>{event.timelineNotes}</p>
        </section>
      ) : null}

      <section className={styles.panel} aria-labelledby="ops-title">
        <h2 id="ops-title" className={styles.panelTitle}>
          Operational status
        </h2>
        {event.canEditOperational ? (
          <EventOperationalForm
            eventId={event.id}
            initialStatus={String(event.status)}
          />
        ) : (
          <p className={styles.empty}>
            Status: {event.statusLabel}. You can review this event, but operational
            edits require director or curator access.
          </p>
        )}
      </section>
    </div>
  )
}
