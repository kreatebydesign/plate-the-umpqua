import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import OsShell from '@/components/os/OsShell'
import {
  requirePlateOperator,
  getPlateUserRole,
  safeOsReturnPath,
} from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import { ROLE_LABELS } from '@/lib/os/constants'

export const dynamic = 'force-dynamic'

export default async function OsAppLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers()
  const returnTo = safeOsReturnPath(hdrs.get('x-os-pathname') || '/os')
  const user = await requirePlateOperator({ returnTo })
  const role = getPlateUserRole(user)
  const userName = user.fullName?.trim() || user.email || 'Operator'
  const userRoleLabel = (role && ROLE_LABELS[role]) || 'Operator'
  const isDir = isDirector(asPlateUser(user))

  return (
    <OsShell userName={userName} userRoleLabel={userRoleLabel} isDirector={isDir}>
      {children}
    </OsShell>
  )
}
