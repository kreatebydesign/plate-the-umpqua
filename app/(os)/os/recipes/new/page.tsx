import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../../os.module.css'
import RecipeForm from '@/components/os/RecipeForm'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, canWriteCulinary, isDirector } from '@/lib/access/roles'

export const metadata: Metadata = {
  title: 'New recipe',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NewRecipePage() {
  const user = await requirePlateOperator({ returnTo: '/os/recipes/new' })
  const canWrite = canWriteCulinary(asPlateUser(user))

  return (
    <div>
      <section className={`${styles.hero} ${styles.heroCompact}`} aria-label="New recipe">
        <p className={styles.heroDate}>Culinary library</p>
        <h2 className={styles.heroGreeting}>Add recipe</h2>
        <p className={styles.heroLine}>
          Recipes default to private. Mark menu-ready when a dish is suitable for
          client menus.
        </p>
        <div className={styles.actions}>
          <Link href="/os/recipes" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to recipes
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        {canWrite ? (
          <RecipeForm
            mode="create"
            canSeeCostNotes={isDirector(asPlateUser(user))}
          />
        ) : (
          <p className={styles.empty}>
            You can view recipes, but creating requires culinary write access.
          </p>
        )}
      </section>
    </div>
  )
}
