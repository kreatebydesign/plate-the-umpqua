import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../../os.module.css'
import MenuBuilderForm from '@/components/os/MenuBuilderForm'
import { asPlateUser, canWriteCulinary } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  listClientOptions,
  listEventOptions,
  listInquiryOptions,
} from '@/lib/os/menus/menuQueries'
import { listMenuReadyRecipes } from '@/lib/os/recipes/recipeQueries'

export const metadata: Metadata = {
  title: 'New menu',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NewMenuPage() {
  const user = await requirePlateOperator({ returnTo: '/os/menus/new' })
  const canWrite = canWriteCulinary(asPlateUser(user))
  const [clients, inquiries, events, recipes] = await Promise.all([
    listClientOptions(user),
    listInquiryOptions(user),
    listEventOptions(user),
    listMenuReadyRecipes(user),
  ])

  return (
    <div>
      <section className={`${styles.hero} ${styles.heroCompact}`} aria-label="New menu">
        <p className={styles.heroDate}>Client presentations</p>
        <h2 className={styles.heroGreeting}>New menu</h2>
        <p className={styles.heroLine}>
          Choose a structure, link a client, compose the courses, and save before
          sending for review.
        </p>
        <div className={styles.actions}>
          <Link href="/os/menus" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to menus
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        {canWrite ? (
          <MenuBuilderForm
            mode="create"
            clients={clients}
            inquiries={inquiries}
            events={events}
            recipes={recipes}
          />
        ) : (
          <p className={styles.empty}>
            You can view menus, but creating requires culinary write access.
          </p>
        )}
      </section>
    </div>
  )
}
