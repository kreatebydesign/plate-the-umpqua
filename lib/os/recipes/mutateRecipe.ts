'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { asPlateUser, canWriteCulinary, isDirector } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  isRecipeAllergen,
  isRecipeCategory,
  isRecipeCourse,
  isRecipeCuisine,
  isRecipeDietary,
  isRecipeStatus,
  isRecipeVisibility,
  isRecipeYieldUnit,
  RECIPE_MUTATION_ALLOWLIST,
  slugifyRecipeName,
} from './recipeConstants'

export type RecipeMutationResult =
  | { ok: true; id: string }
  | { ok: false; message: string }

function cleanText(value: unknown, max: number): string | undefined {
  if (value == null) return undefined
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

function cleanTextOrEmpty(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function cleanNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.min(n, 100_000)
}

function cleanId(value: unknown): string | null | undefined {
  if (value === null) return null
  if (value == null || value === '') return undefined
  if (typeof value !== 'string') return undefined
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(value)) return undefined
  return value
}

function parseStringArray(
  value: unknown,
  predicate: (v: string) => boolean,
  max = 20,
): string[] | undefined {
  if (value == null) return undefined
  if (!Array.isArray(value)) return undefined
  const out: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    if (!predicate(item)) continue
    out.push(item)
    if (out.length >= max) break
  }
  return out
}

function parseIngredients(value: unknown) {
  if (value == null) return undefined
  if (!Array.isArray(value)) return undefined
  const rows: Array<{
    quantity?: string
    unit?: string
    ingredient: string
    preparationNote?: string
  }> = []
  for (const row of value.slice(0, 80)) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    const r = row as Record<string, unknown>
    const ingredient = cleanText(r.ingredient, 160)
    if (!ingredient) continue
    rows.push({
      quantity: cleanText(r.quantity, 40),
      unit: cleanText(r.unit, 40),
      ingredient,
      preparationNote: cleanText(r.preparationNote, 160),
    })
  }
  return rows
}

function parseSteps(value: unknown) {
  if (value == null) return undefined
  if (!Array.isArray(value)) return undefined
  const rows: Array<{ instruction: string }> = []
  for (const row of value.slice(0, 60)) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    const instruction = cleanText(
      (row as Record<string, unknown>).instruction,
      2000,
    )
    if (!instruction) continue
    rows.push({ instruction })
  }
  return rows
}

function parseRecipeData(
  rawInput: unknown,
  options: { includeCostNotes: boolean },
): { ok: true; data: Record<string, unknown> } | { ok: false; message: string } {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return { ok: false, message: 'Invalid update.' }
  }

  const input = rawInput as Record<string, unknown>
  for (const key of Object.keys(input)) {
    if (!(RECIPE_MUTATION_ALLOWLIST as readonly string[]).includes(key)) {
      return { ok: false, message: 'Unsupported field.' }
    }
  }

  const data: Record<string, unknown> = {}

  if ('name' in input) {
    const name = cleanText(input.name, 160)
    if (!name) return { ok: false, message: 'Recipe name is required.' }
    data.name = name
  }

  if ('shortDescription' in input) {
    data.shortDescription = cleanTextOrEmpty(input.shortDescription, 800)
  }

  if ('category' in input) {
    if (input.category == null || input.category === '') {
      data.category = null
    } else if (
      typeof input.category === 'string' &&
      isRecipeCategory(input.category)
    ) {
      data.category = input.category
    } else {
      return { ok: false, message: 'Invalid category.' }
    }
  }

  if ('cuisine' in input) {
    if (input.cuisine == null || input.cuisine === '') {
      data.cuisine = null
    } else if (
      typeof input.cuisine === 'string' &&
      isRecipeCuisine(input.cuisine)
    ) {
      data.cuisine = input.cuisine
    } else {
      return { ok: false, message: 'Invalid cuisine.' }
    }
  }

  if ('course' in input) {
    if (input.course == null || input.course === '') {
      data.course = null
    } else if (
      typeof input.course === 'string' &&
      isRecipeCourse(input.course)
    ) {
      data.course = input.course
    } else {
      return { ok: false, message: 'Invalid course.' }
    }
  }

  if ('dietaryTags' in input) {
    const tags = parseStringArray(input.dietaryTags, isRecipeDietary)
    if (!tags) return { ok: false, message: 'Invalid dietary tags.' }
    data.dietaryTags = tags
  }

  if ('allergenTags' in input) {
    const tags = parseStringArray(input.allergenTags, isRecipeAllergen)
    if (!tags) return { ok: false, message: 'Invalid allergen tags.' }
    data.allergenTags = tags
  }

  if ('yieldQuantity' in input) {
    data.yieldQuantity = cleanNumber(input.yieldQuantity) ?? null
  }

  if ('yieldUnit' in input) {
    if (input.yieldUnit == null || input.yieldUnit === '') {
      data.yieldUnit = null
    } else if (
      typeof input.yieldUnit === 'string' &&
      isRecipeYieldUnit(input.yieldUnit)
    ) {
      data.yieldUnit = input.yieldUnit
    } else {
      return { ok: false, message: 'Invalid yield unit.' }
    }
  }

  if ('prepTimeMinutes' in input) {
    data.prepTimeMinutes = cleanNumber(input.prepTimeMinutes) ?? null
  }

  if ('cookTimeMinutes' in input) {
    data.cookTimeMinutes = cleanNumber(input.cookTimeMinutes) ?? null
  }

  if ('ingredients' in input) {
    const ingredients = parseIngredients(input.ingredients)
    if (!ingredients) return { ok: false, message: 'Invalid ingredients.' }
    data.ingredients = ingredients
  }

  if ('steps' in input) {
    const steps = parseSteps(input.steps)
    if (!steps) return { ok: false, message: 'Invalid steps.' }
    data.steps = steps
  }

  if ('chefNotes' in input) {
    data.chefNotes = cleanTextOrEmpty(input.chefNotes, 4000)
  }
  if ('platingNotes' in input) {
    data.platingNotes = cleanTextOrEmpty(input.platingNotes, 4000)
  }
  if ('storageNotes' in input) {
    data.storageNotes = cleanTextOrEmpty(input.storageNotes, 4000)
  }

  if ('internalCostNotes' in input) {
    if (!options.includeCostNotes) {
      return { ok: false, message: 'You cannot update cost notes.' }
    }
    data.internalCostNotes = cleanTextOrEmpty(input.internalCostNotes, 4000)
  }

  if ('featuredImage' in input) {
    const id = cleanId(input.featuredImage)
    if (id === undefined) return { ok: false, message: 'Invalid featured image.' }
    data.featuredImage = id
  }

  if ('status' in input) {
    if (typeof input.status !== 'string' || !isRecipeStatus(input.status)) {
      return { ok: false, message: 'Invalid status.' }
    }
    data.status = input.status
  }

  if ('visibility' in input) {
    if (
      typeof input.visibility !== 'string' ||
      !isRecipeVisibility(input.visibility)
    ) {
      return { ok: false, message: 'Invalid visibility.' }
    }
    data.visibility = input.visibility
  }

  if ('slug' in input) {
    const slug = cleanText(input.slug, 80)
    data.slug = slug ? slugifyRecipeName(slug) : null
  }

  if ('publicTitle' in input) {
    data.publicTitle = cleanTextOrEmpty(input.publicTitle, 160)
  }
  if ('publicSummary' in input) {
    data.publicSummary = cleanTextOrEmpty(input.publicSummary, 800)
  }
  if ('heroImage' in input) {
    const id = cleanId(input.heroImage)
    if (id === undefined) return { ok: false, message: 'Invalid hero image.' }
    data.heroImage = id
  }
  if ('chefIntroduction' in input) {
    data.chefIntroduction = cleanTextOrEmpty(input.chefIntroduction, 4000)
  }

  return { ok: true, data }
}

function revalidateRecipes(id?: string) {
  revalidatePath('/os/recipes')
  if (id) revalidatePath(`/os/recipes/${id}`)
  revalidatePath('/os/menus')
}

export async function createRecipe(
  rawInput: unknown,
): Promise<RecipeMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/recipes' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to create recipes.' }
  }

  const parsed = parseRecipeData(rawInput, {
    includeCostNotes: isDirector(asPlateUser(user)),
  })
  if (!parsed.ok) return parsed

  if (typeof parsed.data.name !== 'string' || !parsed.data.name) {
    return { ok: false, message: 'Recipe name is required.' }
  }

  const data = {
    status: 'draft',
    visibility: 'private',
    ...parsed.data,
  }

  try {
    const payload = await getPayload({ config })
    const created = await payload.create({
      collection: 'recipes',
      data: data as never,
      user,
      overrideAccess: false,
      depth: 0,
    })
    revalidateRecipes(String(created.id))
    return { ok: true, id: String(created.id) }
  } catch (err) {
    console.error('[os/recipes] create', err)
    return { ok: false, message: 'Unable to create recipe.' }
  }
}

export async function updateRecipe(
  rawId: unknown,
  rawInput: unknown,
): Promise<RecipeMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/recipes' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to update recipes.' }
  }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid recipe.' }
  }

  const parsed = parseRecipeData(rawInput, {
    includeCostNotes: isDirector(asPlateUser(user)),
  })
  if (!parsed.ok) return parsed
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, message: 'No changes provided.' }
  }

  try {
    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'recipes',
      id: rawId,
      data: parsed.data as never,
      user,
      overrideAccess: false,
      depth: 0,
    })
    revalidateRecipes(String(updated.id))
    return { ok: true, id: String(updated.id) }
  } catch (err) {
    console.error('[os/recipes] update', err)
    return { ok: false, message: 'Unable to save recipe.' }
  }
}

export async function duplicateRecipe(
  rawId: unknown,
): Promise<RecipeMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/recipes' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return {
      ok: false,
      message: 'You do not have permission to duplicate recipes.',
    }
  }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid recipe.' }
  }

  try {
    const payload = await getPayload({ config })
    const source = await payload.findByID({
      collection: 'recipes',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })

    const featuredImage =
      typeof source.featuredImage === 'object' && source.featuredImage
        ? source.featuredImage.id
        : source.featuredImage
    const heroImage =
      typeof source.heroImage === 'object' && source.heroImage
        ? source.heroImage.id
        : source.heroImage

    const created = await payload.create({
      collection: 'recipes',
      user,
      overrideAccess: false,
      depth: 0,
      data: {
        name: `${source.name || 'Recipe'} (copy)`,
        shortDescription: source.shortDescription || undefined,
        category: source.category || undefined,
        cuisine: source.cuisine || undefined,
        course: source.course || undefined,
        dietaryTags: source.dietaryTags || undefined,
        allergenTags: source.allergenTags || undefined,
        yieldQuantity: source.yieldQuantity ?? undefined,
        yieldUnit: source.yieldUnit || undefined,
        prepTimeMinutes: source.prepTimeMinutes ?? undefined,
        cookTimeMinutes: source.cookTimeMinutes ?? undefined,
        ingredients: (source.ingredients || []).map((row) => ({
          quantity: row.quantity || undefined,
          unit: row.unit || undefined,
          ingredient: row.ingredient,
          preparationNote: row.preparationNote || undefined,
        })),
        steps: (source.steps || []).map((row) => ({
          instruction: row.instruction,
        })),
        chefNotes: source.chefNotes || undefined,
        platingNotes: source.platingNotes || undefined,
        storageNotes: source.storageNotes || undefined,
        internalCostNotes: isDirector(asPlateUser(user))
          ? source.internalCostNotes || undefined
          : undefined,
        featuredImage: featuredImage || undefined,
        status: 'draft',
        visibility: 'private',
        publicTitle: source.publicTitle || undefined,
        publicSummary: source.publicSummary || undefined,
        heroImage: heroImage || undefined,
        chefIntroduction: source.chefIntroduction || undefined,
      },
    })

    revalidateRecipes(String(created.id))
    return { ok: true, id: String(created.id) }
  } catch (err) {
    console.error('[os/recipes] duplicate', err)
    return { ok: false, message: 'Unable to duplicate recipe.' }
  }
}
