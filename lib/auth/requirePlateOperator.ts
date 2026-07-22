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
 * Require an authenticated internal staff user (admin panel eligible).
 * Redirects to Payload login when unauthenticated or external-role.
 */
export async function requirePlateStaff(options?: {
  redirectTo?: string
}): Promise<User> {
  const user = await getPlateSessionUser()
  if (!user || !canAccessAdminPanel(asPlateUser(user))) {
    redirect(options?.redirectTo ?? '/admin/login')
  }
  return user
}

/**
 * Require a Plate Business OS operator (admin, hospitalityDirector, experienceCurator).
 * Use this for future `/os/*` route protection — Phase 1+.
 */
export async function requirePlateOperator(options?: {
  redirectTo?: string
}): Promise<User> {
  const user = await getPlateSessionUser()
  if (!user || !canAccessPlateOS(asPlateUser(user))) {
    redirect(options?.redirectTo ?? '/admin/login')
  }
  return user
}

export function getPlateUserRole(user: User | null | undefined) {
  return asPlateUser(user)?.role ?? null
}
