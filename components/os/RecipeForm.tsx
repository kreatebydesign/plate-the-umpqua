'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useState, useTransition } from 'react'
import styles from '@/app/(os)/os.module.css'
import {
  createRecipe,
  updateRecipe,
} from '@/lib/os/recipes/mutateRecipe'
import {
  RECIPE_ALLERGEN_LABELS,
  RECIPE_ALLERGEN_VALUES,
  RECIPE_CATEGORY_LABELS,
  RECIPE_CATEGORY_VALUES,
  RECIPE_COURSE_LABELS,
  RECIPE_COURSE_VALUES,
  RECIPE_CUISINE_LABELS,
  RECIPE_CUISINE_VALUES,
  RECIPE_DIETARY_LABELS,
  RECIPE_DIETARY_VALUES,
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_VALUES,
  RECIPE_VISIBILITY_LABELS,
  RECIPE_VISIBILITY_VALUES,
  RECIPE_YIELD_UNIT_LABELS,
  RECIPE_YIELD_UNIT_VALUES,
} from '@/lib/os/recipes/recipeConstants'
import type { RecipeDetail } from '@/lib/os/recipes/recipeQueries'

type IngredientDraft = {
  key: string
  quantity: string
  unit: string
  ingredient: string
  preparationNote: string
}

type StepDraft = {
  key: string
  instruction: string
}

type FormState = {
  name: string
  shortDescription: string
  category: string
  cuisine: string
  course: string
  dietaryTags: string[]
  allergenTags: string[]
  yieldQuantity: string
  yieldUnit: string
  prepTimeMinutes: string
  cookTimeMinutes: string
  ingredients: IngredientDraft[]
  steps: StepDraft[]
  chefNotes: string
  platingNotes: string
  storageNotes: string
  internalCostNotes: string
  status: string
  visibility: string
  slug: string
  publicTitle: string
  publicSummary: string
  chefIntroduction: string
}

function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyIngredient(): IngredientDraft {
  return {
    key: newKey(),
    quantity: '',
    unit: '',
    ingredient: '',
    preparationNote: '',
  }
}

function emptyStep(): StepDraft {
  return { key: newKey(), instruction: '' }
}

function fromDetail(detail?: RecipeDetail | null): FormState {
  if (!detail) {
    return {
      name: '',
      shortDescription: '',
      category: '',
      cuisine: '',
      course: '',
      dietaryTags: [],
      allergenTags: [],
      yieldQuantity: '',
      yieldUnit: '',
      prepTimeMinutes: '',
      cookTimeMinutes: '',
      ingredients: [emptyIngredient()],
      steps: [emptyStep()],
      chefNotes: '',
      platingNotes: '',
      storageNotes: '',
      internalCostNotes: '',
      status: 'draft',
      visibility: 'private',
      slug: '',
      publicTitle: '',
      publicSummary: '',
      chefIntroduction: '',
    }
  }

  return {
    name: detail.name,
    shortDescription: detail.shortDescription || '',
    category: detail.category || '',
    cuisine: detail.cuisine || '',
    course: detail.course || '',
    dietaryTags: detail.dietaryTags,
    allergenTags: detail.allergenTags,
    yieldQuantity:
      detail.yieldQuantity != null ? String(detail.yieldQuantity) : '',
    yieldUnit: detail.yieldUnit || '',
    prepTimeMinutes:
      detail.prepTimeMinutes != null ? String(detail.prepTimeMinutes) : '',
    cookTimeMinutes:
      detail.cookTimeMinutes != null ? String(detail.cookTimeMinutes) : '',
    ingredients:
      detail.ingredients.length > 0
        ? detail.ingredients.map((row) => ({
            key: newKey(),
            quantity: row.quantity || '',
            unit: row.unit || '',
            ingredient: row.ingredient,
            preparationNote: row.preparationNote || '',
          }))
        : [emptyIngredient()],
    steps:
      detail.steps.length > 0
        ? detail.steps.map((row) => ({
            key: newKey(),
            instruction: row.instruction,
          }))
        : [emptyStep()],
    chefNotes: detail.chefNotes || '',
    platingNotes: detail.platingNotes || '',
    storageNotes: detail.storageNotes || '',
    internalCostNotes: detail.internalCostNotes || '',
    status: detail.status,
    visibility: detail.visibility,
    slug: detail.slug || '',
    publicTitle: detail.publicTitle || '',
    publicSummary: detail.publicSummary || '',
    chefIntroduction: detail.chefIntroduction || '',
  }
}

type Props = {
  mode: 'create' | 'edit'
  recipeId?: string
  initial?: RecipeDetail | null
  canSeeCostNotes?: boolean
}

export default function RecipeForm({
  mode,
  recipeId,
  initial,
  canSeeCostNotes = false,
}: Props) {
  const router = useRouter()
  const formId = useId()
  const [form, setForm] = useState<FormState>(() => fromDetail(initial))
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function patch(partial: Partial<FormState>) {
    setDirty(true)
    setMessage(null)
    setError(null)
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function toggleTag(
    field: 'dietaryTags' | 'allergenTags',
    value: string,
  ) {
    setDirty(true)
    setForm((prev) => {
      const set = new Set(prev[field])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      return { ...prev, [field]: Array.from(set) }
    })
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(null)
    setMessage(null)

    const formEl = event.currentTarget
    if (!formEl.checkValidity()) {
      const firstInvalid = formEl.querySelector<HTMLElement>(':invalid')
      firstInvalid?.focus()
      firstInvalid?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setError('Please complete the required fields before saving.')
      return
    }

    const payload = {
      name: form.name,
      shortDescription: form.shortDescription,
      category: form.category || null,
      cuisine: form.cuisine || null,
      course: form.course || null,
      dietaryTags: form.dietaryTags,
      allergenTags: form.allergenTags,
      yieldQuantity: form.yieldQuantity,
      yieldUnit: form.yieldUnit || null,
      prepTimeMinutes: form.prepTimeMinutes,
      cookTimeMinutes: form.cookTimeMinutes,
      ingredients: form.ingredients.map(({ quantity, unit, ingredient, preparationNote }) => ({
        quantity,
        unit,
        ingredient,
        preparationNote,
      })),
      steps: form.steps.map(({ instruction }) => ({ instruction })),
      chefNotes: form.chefNotes,
      platingNotes: form.platingNotes,
      storageNotes: form.storageNotes,
      status: form.status,
      visibility: form.visibility,
      slug: form.slug,
      publicTitle: form.publicTitle,
      publicSummary: form.publicSummary,
      chefIntroduction: form.chefIntroduction,
      ...(canSeeCostNotes
        ? { internalCostNotes: form.internalCostNotes }
        : {}),
    }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createRecipe(payload)
          : await updateRecipe(recipeId, payload)

      if (!result.ok) {
        setError(result.message)
        return
      }

      setDirty(false)
      setMessage('Recipe saved.')
      router.push(`/os/recipes/${result.id}`)
      router.refresh()
    })
  }

  return (
    <form
      id={formId}
      className={styles.builderForm}
      onSubmit={onSubmit}
      aria-busy={pending}
      noValidate
    >
      {dirty ? (
        <p className={styles.unsavedBanner} role="status">
          You have unsaved changes.
        </p>
      ) : null}

      <section className={styles.builderSection} aria-labelledby={`${formId}-basics`}>
        <h2 id={`${formId}-basics`} className={styles.builderSectionTitle}>
          Basics
        </h2>
        <div className={styles.builderGrid}>
          <label className={`${styles.fieldLabel} ${styles.fieldFull}`} htmlFor={`${formId}-name`}>
            Recipe name
            <input
              id={`${formId}-name`}
              className={styles.fieldControl}
              value={form.name}
              required
              disabled={pending}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </label>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-desc`}
          >
            Short description
            <textarea
              id={`${formId}-desc`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.shortDescription}
              disabled={pending}
              onChange={(e) => patch({ shortDescription: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-category`}>
            Category
            <select
              id={`${formId}-category`}
              className={styles.fieldControl}
              value={form.category}
              disabled={pending}
              onChange={(e) => patch({ category: e.target.value })}
            >
              <option value="">Select</option>
              {RECIPE_CATEGORY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {RECIPE_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-cuisine`}>
            Cuisine
            <select
              id={`${formId}-cuisine`}
              className={styles.fieldControl}
              value={form.cuisine}
              disabled={pending}
              onChange={(e) => patch({ cuisine: e.target.value })}
            >
              <option value="">Select</option>
              {RECIPE_CUISINE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {RECIPE_CUISINE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-course`}>
            Course
            <select
              id={`${formId}-course`}
              className={styles.fieldControl}
              value={form.course}
              disabled={pending}
              onChange={(e) => patch({ course: e.target.value })}
            >
              <option value="">Select</option>
              {RECIPE_COURSE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {RECIPE_COURSE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-status`}>
            Status
            <select
              id={`${formId}-status`}
              className={styles.fieldControl}
              value={form.status}
              disabled={pending}
              onChange={(e) => patch({ status: e.target.value })}
            >
              {RECIPE_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {RECIPE_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-visibility`}>
            Visibility
            <select
              id={`${formId}-visibility`}
              className={styles.fieldControl}
              value={form.visibility}
              disabled={pending}
              onChange={(e) => patch({ visibility: e.target.value })}
            >
              {RECIPE_VISIBILITY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {RECIPE_VISIBILITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-tags`}>
        <h2 id={`${formId}-tags`} className={styles.builderSectionTitle}>
          Dietary & allergens
        </h2>
        <p className={styles.builderHint}>Dietary tags</p>
        <div className={styles.checkboxRow}>
          {RECIPE_DIETARY_VALUES.map((value) => (
            <label key={value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.dietaryTags.includes(value)}
                disabled={pending}
                onChange={() => toggleTag('dietaryTags', value)}
              />
              {RECIPE_DIETARY_LABELS[value]}
            </label>
          ))}
        </div>
        <p className={styles.builderHint}>Allergen tags</p>
        <div className={styles.checkboxRow}>
          {RECIPE_ALLERGEN_VALUES.map((value) => (
            <label key={value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.allergenTags.includes(value)}
                disabled={pending}
                onChange={() => toggleTag('allergenTags', value)}
              />
              {RECIPE_ALLERGEN_LABELS[value]}
            </label>
          ))}
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-yield`}>
        <h2 id={`${formId}-yield`} className={styles.builderSectionTitle}>
          Yield & timing
        </h2>
        <div className={styles.builderGrid3}>
          <label className={styles.fieldLabel} htmlFor={`${formId}-yield-qty`}>
            Yield quantity
            <input
              id={`${formId}-yield-qty`}
              className={styles.fieldControl}
              inputMode="decimal"
              value={form.yieldQuantity}
              disabled={pending}
              onChange={(e) => patch({ yieldQuantity: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-yield-unit`}>
            Yield unit
            <select
              id={`${formId}-yield-unit`}
              className={styles.fieldControl}
              value={form.yieldUnit}
              disabled={pending}
              onChange={(e) => patch({ yieldUnit: e.target.value })}
            >
              <option value="">Select</option>
              {RECIPE_YIELD_UNIT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {RECIPE_YIELD_UNIT_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-prep`}>
            Prep minutes
            <input
              id={`${formId}-prep`}
              className={styles.fieldControl}
              inputMode="numeric"
              value={form.prepTimeMinutes}
              disabled={pending}
              onChange={(e) => patch({ prepTimeMinutes: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-cook`}>
            Cook minutes
            <input
              id={`${formId}-cook`}
              className={styles.fieldControl}
              inputMode="numeric"
              value={form.cookTimeMinutes}
              disabled={pending}
              onChange={(e) => patch({ cookTimeMinutes: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-ingredients`}>
        <div className={styles.repeatToolbar}>
          <h2 id={`${formId}-ingredients`} className={styles.builderSectionTitle}>
            Ingredients
          </h2>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            disabled={pending}
            onClick={() =>
              patch({ ingredients: [...form.ingredients, emptyIngredient()] })
            }
          >
            Add ingredient
          </button>
        </div>
        <div className={styles.repeatBlock}>
          {form.ingredients.map((row, index) => (
            <div key={row.key} className={styles.repeatCard}>
              <div className={styles.builderGrid}>
                <label className={styles.fieldLabel}>
                  Quantity
                  <input
                    className={styles.fieldControl}
                    value={row.quantity}
                    disabled={pending}
                    onChange={(e) => {
                      const next = [...form.ingredients]
                      next[index] = { ...row, quantity: e.target.value }
                      patch({ ingredients: next })
                    }}
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Unit
                  <input
                    className={styles.fieldControl}
                    value={row.unit}
                    disabled={pending}
                    onChange={(e) => {
                      const next = [...form.ingredients]
                      next[index] = { ...row, unit: e.target.value }
                      patch({ ingredients: next })
                    }}
                  />
                </label>
                <label className={`${styles.fieldLabel} ${styles.fieldFull}`}>
                  Ingredient
                  <input
                    className={styles.fieldControl}
                    value={row.ingredient}
                    required
                    disabled={pending}
                    onChange={(e) => {
                      const next = [...form.ingredients]
                      next[index] = { ...row, ingredient: e.target.value }
                      patch({ ingredients: next })
                    }}
                  />
                </label>
                <label className={`${styles.fieldLabel} ${styles.fieldFull}`}>
                  Preparation note
                  <input
                    className={styles.fieldControl}
                    value={row.preparationNote}
                    disabled={pending}
                    onChange={(e) => {
                      const next = [...form.ingredients]
                      next[index] = { ...row, preparationNote: e.target.value }
                      patch({ ingredients: next })
                    }}
                  />
                </label>
              </div>
              <button
                type="button"
                className={`${styles.textButton} ${styles.textButtonDanger}`}
                disabled={pending || form.ingredients.length <= 1}
                aria-label={`Remove ingredient ${index + 1}`}
                onClick={() =>
                  patch({
                    ingredients: form.ingredients.filter((_, i) => i !== index),
                  })
                }
              >
                Remove ingredient
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-steps`}>
        <div className={styles.repeatToolbar}>
          <h2 id={`${formId}-steps`} className={styles.builderSectionTitle}>
            Preparation steps
          </h2>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            disabled={pending}
            onClick={() => patch({ steps: [...form.steps, emptyStep()] })}
          >
            Add step
          </button>
        </div>
        <div className={styles.repeatBlock}>
          {form.steps.map((row, index) => (
            <div key={row.key} className={styles.repeatCard}>
              <label className={styles.fieldLabel}>
                Step {index + 1}
                <textarea
                  className={`${styles.fieldControl} ${styles.textareaControl}`}
                  value={row.instruction}
                  required
                  disabled={pending}
                  onChange={(e) => {
                    const next = [...form.steps]
                    next[index] = { ...row, instruction: e.target.value }
                    patch({ steps: next })
                  }}
                />
              </label>
              <div className={styles.repeatActions}>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={pending || index === 0}
                  aria-label={`Move step ${index + 1} up`}
                  onClick={() => {
                    const next = [...form.steps]
                    const [moved] = next.splice(index, 1)
                    next.splice(index - 1, 0, moved)
                    patch({ steps: next })
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={pending || index === form.steps.length - 1}
                  aria-label={`Move step ${index + 1} down`}
                  onClick={() => {
                    const next = [...form.steps]
                    const [moved] = next.splice(index, 1)
                    next.splice(index + 1, 0, moved)
                    patch({ steps: next })
                  }}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className={`${styles.textButton} ${styles.textButtonDanger}`}
                  disabled={pending || form.steps.length <= 1}
                  aria-label={`Remove step ${index + 1}`}
                  onClick={() =>
                    patch({ steps: form.steps.filter((_, i) => i !== index) })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-notes`}>
        <h2 id={`${formId}-notes`} className={styles.builderSectionTitle}>
          Culinary notes
          <span className={styles.internalBadge}>Internal</span>
        </h2>
        <div className={styles.builderGrid}>
          <label className={`${styles.fieldLabel} ${styles.fieldFull}`} htmlFor={`${formId}-chef`}>
            Chef notes
            <textarea
              id={`${formId}-chef`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.chefNotes}
              disabled={pending}
              onChange={(e) => patch({ chefNotes: e.target.value })}
            />
          </label>
          <label className={`${styles.fieldLabel} ${styles.fieldFull}`} htmlFor={`${formId}-plate`}>
            Plating notes
            <textarea
              id={`${formId}-plate`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.platingNotes}
              disabled={pending}
              onChange={(e) => patch({ platingNotes: e.target.value })}
            />
          </label>
          <label className={`${styles.fieldLabel} ${styles.fieldFull}`} htmlFor={`${formId}-storage`}>
            Storage / make-ahead
            <textarea
              id={`${formId}-storage`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.storageNotes}
              disabled={pending}
              onChange={(e) => patch({ storageNotes: e.target.value })}
            />
          </label>
          {canSeeCostNotes ? (
            <label
              className={`${styles.fieldLabel} ${styles.fieldFull}`}
              htmlFor={`${formId}-cost`}
            >
              Internal cost notes
              <textarea
                id={`${formId}-cost`}
                className={`${styles.fieldControl} ${styles.textareaControl}`}
                value={form.internalCostNotes}
                disabled={pending}
                onChange={(e) => patch({ internalCostNotes: e.target.value })}
              />
            </label>
          ) : null}
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-publish`}>
        <h2 id={`${formId}-publish`} className={styles.builderSectionTitle}>
          Publishing foundation
        </h2>
        <p className={styles.builderHint}>
          Optional fields for a future cookbook or subscription. Not public in this phase.
        </p>
        <div className={styles.builderGrid}>
          <label className={styles.fieldLabel} htmlFor={`${formId}-slug`}>
            Slug
            <input
              id={`${formId}-slug`}
              className={styles.fieldControl}
              value={form.slug}
              disabled={pending}
              onChange={(e) => patch({ slug: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-public-title`}>
            Public title
            <input
              id={`${formId}-public-title`}
              className={styles.fieldControl}
              value={form.publicTitle}
              disabled={pending}
              onChange={(e) => patch({ publicTitle: e.target.value })}
            />
          </label>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-public-summary`}
          >
            Public summary
            <textarea
              id={`${formId}-public-summary`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.publicSummary}
              disabled={pending}
              onChange={(e) => patch({ publicSummary: e.target.value })}
            />
          </label>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-chef-intro`}
          >
            Chef introduction / story
            <textarea
              id={`${formId}-chef-intro`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.chefIntroduction}
              disabled={pending}
              onChange={(e) => patch({ chefIntroduction: e.target.value })}
            />
          </label>
        </div>
      </section>

      <div className={styles.formActions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Save recipe' : 'Save changes'}
        </button>
      </div>

      <div className={styles.formStatus} aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </form>
  )
}
