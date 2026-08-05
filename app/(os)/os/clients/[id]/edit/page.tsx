import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../../os.module.css'
import ClientForm from '@/components/os/ClientForm'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { getClientDetail } from '@/lib/os/clients/clientQueries'

export const metadata: Metadata = {
  title: 'Edit client',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditClientPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await requirePlateOperator({ returnTo: `/os/clients/${id}/edit` })
  const canWrite = canWriteOperational(asPlateUser(user))
  const client = await getClientDetail(user, id)

  if (!client) {
    notFound()
  }

  return (
    <div>
      <section className={`${styles.hero} ${styles.heroCompact}`} aria-label="Edit client">
        <p className={styles.heroDate}>Relationship workspace</p>
        <h2 className={styles.heroGreeting}>Edit client</h2>
        <p className={styles.heroLine}>{client.fullName}</p>
        <div className={styles.actions}>
          <Link
            href={`/os/clients/${id}`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Back to client
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        {canWrite ? (
          <ClientForm
            mode="edit"
            clientId={id}
            initial={{
              fullName: client.fullName,
              email: client.email || '',
              phone: client.phone || '',
              instagram: client.instagram || '',
              clientType: client.clientType,
              vipStatus: client.vipStatus,
            }}
          />
        ) : (
          <p className={styles.empty}>
            You can view clients, but editing requires operational write access.
          </p>
        )}
      </section>
    </div>
  )
}
