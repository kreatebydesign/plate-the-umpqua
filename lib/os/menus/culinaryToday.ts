import type { User } from '@/payload-types'
import { getPayload } from 'payload'
import config from '../../../payload.config'

export type CulinaryTodaySnapshot = {
  draftMenus: number | null
  awaitingResponse: number | null
  recentMenus: Array<{ id: string; label: string; href: string }>
  recentRecipes: Array<{ id: string; label: string; href: string }>
  errors: string[]
}

/**
 * Bounded culinary snapshot for Today — separate from getTodayAtPlate
 * so the preserved client-href hardening in that file stays untouched.
 */
export async function getCulinaryTodaySnapshot(
  user: User,
): Promise<CulinaryTodaySnapshot> {
  const payload = await getPayload({ config })
  const shared = { user, overrideAccess: false as const }
  const errors: string[] = []
  let draftMenus: number | null = null
  let awaitingResponse: number | null = null
  const recentMenus: CulinaryTodaySnapshot['recentMenus'] = []
  const recentRecipes: CulinaryTodaySnapshot['recentRecipes'] = []

  try {
    const [draft, awaiting, menus, recipes] = await Promise.all([
      payload.count({
        collection: 'menus',
        ...shared,
        where: { status: { in: ['draft', 'readyForReview'] } },
      }),
      payload.count({
        collection: 'menus',
        ...shared,
        where: { status: { in: ['sent', 'revisionRequested'] } },
      }),
      payload.find({
        collection: 'menus',
        ...shared,
        sort: '-updatedAt',
        limit: 3,
        depth: 0,
        select: { internalName: true, occasionTitle: true, status: true },
      }),
      payload.find({
        collection: 'recipes',
        ...shared,
        sort: '-updatedAt',
        limit: 3,
        depth: 0,
        select: { name: true, status: true },
        where: { status: { not_equals: 'archived' } },
      }),
    ])

    draftMenus = draft.totalDocs
    awaitingResponse = awaiting.totalDocs

    for (const doc of menus.docs) {
      recentMenus.push({
        id: String(doc.id),
        label: doc.internalName?.trim() || doc.occasionTitle?.trim() || 'Menu',
        href: `/os/menus/${doc.id}`,
      })
    }

    for (const doc of recipes.docs) {
      recentRecipes.push({
        id: String(doc.id),
        label: doc.name?.trim() || 'Recipe',
        href: `/os/recipes/${doc.id}`,
      })
    }
  } catch (err) {
    console.error('[os/today] culinary snapshot', err)
    errors.push('Culinary summary could not be loaded.')
  }

  return {
    draftMenus,
    awaitingResponse,
    recentMenus,
    recentRecipes,
    errors,
  }
}
