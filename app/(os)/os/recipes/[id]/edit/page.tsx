import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../../os.module.css'
import RecipeForm from '@/components/os/RecipeForm'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getRecipeDetail } from '@/lib/os/recipes/recipeQueries'

export const metadata: Metadata = {
  title: 'Edit recipe',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditRecipePage({ params }: { params: Params }) {
  const user = await requirePlateOperator({ returnTo: '/os/recipes' })
  const { id } = await params
  const recipe = await getRecipeDetail(user, id)
  if (!recipe) notFound()

  return (
    <div>
      <section className={styles.hero} aria-label="Edit recipe">
        <p className={styles.heroDate}>Culinary library</p>
        <h2 className={styles.heroGreeting}>Edit recipe</h2>
        <p className={styles.heroLine}>{recipe.name}</p>
        <div className={styles.actions}>
          <Link
            href={`/os/recipes/${recipe.id}`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Back to recipe
          </Link>
        </div>
      </section>

      <section className={styles.panel}>
        {recipe.canWrite ? (
          <RecipeForm
            mode="edit"
            recipeId={recipe.id}
            initial={recipe}
            canSeeCostNotes={recipe.canSeeCostNotes}
          />
        ) : (
          <p className={styles.empty}>
            You can view this recipe, but editing requires culinary write access.
          </p>
        )}
      </section>
    </div>
  )
}
