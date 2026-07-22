import type { ReactNode } from 'react'
import OsShell from '@/components/os/OsShell'
import { requirePlateOperator, getPlateUserRole } from '@/lib/auth/requirePlateOperator'
import { ROLE_LABELS } from '@/lib/os/constants'

export const dynamic = 'force-dynamic'

export default async function OsAppLayout({ children }: { children: ReactNode }) {
  const user = await requirePlateOperator({ returnTo: '/os' })
  const role = getPlateUserRole(user)
  const userName = user.fullName?.trim() || user.email || 'Operator'
  const userRoleLabel = (role && ROLE_LABELS[role]) || 'Operator'

  return (
    <OsShell userName={userName} userRoleLabel={userRoleLabel}>
      {children}
    </OsShell>
  )
}
