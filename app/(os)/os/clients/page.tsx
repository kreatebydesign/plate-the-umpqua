import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getFoundationCounts } from '@/lib/os/getTodayAtPlate'

export const metadata: Metadata = {
  title: 'Clients',
}

export const dynamic = 'force-dynamic'

export default async function ClientsFoundationPage() {
  const user = await requirePlateOperator({ returnTo: '/os/clients' })
  const counts = await getFoundationCounts(user)

  return (
    <div className={styles.foundation}>
      <p className={styles.foundationLead}>
        Clients are the people and partners behind every Plate experience—guests,
        realtors, executives, and hospitality collaborators.
      </p>

      {counts.errors.find((e) => e.section === 'clients') ? (
        <p className={styles.sectionError}>
          {counts.errors.find((e) => e.section === 'clients')?.message}
        </p>
      ) : (
        <p className={styles.countPill}>
          <span className={styles.countNumber}>{counts.clients ?? '—'}</span>
          <span className={styles.countLabel}>client records</span>
        </p>
      )}

      <p className={styles.foundationNote}>
        Relationship history, preferences, and private notes stay in Payload Admin.
        Dietary details are never shown on this overview layer.
      </p>

      <div className={styles.actions}>
        <Link href="/admin/collections/clients" className={styles.button}>
          Open clients in Admin
        </Link>
        <Link href="/os" className={`${styles.button} ${styles.buttonQuiet}`}>
          Back to Today
        </Link>
      </div>
    </div>
  )
}
