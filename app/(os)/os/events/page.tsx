import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getFoundationCounts } from '@/lib/os/getTodayAtPlate'

export const metadata: Metadata = {
  title: 'Events',
}

export const dynamic = 'force-dynamic'

export default async function EventsFoundationPage() {
  const user = await requirePlateOperator({ returnTo: '/os/events' })
  const counts = await getFoundationCounts(user)

  return (
    <div className={styles.foundation}>
      <p className={styles.foundationLead}>
        Events hold confirmed hospitality dates—guest counts, venues, and service status
        for evenings already on the calendar.
      </p>

      {counts.errors.find((e) => e.section === 'events') ? (
        <p className={styles.sectionError}>
          {counts.errors.find((e) => e.section === 'events')?.message}
        </p>
      ) : (
        <p className={styles.countPill}>
          <span className={styles.countNumber}>{counts.events ?? '—'}</span>
          <span className={styles.countLabel}>upcoming active events</span>
        </p>
      )}

      <p className={styles.foundationNote}>
        Day-of notes, vendor coordination, and full event editing remain in Payload Admin
        until the dedicated Events workspace ships.
      </p>

      <div className={styles.actions}>
        <Link href="/admin/collections/events" className={styles.button}>
          Open events in Admin
        </Link>
        <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
          Back to Today
        </Link>
      </div>
    </div>
  )
}
