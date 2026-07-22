import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '../../payload.config'
import {
  asPlateUser,
  canAccessPlateOS,
  canAccessAdminPanel,
} from '@/lib/access/roles'
import type { User } from '@/payload-types'

/**
 * Resolve the current Payload session user from request cookies/headers.
 * Server-side only — do not use as a client guard.
 */
export async function getPlateSessionUser(): Promise<User | null> {
  const payload = await getPayload({ config })
  const hdrs = await headers()
  const { user } = await payload.auth({ headers: hdrs })
  return (user as User | null) ?? null
}

/**
 * Only allow same-origin relative return paths under `/os`.
 * Blocks open redirects (`//`, protocols, escapes).
 */
export function safeOsReturnPath(path: string | null | undefined): string {
  if (!path) return '/os'
  if (!path.startsWith('/os')) return '/os'
  if (path.startsWith('//')) return '/os'
  if (path.includes('://') || path.includes('\\') || path.includes('\n')) {
    return '/os'
  }
  return path
}

function loginRedirect(returnTo?: string) {
  const safe = safeOsReturnPath(returnTo)
  return `/admin/login?redirect=${encodeURIComponent(safe)}`
}

/**
 * Require an authenticated internal staff user (admin panel eligible).
 * Redirects to Payload login when unauthenticated or external-role.
 */
export async function requirePlateStaff(options?: {
  redirectTo?: string
  returnTo?: string
}): Promise<User> {
  const user = await getPlateSessionUser()
  if (!user || !canAccessAdminPanel(asPlateUser(user))) {
    redirect(options?.redirectTo ?? loginRedirect(options?.returnTo))
  }
  return user
}

/**
 * Require a Plate Business OS operator (admin, hospitalityDirector, experienceCurator).
 * Use this for `/os/*` route protection.
 */
export async function requirePlateOperator(options?: {
  redirectTo?: string
  returnTo?: string
}): Promise<User> {
  const user = await getPlateSessionUser()
  if (!user || !canAccessPlateOS(asPlateUser(user))) {
    redirect(options?.redirectTo ?? loginRedirect(options?.returnTo ?? '/os'))
  }
  return user
}

export function getPlateUserRole(user: User | null | undefined) {
  return asPlateUser(user)?.role ?? null
}
