import type { User } from '@/payload-types'

/** Roles defined on `users.role` in collections/Users.ts */
export type PlateRole =
  | 'admin'
  | 'hospitalityDirector'
  | 'experienceCurator'
  | 'culinaryTeam'
  | 'vendorPartner'
  | 'client'
  | 'team'

export type PlateUserLike = {
  id?: string | number | null
  role?: PlateRole | null
} | null | undefined

export function getUserRole(user: PlateUserLike): PlateRole | null {
  if (!user?.role) return null
  return user.role
}

export function isAuthenticated(user: PlateUserLike): boolean {
  return Boolean(user?.id)
}

/** Full operational authority for Release 1 */
export function isDirector(user: PlateUserLike): boolean {
  const role = getUserRole(user)
  return role === 'admin' || role === 'hospitalityDirector'
}

export function isAdmin(user: PlateUserLike): boolean {
  return getUserRole(user) === 'admin'
}

export function isExperienceCurator(user: PlateUserLike): boolean {
  return getUserRole(user) === 'experienceCurator'
}

export function isCulinaryTeam(user: PlateUserLike): boolean {
  return getUserRole(user) === 'culinaryTeam'
}

export function isTeam(user: PlateUserLike): boolean {
  return getUserRole(user) === 'team'
}

/** External roles — no Payload admin / operational data */
export function isExternalRole(user: PlateUserLike): boolean {
  const role = getUserRole(user)
  return role === 'vendorPartner' || role === 'client'
}

/**
 * Staff who may use the Payload admin panel.
 * Excludes vendorPartner and client.
 */
export function canAccessAdminPanel(user: PlateUserLike): boolean {
  if (!isAuthenticated(user) || isExternalRole(user)) return false
  const role = getUserRole(user)
  return (
    role === 'admin' ||
    role === 'hospitalityDirector' ||
    role === 'experienceCurator' ||
    role === 'culinaryTeam' ||
    role === 'team'
  )
}

/** Operator roles for future `/os/*` Business OS routes */
export function canAccessPlateOS(user: PlateUserLike): boolean {
  return isDirector(user) || isExperienceCurator(user)
}

export function canManageUsers(user: PlateUserLike): boolean {
  return isAdmin(user)
}

export function canWriteOperational(user: PlateUserLike): boolean {
  return isDirector(user) || isExperienceCurator(user)
}

export function canWriteCulinary(user: PlateUserLike): boolean {
  return isDirector(user) || isExperienceCurator(user) || isCulinaryTeam(user)
}

export function canReadOperational(user: PlateUserLike): boolean {
  return canAccessAdminPanel(user)
}

export function canReadDietary(user: PlateUserLike): boolean {
  return isDirector(user) || isExperienceCurator(user) || isCulinaryTeam(user)
}

export function canWriteDietary(user: PlateUserLike): boolean {
  return canReadDietary(user)
}

export function canWriteMedia(user: PlateUserLike): boolean {
  return canAccessAdminPanel(user)
}

export function canManageBrands(user: PlateUserLike): boolean {
  return isDirector(user)
}

export function canReadBrands(user: PlateUserLike): boolean {
  return canAccessAdminPanel(user)
}

/** Narrow helper for typed User documents from Payload */
export function asPlateUser(user: User | null | undefined): PlateUserLike {
  if (!user) return null
  return {
    id: user.id,
    role: user.role as PlateRole | null | undefined,
  }
}
