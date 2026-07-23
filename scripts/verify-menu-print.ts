/**
 * Menu print projection smoke tests.
 * Does not mutate production business records.
 * Run: npx --yes tsx scripts/verify-menu-print.ts
 */
import assert from 'node:assert/strict'
import {
  assertNoSensitivePublicKeys,
  buildPublicMenuReviewPayload,
} from '../lib/os/menus/publicReviewPayload'
import {
  buildMenuPrintPayload,
  DEFAULT_MENU_PRINT_STYLE,
  isMenuPrintStyle,
  MENU_PRINT_EXCLUDED_RENDER_KEYS,
  MENU_PRINT_FIELD_ALLOWLIST,
  MENU_PRINT_STYLES,
  menuPrintHasInvestment,
  menuPrintIsEmpty,
  parseMenuPrintStyle,
} from '../lib/os/menus/menuPrintPresentation'

function fixtureMenu(overrides: Record<string, unknown> = {}) {
  return {
    occasionTitle: 'Anniversary Dinner on the Umpqua',
    serviceDate: '2026-09-12T19:00:00.000Z',
    guestCount: 8,
    introductoryMessage: 'A quiet evening of Oregon hospitality.',
    pricingPresentation: 'Presented as a private culinary experience.',
    displayInvestment: 2400,
    version: 3,
    status: 'readyForReview',
    sections: [
      {
        sectionName: 'First Course',
        items: [
          {
            clientTitle: 'Heirloom Tomato Consommé',
            clientDescription: 'Basil oil, garden herbs',
            showDietary: true,
            dietaryDisplay: 'Vegetarian, Gluten-free',
            allergenDisplay: 'None noted',
            internalItemNotes: 'SECRET prep note',
            recipe: { id: 'recipe-secret' },
          },
        ],
      },
      {
        sectionName: 'Main Course',
        items: [
          {
            clientTitle: 'Dry-aged Ribeye',
            clientDescription: null,
            showDietary: false,
            dietaryDisplay: 'Should not show',
            allergenDisplay: 'Hidden',
            internalItemNotes: 'cost $42',
          },
        ],
      },
    ],
    ...overrides,
  }
}

function assertPrintSafePayload(label: string, payload: unknown) {
  assertNoSensitivePublicKeys(label, payload)
  const serialized = JSON.stringify(payload)
  for (const key of MENU_PRINT_EXCLUDED_RENDER_KEYS) {
    // version/status exist on the shared public payload object but must not
    // be treated as printable content fields in the allowlist.
    if (key === 'version' || key === 'status') continue
    assert.equal(
      serialized.includes(`"${key}"`),
      false,
      `${label}: excluded key present: ${key}`,
    )
  }
}

async function main() {
  assert.equal(MENU_PRINT_STYLES.length, 3)
  assert.equal(isMenuPrintStyle('classic'), true)
  assert.equal(isMenuPrintStyle('event'), true)
  assert.equal(isMenuPrintStyle('minimal'), true)
  assert.equal(isMenuPrintStyle('canva'), false)
  assert.equal(parseMenuPrintStyle('event'), 'event')
  assert.equal(parseMenuPrintStyle('nope'), DEFAULT_MENU_PRINT_STYLE)
  assert.equal(parseMenuPrintStyle(undefined), DEFAULT_MENU_PRINT_STYLE)
  assert.ok(MENU_PRINT_FIELD_ALLOWLIST.includes('occasionTitle'))
  assert.ok(MENU_PRINT_FIELD_ALLOWLIST.includes('sections.items.title'))
  assert.equal(
    MENU_PRINT_FIELD_ALLOWLIST.includes('internalNotes' as never),
    false,
  )

  const shortDinner = buildMenuPrintPayload(fixtureMenu())
  assertPrintSafePayload('shortDinner', shortDinner)
  assert.equal(shortDinner.brandName, 'Plate The Umpqua')
  assert.equal(shortDinner.occasionTitle, 'Anniversary Dinner on the Umpqua')
  assert.ok(shortDinner.serviceDateLabel)
  assert.equal(shortDinner.guestCount, 8)
  assert.equal(shortDinner.sections.length, 2)
  assert.deepEqual(shortDinner.sections[0].items[0].dietaryLabels, [
    'Vegetarian',
    'Gluten-free',
  ])
  assert.equal(shortDinner.sections[1].items[0].dietaryLabels.length, 0)
  assert.equal(shortDinner.displayInvestment, '$2,400')
  assert.equal(menuPrintHasInvestment(shortDinner), true)
  assert.equal(menuPrintIsEmpty(shortDinner), false)
  assert.equal(Object.hasOwn(shortDinner, 'internalNotes'), false)

  const longMenu = buildMenuPrintPayload(
    fixtureMenu({
      occasionTitle:
        'The Annual Southern Oregon Private Chef Celebration and Estate Gathering for Distinguished Guests of the Umpqua Valley',
      sections: Array.from({ length: 8 }, (_, sectionIndex) => ({
        sectionName: `Course ${sectionIndex + 1} — Extended Hospitality Presentation`,
        items: Array.from({ length: 4 }, (__, itemIndex) => ({
          clientTitle: `Very Long Dish Title Number ${itemIndex + 1} with Seasonal Oregon Ingredients and Estate Garden Accents`,
          clientDescription:
            'A thoughtfully composed description that is intentionally long to verify wrapping, pagination, and break-inside behavior for premium Letter output without exposing any internal culinary notes.',
          showDietary: itemIndex % 2 === 0,
          dietaryDisplay: 'Dairy-free',
          allergenDisplay: 'Tree nuts',
          internalItemNotes: 'never print',
        })),
      })),
    }),
  )
  assertPrintSafePayload('longMenu', longMenu)
  assert.equal(longMenu.sections.length, 8)
  assert.ok(longMenu.occasionTitle.length > 80)

  const pricingHidden = buildMenuPrintPayload(
    fixtureMenu({
      pricingPresentation: '',
      displayInvestment: null,
    }),
  )
  assert.equal(menuPrintHasInvestment(pricingHidden), false)
  assert.equal(pricingHidden.displayInvestment, null)
  assert.equal(pricingHidden.pricingPresentation, null)

  const emptyMenu = buildMenuPrintPayload(
    fixtureMenu({
      sections: [{ sectionName: 'Welcome', items: [] }],
      introductoryMessage: null,
      guestCount: null,
      serviceDate: null,
    }),
  )
  assert.equal(menuPrintIsEmpty(emptyMenu), true)
  assert.equal(emptyMenu.serviceDateLabel, null)
  assert.equal(emptyMenu.guestCount, null)

  const viaPublic = buildPublicMenuReviewPayload(fixtureMenu())
  const viaPrint = buildMenuPrintPayload(fixtureMenu())
  assert.deepEqual(viaPrint, viaPublic)

  console.log('verify-menu-print: ok')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
