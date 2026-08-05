import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../../os.module.css'
import ClientForm from '@/components/os/ClientForm'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'

export const metadata: Metadata = {
  title: 'New client',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NewClientPage() {
  const user = await requirePlateOperator({ returnTo: '/os/clients/new' })
  const canWrite = canWriteOperational(asPlateUser(user))

  return (
    <div>
      <section className={`${styles.hero} ${styles.heroCompact}`} aria-label="New client">
        <p className={styles.heroDate}>Relationship workspace</p>
        <h2 className={styles.heroGreeting}>Add client</h2>
        <p className={styles.heroLine}>
          Save contact basics here, then create invoices and events from Plate OS.
        </p>
        <div className={styles.actions}>
          <Link href="/os/clients" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to clients
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        {canWrite ? (
          <ClientForm mode="create" />
        ) : (
          <p className={styles.empty}>
            You can view clients, but creating requires operational write access.
          </p>
        )}
      </section>
    </div>
  )
}
