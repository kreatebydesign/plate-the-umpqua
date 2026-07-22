/**
 * Phase 0 verification — pure helpers only (no DB / network).
 * Run: npx --yes tsx scripts/verify-phase0.ts
 */

import assert from 'node:assert/strict'
import {
  canAccessAdminPanel,
  canAccessPlateOS,
  canManageUsers,
  canReadDietary,
  canWriteOperational,
  isDirector,
  isExternalRole,
  type PlateUserLike,
} from '../lib/access/roles'
import {
  operationalCollectionAccess,
  dietaryNotesAccess,
  mediaCollectionAccess,
  usersCollectionAccess,
} from '../lib/access'
import { validatePublicInquiry } from '../lib/inquiry/validatePublicInquiry'

function user(role: NonNullable<PlateUserLike>['role'], id = '1'): PlateUserLike {
  return { id, role }
}

function checkAccess(
  accessFn: (args: any) => unknown,
  role: PlateUserLike,
  expected: boolean,
  label: string,
) {
  const result = accessFn({ req: { user: role } })
  const allowed =
    result === true || (typeof result === 'object' && result !== null)
  assert.equal(allowed, expected, label)
}

console.log('Phase 0 access + inquiry verification\n')

// --- Role matrix ---
assert.equal(isDirector(user('admin')), true)
assert.equal(isDirector(user('hospitalityDirector')), true)
assert.equal(isDirector(user('experienceCurator')), false)
assert.equal(isExternalRole(user('vendorPartner')), true)
assert.equal(isExternalRole(user('client')), true)
assert.equal(canAccessAdminPanel(user('vendorPartner')), false)
assert.equal(canAccessAdminPanel(user('client')), false)
assert.equal(canAccessAdminPanel(user('team')), true)
assert.equal(canAccessAdminPanel(user('culinaryTeam')), true)
assert.equal(canAccessPlateOS(user('admin')), true)
assert.equal(canAccessPlateOS(user('experienceCurator')), true)
assert.equal(canAccessPlateOS(user('team')), false)
assert.equal(canManageUsers(user('admin')), true)
assert.equal(canManageUsers(user('hospitalityDirector')), false)
assert.equal(canWriteOperational(user('experienceCurator')), true)
assert.equal(canWriteOperational(user('team')), false)
assert.equal(canReadDietary(user('team')), false)
assert.equal(canReadDietary(user('culinaryTeam')), true)
assert.equal(canReadDietary(null), false)
console.log('✓ role predicates')

// --- Collection access matrix (representative) ---
const roles: Array<[string, PlateUserLike, boolean, boolean, boolean, boolean]> = [
  // label, user, inquiriesRead, inquiriesWrite, dietaryRead, mediaRead
  ['anonymous', null, false, false, false, true],
  ['admin', user('admin'), true, true, true, true],
  ['hospitalityDirector', user('hospitalityDirector'), true, true, true, true],
  ['experienceCurator', user('experienceCurator'), true, true, true, true],
  ['culinaryTeam', user('culinaryTeam'), true, false, true, true],
  ['team', user('team'), true, false, false, true],
  ['vendorPartner', user('vendorPartner'), false, false, false, true],
  ['client', user('client'), false, false, false, true],
]

for (const [label, u, inqRead, inqWrite, dietRead, mediaRead] of roles) {
  checkAccess(operationalCollectionAccess.read, u, inqRead, `${label} inquiries read`)
  checkAccess(operationalCollectionAccess.create, u, inqWrite, `${label} inquiries create`)
  checkAccess(dietaryNotesAccess.read, u, dietRead, `${label} dietary read`)
  checkAccess(mediaCollectionAccess.read, u, mediaRead, `${label} media read`)
  checkAccess(
    mediaCollectionAccess.create,
    u,
    label !== 'anonymous' &&
      label !== 'vendorPartner' &&
      label !== 'client',
    `${label} media create`,
  )
}

checkAccess(usersCollectionAccess.admin, user('admin'), true, 'admin panel admin')
checkAccess(usersCollectionAccess.admin, user('hospitalityDirector'), true, 'HD panel')
checkAccess(usersCollectionAccess.admin, user('vendorPartner'), false, 'vendor no panel')
checkAccess(usersCollectionAccess.admin, null, false, 'anon no panel')
checkAccess(usersCollectionAccess.delete, user('admin'), true, 'admin delete users')
checkAccess(
  usersCollectionAccess.delete,
  user('hospitalityDirector'),
  false,
  'HD cannot delete users',
)
console.log('✓ collection access matrix')

// --- Inquiry validation ---
const good = validatePublicInquiry({
  name: 'Martin Host',
  email: 'martin@example.com',
  phone: '541-555-0100',
  location: 'Roseburg',
  guests: '5-10 Guests',
  budget: '750-1500',
  packageInterest: 'Estate',
  urgency: 'this-month',
  occasion: 'Anniversary',
  details: 'Wine country dinner',
  source: 'website',
  companyWebsite: '',
  formStartedAt: Date.now() - 5000,
})
assert.equal(good.ok, true)

const honeypot = validatePublicInquiry({
  name: 'Bot',
  email: 'bot@example.com',
  companyWebsite: 'https://spam.test',
  formStartedAt: Date.now() - 5000,
})
assert.equal(honeypot.ok, false)
if (!honeypot.ok) assert.equal(honeypot.code, 'honeypot')

const unsupported = validatePublicInquiry({
  name: 'X',
  email: 'x@example.com',
  status: 'approved',
  internalNotes: 'pwn',
  formStartedAt: Date.now() - 5000,
})
assert.equal(unsupported.ok, false)

const badEmail = validatePublicInquiry({
  name: 'X',
  email: 'not-an-email',
  formStartedAt: Date.now() - 5000,
})
assert.equal(badEmail.ok, false)

const tooFast = validatePublicInquiry(
  {
    name: 'X',
    email: 'x@example.com',
    formStartedAt: Date.now() - 100,
  },
  { now: Date.now() },
)
assert.equal(tooFast.ok, false)

const badBudget = validatePublicInquiry({
  name: 'X',
  email: 'x@example.com',
  budget: '999999',
  formStartedAt: Date.now() - 5000,
})
assert.equal(badBudget.ok, false)

console.log('✓ inquiry validation')

console.log('\nAll Phase 0 helper checks passed.')
