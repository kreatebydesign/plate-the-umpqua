/**
 * Phase 5 smoke: Recipes + Menus access, review payload minimization,
 * token helpers, validation, and query bounds.
 * Does not mutate production business records.
 * Run: npx --yes tsx scripts/verify-phase5-recipes-menus.ts
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function loadEnvLocal() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq)
      const value = trimmed.slice(eq + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // Rely on process env when .env.local is unavailable
  }
}

async function main() {
  loadEnvLocal()

  const {
    generateReviewToken,
    hashReviewToken,
    normalizeReviewTokenParam,
    resolveReviewLinkState,
    tokensMatch,
    reviewTokenExpiresAt,
  } = await import('../lib/os/menus/reviewToken')
  const {
    assertNoSensitivePublicKeys,
    buildPublicMenuReviewPayload,
  } = await import('../lib/os/menus/publicReviewPayload')
  const {
    clampMenuLimit,
    clampMenuPage,
    isMenuReviewAction,
    isMenuStatus,
    isMenuStructurePresetId,
    isOsDocumentId,
    MENU_MUTATION_ALLOWLIST,
    MENU_STRUCTURE_PRESETS,
    menuViewStatuses,
    menuWorkflowGuidance,
    normalizeMenuSearch,
  } = await import('../lib/os/menus/menuConstants')
  const {
    clampRecipeLimit,
    clampRecipePage,
    isRecipeStatus,
    isRecipeVisibility,
    normalizeRecipeSearch,
    RECIPE_MUTATION_ALLOWLIST,
  } = await import('../lib/os/recipes/recipeConstants')
  const {
    canWriteCulinary,
    canAccessPlateOS,
    asPlateUser,
  } = await import('../lib/access/roles')
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const { listRecipes, getRecipeDetail } = await import(
    '../lib/os/recipes/recipeQueries'
  )
  const { listMenus, getMenuDetail } = await import(
    '../lib/os/menus/menuQueries'
  )
  const { lookupMenuReviewByToken, submitMenuReview } = await import(
    '../lib/os/menus/publicMenuReview'
  )

  // --- Pure helpers ---
  const token = generateReviewToken()
  assert.ok(token.length >= 20)
  const hash = hashReviewToken(token)
  assert.equal(hash.length, 64)
  assert.equal(tokensMatch(token, hash), true)
  assert.equal(tokensMatch('not-the-token', hash), false)
  assert.equal(normalizeReviewTokenParam('../etc/passwd'), null)
  assert.equal(normalizeReviewTokenParam(token), token)
  assert.ok(reviewTokenExpiresAt().getTime() > Date.now())

  assert.equal(
    resolveReviewLinkState({ hashFound: false }),
    'invalid',
  )
  assert.equal(
    resolveReviewLinkState({
      hashFound: true,
      revokedAt: new Date().toISOString(),
    }),
    'revoked',
  )
  assert.equal(
    resolveReviewLinkState({
      hashFound: true,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }),
    'expired',
  )
  assert.equal(
    resolveReviewLinkState({
      hashFound: true,
      menuStatus: 'archived',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }),
    'unavailable',
  )
  assert.equal(
    resolveReviewLinkState({
      hashFound: true,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      menuStatus: 'sent',
    }),
    'valid',
  )

  const publicPayload = buildPublicMenuReviewPayload({
    occasionTitle: 'Anniversary Dinner',
    serviceDate: '2026-08-01T00:00:00.000Z',
    guestCount: 8,
    introductoryMessage: 'Welcome.',
    pricingPresentation: 'Investment discussion available on request.',
    displayInvestment: 2400,
    version: 2,
    status: 'sent',
    sections: [
      {
        sectionName: 'Main Course',
        items: [
          {
            clientTitle: 'Herb-crusted salmon',
            clientDescription: 'Seasonal greens',
            showDietary: true,
            dietaryDisplay: 'Gluten free',
            allergenDisplay: 'Fish',
            internalItemNotes: 'SECRET COST NOTE',
            recipe: { id: 'should-not-leak', ingredients: [] },
          },
        ],
      },
    ],
  })

  assert.equal(publicPayload.occasionTitle, 'Anniversary Dinner')
  assert.equal(publicPayload.sections.length, 1)
  assert.equal(publicPayload.sections[0].items[0].title, 'Herb-crusted salmon')
  assert.deepEqual(publicPayload.sections[0].items[0].dietaryLabels, [
    'Gluten free',
  ])
  assertNoSensitivePublicKeys('public menu payload', publicPayload)
  assert.equal(
    JSON.stringify(publicPayload).includes('SECRET COST NOTE'),
    false,
  )
  assert.equal(JSON.stringify(publicPayload).includes('should-not-leak'), false)

  assert.equal(isMenuStatus('readyForReview'), true)
  assert.equal(isMenuReviewAction('approve'), true)
  assert.equal(isMenuReviewAction('nope'), false)
  assert.equal(isOsDocumentId('abc123'), true)
  assert.equal(isOsDocumentId('../x'), false)
  assert.equal(clampMenuLimit('999'), 50)
  assert.equal(clampMenuPage('0'), 1)
  assert.equal(normalizeMenuSearch('x'.repeat(200)).length, 80)
  assert.deepEqual(menuViewStatuses('inReview'), ['sent', 'revisionRequested'])
  assert.ok(MENU_MUTATION_ALLOWLIST.includes('sections'))
  assert.equal(MENU_MUTATION_ALLOWLIST.includes('reviewTokenHash' as never), false)

  assert.equal(isMenuStructurePresetId('privateDinner'), true)
  assert.equal(isMenuStructurePresetId('not-real'), false)
  const dinner = MENU_STRUCTURE_PRESETS.find((p) => p.id === 'privateDinner')
  assert.ok(dinner)
  assert.deepEqual([...dinner!.sections], [
    'Welcome',
    'First Course',
    'Main Course',
    'Dessert',
  ])
  const custom = MENU_STRUCTURE_PRESETS.find((p) => p.id === 'custom')
  assert.equal(custom!.sections.length, 0)
  assert.equal(
    menuWorkflowGuidance('readyForReview').nextAction.includes('review link'),
    true,
  )
  assert.equal(menuWorkflowGuidance('sent').statusLabel, 'Sent')

  assert.equal(isRecipeStatus('approved'), true)
  assert.equal(isRecipeVisibility('private'), true)
  assert.equal(clampRecipeLimit('999'), 50)
  assert.equal(clampRecipePage('-1'), 1)
  assert.equal(normalizeRecipeSearch('x'.repeat(200)).length, 80)
  assert.ok(RECIPE_MUTATION_ALLOWLIST.includes('ingredients'))
  assert.equal(
    RECIPE_MUTATION_ALLOWLIST.includes('password' as never),
    false,
  )

  // Revision comment required
  const revisionValidation = await submitMenuReview({
    token: 'short',
    action: 'requestRevision',
    comment: '',
  })
  assert.equal(revisionValidation.ok, false)

  const invalidLookup = await lookupMenuReviewByToken('not-a-real-token-value-xxx')
  assert.equal(invalidLookup.state, 'invalid')
  assert.equal(invalidLookup.payload, null)

  const expiredLookupState = resolveReviewLinkState({
    hashFound: true,
    expiresAt: '2000-01-01T00:00:00.000Z',
  })
  assert.equal(expiredLookupState, 'expired')

  // --- Authorized Local API read smoke ---
  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: 'hello@platetheumpqua.com' } },
  })
  const user = users.docs[0]
  if (!user) {
    console.error('Martin user not found')
    process.exit(1)
  }

  assert.equal(canAccessPlateOS(asPlateUser(user)), true)
  assert.equal(canWriteCulinary(asPlateUser(user)), true)

  // Collections registered
  const collectionSlugs = payload.config.collections.map((c) => c.slug)
  assert.ok(collectionSlugs.includes('recipes'))
  assert.ok(collectionSlugs.includes('menus'))
  assert.ok(collectionSlugs.includes('menu-concepts'))

  const recipeList = await listRecipes(user as never, {
    view: 'all',
    page: '1',
    limit: '5',
  })
  assert.ok(recipeList.limit <= 50)
  assert.ok(Array.isArray(recipeList.rows))
  assertNoSensitivePublicKeys('recipe list rows', recipeList.rows)

  if (recipeList.rows[0]) {
    const detail = await getRecipeDetail(user as never, recipeList.rows[0].id)
    if (detail) {
      assert.equal(typeof detail.name, 'string')
      // list/detail for operators may include internal notes; ensure token/hash keys absent
      assert.equal(JSON.stringify(detail).includes('reviewTokenHash'), false)
    }
  }

  const menuList = await listMenus(user as never, {
    view: 'all',
    page: '1',
    limit: '5',
  })
  assert.ok(menuList.limit <= 50)
  assert.ok(Array.isArray(menuList.rows))

  if (menuList.rows[0]) {
    const detail = await getMenuDetail(user as never, menuList.rows[0].id)
    if (detail) {
      assert.equal(typeof detail.internalName, 'string')
      assert.equal(JSON.stringify(detail).includes('reviewTokenHash'), false)
      // Relationship handling: client href only when authorized object populated
      if (detail.clientHref) {
        assert.match(detail.clientHref, /^\/os\/clients\/[a-zA-Z0-9_-]+$/)
      }
    }
  }

  // Unauthenticated public find must not freely list menus/recipes
  let anonMenusBlocked = false
  try {
    await payload.find({
      collection: 'menus',
      overrideAccess: false,
      user: undefined,
      limit: 1,
    })
  } catch {
    anonMenusBlocked = true
  }
  assert.equal(anonMenusBlocked, true)

  let anonRecipesBlocked = false
  try {
    await payload.find({
      collection: 'recipes',
      overrideAccess: false,
      user: undefined,
      limit: 1,
    })
  } catch {
    anonRecipesBlocked = true
  }
  assert.equal(anonRecipesBlocked, true)

  console.log('verify-phase5-recipes-menus: OK')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
