import type { User } from '@/payload-types'
import { getPayload, type Where } from 'payload'
import config from '../../../payload.config'
import {
  asPlateUser,
  canWriteCulinary,
  isDirector,
} from '@/lib/access/roles'
import {
  clampRecipeLimit,
  clampRecipePage,
  isRecipeAllergen,
  isRecipeCategory,
  isRecipeCourse,
  isRecipeCuisine,
  isRecipeDietary,
  isRecipeListView,
  isRecipeSort,
  isRecipeStatus,
  isRecipeVisibility,
  isRecipeYieldUnit,
  normalizeRecipeSearch,
  recipeCategoryLabel,
  recipeStatusLabel,
  recipeVisibilityLabel,
  type RecipeListView,
  type RecipeSortValue,
  RECIPE_ALLERGEN_LABELS,
  RECIPE_DIETARY_LABELS,
} from './recipeConstants'

export type RecipeListRow = {
  id: string
  name: string
  categoryLabel: string
  statusLabel: string
  visibilityLabel: string
  updatedLabel: string
  href: string
}

export type RecipeListResult = {
  rows: RecipeListRow[]
  totalDocs: number
  page: number
  totalPages: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  filters: {
    view: RecipeListView
    status: string | null
    category: string | null
    q: string
    sort: RecipeSortValue
  }
  counts: {
    total: number | null
    menuReady: number | null
    publishing: number | null
    archived: number | null
  }
  errors: string[]
  canManageInAdmin: boolean
  canWrite: boolean
}

export type RecipeIngredientRow = {
  id?: string | null
  quantity: string | null
  unit: string | null
  ingredient: string
  preparationNote: string | null
}

export type RecipeStepRow = {
  id?: string | null
  instruction: string
}

export type RecipeDetail = {
  id: string
  name: string
  shortDescription: string | null
  category: string | null
  categoryLabel: string
  cuisine: string | null
  course: string | null
  dietaryTags: string[]
  dietaryLabels: string[]
  allergenTags: string[]
  allergenLabels: string[]
  yieldQuantity: number | null
  yieldUnit: string | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  ingredients: RecipeIngredientRow[]
  steps: RecipeStepRow[]
  chefNotes: string | null
  platingNotes: string | null
  storageNotes: string | null
  internalCostNotes: string | null
  featuredImageId: string | null
  featuredImageUrl: string | null
  status: string
  statusLabel: string
  visibility: string
  visibilityLabel: string
  slug: string | null
  publicTitle: string | null
  publicSummary: string | null
  heroImageId: string | null
  chefIntroduction: string | null
  createdAt: string | null
  updatedAt: string | null
  canWrite: boolean
  canSeeCostNotes: boolean
  canManageInAdmin: boolean
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function formatShort(value?: string | null) {
  if (!value) return '—'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(ms))
  } catch {
    return '—'
  }
}

function mediaUrl(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const url = (value as { url?: string | null }).url
  return typeof url === 'string' && url.trim() ? url.trim() : null
}

function mediaId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id == null ? null : String(id)
  }
  return null
}

export async function listRecipes(
  user: User,
  raw: {
    view?: string | null
    status?: string | null
    category?: string | null
    q?: string | null
    sort?: string | null
    page?: string | null
    limit?: string | null
  },
): Promise<RecipeListResult> {
  const payload = await getPayload({ config })
  const shared = { user, overrideAccess: false as const }
  const view = isRecipeListView(raw.view || '') ? raw.view! : 'all'
  const status =
    raw.status && isRecipeStatus(raw.status) ? raw.status : null
  const category =
    raw.category && isRecipeCategory(raw.category) ? raw.category : null
  const q = normalizeRecipeSearch(raw.q)
  const sort: RecipeSortValue = isRecipeSort(raw.sort || '')
    ? (raw.sort as RecipeSortValue)
    : 'newest'
  const page = clampRecipePage(raw.page)
  const limit = clampRecipeLimit(raw.limit)

  const errors: string[] = []
  const counts: RecipeListResult['counts'] = {
    total: null,
    menuReady: null,
    publishing: null,
    archived: null,
  }

  try {
    const [total, menuReady, publishing, archived] = await Promise.all([
      payload.count({ collection: 'recipes', ...shared }),
      payload.count({
        collection: 'recipes',
        ...shared,
        where: { visibility: { equals: 'menuReady' } },
      }),
      payload.count({
        collection: 'recipes',
        ...shared,
        where: { visibility: { equals: 'publishingCandidate' } },
      }),
      payload.count({
        collection: 'recipes',
        ...shared,
        where: { status: { equals: 'archived' } },
      }),
    ])
    counts.total = total.totalDocs
    counts.menuReady = menuReady.totalDocs
    counts.publishing = publishing.totalDocs
    counts.archived = archived.totalDocs
  } catch (err) {
    console.error('[os/recipes] counts', err)
    errors.push('Unable to load recipe counts.')
  }

  const and: Where[] = []

  if (view === 'menuReady') {
    and.push({ visibility: { equals: 'menuReady' } })
  } else if (view === 'publishing') {
    and.push({ visibility: { equals: 'publishingCandidate' } })
  } else if (view === 'archived') {
    and.push({ status: { equals: 'archived' } })
  } else {
    and.push({ status: { not_equals: 'archived' } })
  }

  if (status) and.push({ status: { equals: status } })
  if (category) and.push({ category: { equals: category } })
  if (q) {
    and.push({
      or: [
        { name: { contains: q } },
        { shortDescription: { contains: q } },
        { slug: { contains: q } },
      ],
    })
  }

  const sortMap: Record<RecipeSortValue, string> = {
    newest: '-updatedAt',
    oldest: 'updatedAt',
    nameAsc: 'name',
  }

  let rows: RecipeListRow[] = []
  let totalDocs = 0
  let totalPages = 1
  let hasNextPage = false
  let hasPrevPage = false

  try {
    const result = await payload.find({
      collection: 'recipes',
      ...shared,
      where: and.length ? { and } : undefined,
      sort: sortMap[sort],
      page,
      limit,
      depth: 0,
      select: {
        name: true,
        category: true,
        status: true,
        visibility: true,
        updatedAt: true,
      },
    })

    totalDocs = result.totalDocs
    totalPages = result.totalPages
    hasNextPage = result.hasNextPage
    hasPrevPage = result.hasPrevPage

    rows = result.docs.map((doc) => ({
      id: asId(doc.id),
      name: doc.name?.trim() || 'Untitled recipe',
      categoryLabel: recipeCategoryLabel(doc.category),
      statusLabel: recipeStatusLabel(doc.status),
      visibilityLabel: recipeVisibilityLabel(doc.visibility),
      updatedLabel: formatShort(doc.updatedAt),
      href: `/os/recipes/${doc.id}`,
    }))
  } catch (err) {
    console.error('[os/recipes] list', err)
    errors.push('Unable to load recipes.')
  }

  return {
    rows,
    totalDocs,
    page,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage,
    filters: { view: view as RecipeListView, status, category, q, sort },
    counts,
    errors,
    canManageInAdmin: canWriteCulinary(asPlateUser(user)),
    canWrite: canWriteCulinary(asPlateUser(user)),
  }
}

export async function getRecipeDetail(
  user: User,
  rawId: string,
): Promise<RecipeDetail | null> {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) return null

  const payload = await getPayload({ config })
  const canSeeCost = isDirector(asPlateUser(user))

  try {
    const doc = await payload.findByID({
      collection: 'recipes',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 1,
    })

    const dietaryTags = Array.isArray(doc.dietaryTags)
      ? doc.dietaryTags.filter((t): t is NonNullable<typeof t> => Boolean(t))
      : []
    const allergenTags = Array.isArray(doc.allergenTags)
      ? doc.allergenTags.filter((t): t is NonNullable<typeof t> => Boolean(t))
      : []

    return {
      id: asId(doc.id),
      name: doc.name?.trim() || 'Untitled recipe',
      shortDescription: doc.shortDescription?.trim() || null,
      category: doc.category || null,
      categoryLabel: recipeCategoryLabel(doc.category),
      cuisine: doc.cuisine || null,
      course: doc.course || null,
      dietaryTags: [...dietaryTags],
      dietaryLabels: dietaryTags.map(
        (t) => RECIPE_DIETARY_LABELS[t as keyof typeof RECIPE_DIETARY_LABELS] || t,
      ),
      allergenTags: [...allergenTags],
      allergenLabels: allergenTags.map(
        (t) =>
          RECIPE_ALLERGEN_LABELS[t as keyof typeof RECIPE_ALLERGEN_LABELS] || t,
      ),
      yieldQuantity:
        typeof doc.yieldQuantity === 'number' ? doc.yieldQuantity : null,
      yieldUnit: doc.yieldUnit || null,
      prepTimeMinutes:
        typeof doc.prepTimeMinutes === 'number' ? doc.prepTimeMinutes : null,
      cookTimeMinutes:
        typeof doc.cookTimeMinutes === 'number' ? doc.cookTimeMinutes : null,
      ingredients: (doc.ingredients || []).map((row) => ({
        id: row.id || null,
        quantity: row.quantity?.trim() || null,
        unit: row.unit?.trim() || null,
        ingredient: row.ingredient?.trim() || '',
        preparationNote: row.preparationNote?.trim() || null,
      })),
      steps: (doc.steps || []).map((row) => ({
        id: row.id || null,
        instruction: row.instruction?.trim() || '',
      })),
      chefNotes: doc.chefNotes?.trim() || null,
      platingNotes: doc.platingNotes?.trim() || null,
      storageNotes: doc.storageNotes?.trim() || null,
      internalCostNotes: canSeeCost
        ? doc.internalCostNotes?.trim() || null
        : null,
      featuredImageId: mediaId(doc.featuredImage),
      featuredImageUrl: mediaUrl(doc.featuredImage),
      status: doc.status || 'draft',
      statusLabel: recipeStatusLabel(doc.status),
      visibility: doc.visibility || 'private',
      visibilityLabel: recipeVisibilityLabel(doc.visibility),
      slug: doc.slug?.trim() || null,
      publicTitle: doc.publicTitle?.trim() || null,
      publicSummary: doc.publicSummary?.trim() || null,
      heroImageId: mediaId(doc.heroImage),
      chefIntroduction: doc.chefIntroduction?.trim() || null,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
      canWrite: canWriteCulinary(asPlateUser(user)),
      canSeeCostNotes: canSeeCost,
      canManageInAdmin: canWriteCulinary(asPlateUser(user)),
    }
  } catch (err) {
    console.error('[os/recipes] detail', err)
    return null
  }
}

export async function listMenuReadyRecipes(
  user: User,
  q?: string | null,
): Promise<Array<{ id: string; name: string; categoryLabel: string }>> {
  const payload = await getPayload({ config })
  const search = normalizeRecipeSearch(q)
  const and: Where[] = [
    { visibility: { equals: 'menuReady' } },
    { status: { not_equals: 'archived' } },
  ]
  if (search) {
    and.push({ name: { contains: search } })
  }

  try {
    const result = await payload.find({
      collection: 'recipes',
      user,
      overrideAccess: false,
      where: { and },
      sort: 'name',
      limit: 40,
      depth: 0,
      select: { name: true, category: true },
    })
    return result.docs.map((doc) => ({
      id: asId(doc.id),
      name: doc.name?.trim() || 'Untitled recipe',
      categoryLabel: recipeCategoryLabel(doc.category),
    }))
  } catch (err) {
    console.error('[os/recipes] menu-ready picker', err)
    return []
  }
}

/** Shared validators used by mutation allowlist parsing. */
export const recipeFieldValidators = {
  isRecipeStatus,
  isRecipeVisibility,
  isRecipeCategory,
  isRecipeCuisine,
  isRecipeCourse,
  isRecipeDietary,
  isRecipeAllergen,
  isRecipeYieldUnit,
}
