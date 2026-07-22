import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getFoundationCounts } from '@/lib/os/getTodayAtPlate'

export const metadata: Metadata = {
  title: 'Inquiries',
}

export const dynamic = 'force-dynamic'

export default async function InquiriesFoundationPage() {
  const user = await requirePlateOperator({ returnTo: '/os/inquiries' })
  const counts = await getFoundationCounts(user)

  return (
    <div className={styles.foundation}>
      <p className={styles.foundationLead}>
        Inquiries are the front door of Plate hospitality—private dining requests,
        partner concierge leads, and community partnership conversations.
      </p>

      {counts.errors.find((e) => e.section === 'inquiries') ? (
        <p className={styles.sectionError}>
          {counts.errors.find((e) => e.section === 'inquiries')?.message}
        </p>
      ) : (
        <p className={styles.countPill}>
          <span className={styles.countNumber}>{counts.inquiries ?? '—'}</span>
          <span className={styles.countLabel}>open in the pipeline</span>
        </p>
      )}

      <p className={styles.foundationNote}>
        Full pipeline management, ownership, and follow-up workflows arrive in a later
        release. For now, review and update inquiry records in Payload Admin.
      </p>

      <div className={styles.actions}>
        <Link href="/admin/collections/inquiries" className={styles.button}>
          Open inquiries in Admin
        </Link>
        <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
          Back to Today
        </Link>
      </div>
    </div>
  )
}
