import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getTodayAtPlate } from '@/lib/os/getTodayAtPlate'
import { firstNameFrom, formatLongDate, greetingForHour } from '@/lib/os/formatDate'

export const metadata: Metadata = {
  title: 'Today at Plate',
}

export const dynamic = 'force-dynamic'

function attentionCopy(counts: {
  newInquiries: number
  overdueTasks: number
  upcomingEvents: number
}): string {
  const parts: string[] = []
  if (counts.overdueTasks > 0) {
    parts.push(
      `${counts.overdueTasks} overdue task${counts.overdueTasks === 1 ? '' : 's'}`,
    )
  }
  if (counts.newInquiries > 0) {
    parts.push(
      `${counts.newInquiries} new inquir${counts.newInquiries === 1 ? 'y' : 'ies'} waiting`,
    )
  }
  if (counts.upcomingEvents > 0) {
    parts.push(
      `${counts.upcomingEvents} upcoming event${counts.upcomingEvents === 1 ? '' : 's'}`,
    )
  }
  if (parts.length === 0) {
    return 'The board is clear for now. A good moment to refine upcoming hospitality or check Payload Admin.'
  }
  return `Focus today: ${parts.join(' · ')}.`
}

export default async function TodayAtPlatePage() {
  const user = await requirePlateOperator({ returnTo: '/os' })
  const data = await getTodayAtPlate(user)
  const firstName = firstNameFrom(user.fullName, user.email)
  const greeting = greetingForHour()

  return (
    <div>
      <section className={styles.hero} aria-label="Welcome">
        <p className={styles.heroDate}>{formatLongDate(new Date())}</p>
        <h2 className={styles.heroGreeting}>
          {greeting}, {firstName}
        </h2>
        <p className={styles.heroLine}>{attentionCopy(data.counts)}</p>
      </section>

      {data.sectionErrors.length > 0 ? (
        <div className={styles.panel} style={{ marginBottom: '1rem' }}>
          {data.sectionErrors.map((error) => (
            <p key={error.section} className={styles.sectionError}>
              {error.message}
            </p>
          ))}
        </div>
      ) : null}

      <section className={styles.metrics} aria-label="Operational summary">
        <Link href="/os/inquiries?pipeline=new" className={styles.metricCard}>
          <p className={styles.metricLabel}>New inquiries</p>
          <p className={styles.metricValue}>{data.counts.newInquiries}</p>
          <p className={styles.metricHint}>
            {data.counts.openInquiries} open in pipeline
          </p>
        </Link>
        <Link href="/os/events?pipeline=upcoming" className={styles.metricCard}>
          <p className={styles.metricLabel}>Upcoming events</p>
          <p className={styles.metricValue}>{data.counts.upcomingEvents}</p>
          <p className={styles.metricHint}>Active dates ahead</p>
        </Link>
        <Link href="/admin/collections/tasks" className={styles.metricCard}>
          <p className={styles.metricLabel}>Open tasks</p>
          <p className={styles.metricValue}>{data.counts.openTasks}</p>
          <p className={styles.metricHint}>Across hospitality ops</p>
        </Link>
        <Link href="/admin/collections/tasks" className={styles.metricCard}>
          <p className={styles.metricLabel}>Overdue tasks</p>
          <p className={styles.metricValue}>{data.counts.overdueTasks}</p>
          <p className={styles.metricHint}>Past due, still open</p>
        </Link>
      </section>

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="attention-title">
          <div className={styles.panelHeader}>
            <h2 id="attention-title" className={styles.panelTitle}>
              Needs attention
            </h2>
          </div>
          {data.attention.length === 0 ? (
            <p className={styles.empty}>
              Nothing urgent is waiting. New inquiries, overdue tasks, and near-term
              planning events will appear here.
            </p>
          ) : (
            <ul className={styles.list}>
              {data.attention.map((item) => (
                <li key={item.id} className={styles.listItem}>
                  <a href={item.href} className={styles.listLink}>
                    <p className={styles.listTitle}>{item.title}</p>
                    <p className={styles.listMeta}>{item.meta}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="actions-title">
          <div className={styles.panelHeader}>
            <h2 id="actions-title" className={styles.panelTitle}>
              Quick actions
            </h2>
          </div>
          <div className={styles.actions}>
            <Link href="/os/inquiries" className={styles.button}>
              View inquiries
            </Link>
            <Link href="/os/events" className={`${styles.button} ${styles.buttonQuiet}`}>
              View events
            </Link>
            <Link href="/os/clients" className={`${styles.button} ${styles.buttonQuiet}`}>
              View clients
            </Link>
            <Link
              href="/admin/collections/inquiries/create"
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              New inquiry in Admin
            </Link>
            <Link href="/" className={`${styles.button} ${styles.buttonQuiet}`}>
              Public website
            </Link>
          </div>
          <p className={styles.empty}>
            Record creation and detailed editing stay in Payload Admin for now.
          </p>
        </section>
      </div>

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="events-title">
          <div className={styles.panelHeader}>
            <h2 id="events-title" className={styles.panelTitle}>
              Upcoming events
            </h2>
            <Link href="/os/events" className={styles.panelAction}>
              Open module
            </Link>
          </div>
          {data.upcomingEvents.length === 0 ? (
            <p className={styles.empty}>
              No upcoming active events are scheduled. Confirmed dates will land here.
            </p>
          ) : (
            <ul className={styles.list}>
              {data.upcomingEvents.map((event) => (
                <li key={event.id} className={styles.listItem}>
                  <a href={event.adminHref} className={styles.listLink}>
                    <p className={styles.listTitle}>{event.name}</p>
                    <p className={styles.listMeta}>
                      {[
                        event.dateLabel,
                        event.statusLabel,
                        event.guestCount != null ? `${event.guestCount} guests` : null,
                        event.venueName,
                        event.clientName,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </a>
                  {event.clientHref ? (
                    <Link
                      href={event.clientHref}
                      className={styles.panelAction}
                      style={{ display: 'inline-flex', marginTop: '0.35rem' }}
                    >
                      View client
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="inquiries-title">
          <div className={styles.panelHeader}>
            <h2 id="inquiries-title" className={styles.panelTitle}>
              Recent inquiries
            </h2>
            <Link href="/os/inquiries" className={styles.panelAction}>
              Open module
            </Link>
          </div>
          {data.recentInquiries.length === 0 ? (
            <p className={styles.empty}>
              No open inquiries in the pipeline. New website and partner requests will
              appear here.
            </p>
          ) : (
            <ul className={styles.list}>
              {data.recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className={styles.listItem}>
                  <a href={inquiry.adminHref} className={styles.listLink}>
                    <p className={styles.listTitle}>{inquiry.title}</p>
                    <p className={styles.listMeta}>
                      {[
                        inquiry.statusLabel,
                        inquiry.sourceLabel,
                        inquiry.receivedLabel,
                        inquiry.clientName,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </a>
                  {inquiry.clientHref ? (
                    <Link
                      href={inquiry.clientHref}
                      className={styles.panelAction}
                      style={{ display: 'inline-flex', marginTop: '0.35rem' }}
                    >
                      View client
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
