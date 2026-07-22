/** Plate OS Recipe Library — enums, labels, bounds, allowlists */

export const RECIPE_PAGE_SIZE_DEFAULT = 20
export const RECIPE_PAGE_SIZE_MAX = 50
export const RECIPE_SEARCH_MAX = 80

export const RECIPE_STATUS_VALUES = [
  'draft',
  'tested',
  'approved',
  'archived',
] as const

export type RecipeStatusValue = (typeof RECIPE_STATUS_VALUES)[number]

export const RECIPE_STATUS_LABELS: Record<RecipeStatusValue, string> = {
  draft: 'Draft',
  tested: 'Tested',
  approved: 'Approved',
  archived: 'Archived',
}

export const RECIPE_VISIBILITY_VALUES = [
  'private',
  'menuReady',
  'publishingCandidate',
] as const

export type RecipeVisibilityValue = (typeof RECIPE_VISIBILITY_VALUES)[number]

export const RECIPE_VISIBILITY_LABELS: Record<RecipeVisibilityValue, string> = {
  private: 'Private',
  menuReady: 'Menu-ready',
  publishingCandidate: 'Publishing candidate',
}

export const RECIPE_CATEGORY_VALUES = [
  'appetizer',
  'soup',
  'salad',
  'firstCourse',
  'main',
  'side',
  'dessert',
  'beverage',
  'amuse',
  'bread',
  'sauce',
  'other',
] as const

export type RecipeCategoryValue = (typeof RECIPE_CATEGORY_VALUES)[number]

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategoryValue, string> = {
  appetizer: 'Appetizer',
  soup: 'Soup',
  salad: 'Salad',
  firstCourse: 'First course',
  main: 'Main',
  side: 'Side',
  dessert: 'Dessert',
  beverage: 'Beverage',
  amuse: 'Amuse',
  bread: 'Bread',
  sauce: 'Sauce',
  other: 'Other',
}

export const RECIPE_CUISINE_VALUES = [
  'modernAmerican',
  'italian',
  'french',
  'japanese',
  'mediterranean',
  'wineCountrySeasonal',
  'pacificNorthwest',
  'farmToTable',
  'custom',
] as const

export type RecipeCuisineValue = (typeof RECIPE_CUISINE_VALUES)[number]

export const RECIPE_CUISINE_LABELS: Record<RecipeCuisineValue, string> = {
  modernAmerican: 'Modern American',
  italian: 'Italian',
  french: 'French',
  japanese: 'Japanese',
  mediterranean: 'Mediterranean',
  wineCountrySeasonal: 'Wine Country Seasonal',
  pacificNorthwest: 'Pacific Northwest',
  farmToTable: 'Farm-to-Table',
  custom: 'Custom',
}

export const RECIPE_COURSE_VALUES = [
  'welcome',
  'appetizer',
  'first',
  'main',
  'side',
  'dessert',
  'beverage',
  'other',
] as const

export type RecipeCourseValue = (typeof RECIPE_COURSE_VALUES)[number]

export const RECIPE_COURSE_LABELS: Record<RecipeCourseValue, string> = {
  welcome: 'Welcome',
  appetizer: 'Appetizer',
  first: 'First course',
  main: 'Main course',
  side: 'Side',
  dessert: 'Dessert',
  beverage: 'Beverage',
  other: 'Other',
}

export const RECIPE_DIETARY_VALUES = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'glutenFree',
  'dairyFree',
  'nutFree',
  'halal',
  'kosher',
] as const

export type RecipeDietaryValue = (typeof RECIPE_DIETARY_VALUES)[number]

export const RECIPE_DIETARY_LABELS: Record<RecipeDietaryValue, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
  glutenFree: 'Gluten free',
  dairyFree: 'Dairy free',
  nutFree: 'Nut free',
  halal: 'Halal',
  kosher: 'Kosher',
}

export const RECIPE_ALLERGEN_VALUES = [
  'gluten',
  'dairy',
  'eggs',
  'treeNuts',
  'peanuts',
  'shellfish',
  'fish',
  'soy',
  'sesame',
  'pork',
  'alcohol',
] as const

export type RecipeAllergenValue = (typeof RECIPE_ALLERGEN_VALUES)[number]

export const RECIPE_ALLERGEN_LABELS: Record<RecipeAllergenValue, string> = {
  gluten: 'Gluten',
  dairy: 'Dairy',
  eggs: 'Eggs',
  treeNuts: 'Tree nuts',
  peanuts: 'Peanuts',
  shellfish: 'Shellfish',
  fish: 'Fish',
  soy: 'Soy',
  sesame: 'Sesame',
  pork: 'Pork',
  alcohol: 'Alcohol',
}

export const RECIPE_YIELD_UNIT_VALUES = [
  'servings',
  'portions',
  'pieces',
  'batch',
] as const

export type RecipeYieldUnitValue = (typeof RECIPE_YIELD_UNIT_VALUES)[number]

export const RECIPE_YIELD_UNIT_LABELS: Record<RecipeYieldUnitValue, string> = {
  servings: 'Servings',
  portions: 'Portions',
  pieces: 'Pieces',
  batch: 'Batch',
}

export type RecipeListView = 'all' | 'menuReady' | 'publishing' | 'archived'

export const RECIPE_VIEW_OPTIONS: Array<{ value: RecipeListView; label: string }> = [
  { value: 'all', label: 'All recipes' },
  { value: 'menuReady', label: 'Menu-ready' },
  { value: 'publishing', label: 'Publishing candidates' },
  { value: 'archived', label: 'Archived' },
]

export type RecipeSortValue = 'newest' | 'oldest' | 'nameAsc'

export const RECIPE_SORT_OPTIONS: Array<{ value: RecipeSortValue; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'nameAsc', label: 'Name A–Z' },
]

/** Fields allowed on OS recipe create/update mutations. */
export const RECIPE_MUTATION_ALLOWLIST = [
  'name',
  'shortDescription',
  'category',
  'cuisine',
  'course',
  'dietaryTags',
  'allergenTags',
  'yieldQuantity',
  'yieldUnit',
  'prepTimeMinutes',
  'cookTimeMinutes',
  'ingredients',
  'steps',
  'chefNotes',
  'platingNotes',
  'storageNotes',
  'internalCostNotes',
  'featuredImage',
  'status',
  'visibility',
  'slug',
  'publicTitle',
  'publicSummary',
  'heroImage',
  'chefIntroduction',
] as const

export type RecipeMutationField = (typeof RECIPE_MUTATION_ALLOWLIST)[number]

export function isRecipeStatus(value: string): value is RecipeStatusValue {
  return (RECIPE_STATUS_VALUES as readonly string[]).includes(value)
}

export function isRecipeVisibility(
  value: string,
): value is RecipeVisibilityValue {
  return (RECIPE_VISIBILITY_VALUES as readonly string[]).includes(value)
}

export function isRecipeCategory(value: string): value is RecipeCategoryValue {
  return (RECIPE_CATEGORY_VALUES as readonly string[]).includes(value)
}

export function isRecipeCuisine(value: string): value is RecipeCuisineValue {
  return (RECIPE_CUISINE_VALUES as readonly string[]).includes(value)
}

export function isRecipeCourse(value: string): value is RecipeCourseValue {
  return (RECIPE_COURSE_VALUES as readonly string[]).includes(value)
}

export function isRecipeDietary(value: string): value is RecipeDietaryValue {
  return (RECIPE_DIETARY_VALUES as readonly string[]).includes(value)
}

export function isRecipeAllergen(value: string): value is RecipeAllergenValue {
  return (RECIPE_ALLERGEN_VALUES as readonly string[]).includes(value)
}

export function isRecipeYieldUnit(
  value: string,
): value is RecipeYieldUnitValue {
  return (RECIPE_YIELD_UNIT_VALUES as readonly string[]).includes(value)
}

export function isRecipeListView(value: string): value is RecipeListView {
  return ['all', 'menuReady', 'publishing', 'archived'].includes(value)
}

export function isRecipeSort(value: string): value is RecipeSortValue {
  return value === 'newest' || value === 'oldest' || value === 'nameAsc'
}

export function recipeStatusLabel(value?: string | null) {
  if (!value) return '—'
  return RECIPE_STATUS_LABELS[value as RecipeStatusValue] || value
}

export function recipeVisibilityLabel(value?: string | null) {
  if (!value) return '—'
  return RECIPE_VISIBILITY_LABELS[value as RecipeVisibilityValue] || value
}

export function recipeCategoryLabel(value?: string | null) {
  if (!value) return '—'
  return RECIPE_CATEGORY_LABELS[value as RecipeCategoryValue] || value
}

export function clampRecipePage(raw: string | null | undefined): number {
  const n = Number.parseInt(String(raw || ''), 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, 10_000)
}

export function clampRecipeLimit(raw: string | null | undefined): number {
  const n = Number.parseInt(String(raw || ''), 10)
  if (!Number.isFinite(n) || n < 1) return RECIPE_PAGE_SIZE_DEFAULT
  return Math.min(n, RECIPE_PAGE_SIZE_MAX)
}

export function normalizeRecipeSearch(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().slice(0, RECIPE_SEARCH_MAX)
}

export function slugifyRecipeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
