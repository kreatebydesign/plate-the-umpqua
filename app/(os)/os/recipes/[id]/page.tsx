import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../os.module.css'
import { RecipeDuplicateButton } from '@/components/os/CulinaryActions'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getRecipeDetail } from '@/lib/os/recipes/recipeQueries'
import {
  RECIPE_COURSE_LABELS,
  RECIPE_CUISINE_LABELS,
  RECIPE_YIELD_UNIT_LABELS,
} from '@/lib/os/recipes/recipeConstants'

export const metadata: Metadata = {
  title: 'Recipe',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function RecipeDetailPage({
  params,
}: {
  params: Params
}) {
  const user = await requirePlateOperator({ returnTo: '/os/recipes' })
  const { id } = await params
  const recipe = await getRecipeDetail(user, id)
  if (!recipe) notFound()

  return (
    <div className={styles.detailLayout}>
      <section className={styles.hero} aria-label="Recipe detail">
        <p className={styles.heroDate}>Culinary library</p>
        <h2 className={styles.heroGreeting}>{recipe.name}</h2>
        <p className={styles.heroLine}>
          {recipe.shortDescription ||
            'Private recipe record for Plate culinary operations.'}
        </p>
        <div className={styles.actions}>
          <Link href="/os/recipes" className={`${styles.button} ${styles.buttonQuiet}`}>
            All recipes
          </Link>
          {recipe.canWrite ? (
            <Link href={`/os/recipes/${recipe.id}/edit`} className={styles.button}>
              Edit recipe
            </Link>
          ) : null}
          {recipe.canWrite ? <RecipeDuplicateButton recipeId={recipe.id} /> : null}
          {recipe.canManageInAdmin ? (
            <Link
              href={`/admin/collections/recipes/${recipe.id}`}
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Overview</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Status</dt>
              <dd>{recipe.statusLabel}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>{recipe.visibilityLabel}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{recipe.categoryLabel}</dd>
            </div>
            <div>
              <dt>Cuisine</dt>
              <dd>
                {recipe.cuisine
                  ? RECIPE_CUISINE_LABELS[
                      recipe.cuisine as keyof typeof RECIPE_CUISINE_LABELS
                    ] || recipe.cuisine
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Course</dt>
              <dd>
                {recipe.course
                  ? RECIPE_COURSE_LABELS[
                      recipe.course as keyof typeof RECIPE_COURSE_LABELS
                    ] || recipe.course
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Yield</dt>
              <dd>
                {recipe.yieldQuantity != null
                  ? `${recipe.yieldQuantity} ${
                      recipe.yieldUnit
                        ? RECIPE_YIELD_UNIT_LABELS[
                            recipe.yieldUnit as keyof typeof RECIPE_YIELD_UNIT_LABELS
                          ] || recipe.yieldUnit
                        : ''
                    }`.trim()
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>
                {[
                  recipe.prepTimeMinutes != null
                    ? `${recipe.prepTimeMinutes} min prep`
                    : null,
                  recipe.cookTimeMinutes != null
                    ? `${recipe.cookTimeMinutes} min cook`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tags</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Dietary</dt>
              <dd>{recipe.dietaryLabels.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt>Allergens</dt>
              <dd>{recipe.allergenLabels.join(', ') || '—'}</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>{recipe.slug || '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Ingredients</h2>
        {recipe.ingredients.length === 0 ? (
          <p className={styles.empty}>No ingredients recorded.</p>
        ) : (
          <ul className={styles.list}>
            {recipe.ingredients.map((row, index) => (
              <li key={row.id || index} className={styles.listMeta}>
                {[row.quantity, row.unit, row.ingredient]
                  .filter(Boolean)
                  .join(' ')}
                {row.preparationNote ? ` — ${row.preparationNote}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Preparation</h2>
        {recipe.steps.length === 0 ? (
          <p className={styles.empty}>No steps recorded.</p>
        ) : (
          <ol className={styles.list}>
            {recipe.steps.map((row, index) => (
              <li key={row.id || index} className={styles.visionCopy}>
                {row.instruction}
              </li>
            ))}
          </ol>
        )}
      </section>

      {(recipe.chefNotes || recipe.platingNotes || recipe.storageNotes) && (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            Culinary notes <span className={styles.internalBadge}>Internal</span>
          </h2>
          {recipe.chefNotes ? (
            <p className={styles.visionCopy}>{recipe.chefNotes}</p>
          ) : null}
          {recipe.platingNotes ? (
            <p className={styles.visionCopy}>{recipe.platingNotes}</p>
          ) : null}
          {recipe.storageNotes ? (
            <p className={styles.visionCopy}>{recipe.storageNotes}</p>
          ) : null}
        </section>
      )}

      {recipe.canSeeCostNotes && recipe.internalCostNotes ? (
        <section className={styles.panelSensitive}>
          <h2 className={styles.panelTitle}>Cost notes</h2>
          <p className={styles.visionCopy}>{recipe.internalCostNotes}</p>
        </section>
      ) : null}
    </div>
  )
}
