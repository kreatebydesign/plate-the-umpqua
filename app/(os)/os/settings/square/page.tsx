import type { Metadata } from 'next'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import { getAnySquareConnection } from '@/lib/os/square/connection'
import { isSandbox } from '@/lib/os/square/env'
import SquareSettingsClient from './SquareSettingsClient'

export const metadata: Metadata = {
  title: 'Square Integration',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SquareSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requirePlateOperator({ returnTo: '/os/settings/square' })

  if (!isDirector(asPlateUser(user))) {
    return (
      <div>
        <p>This page requires director access.</p>
      </div>
    )
  }

  const params = await searchParams
  const connected = params.connected === '1'
  const errorParam = typeof params.error === 'string' ? params.error : null

  const connection = await getAnySquareConnection()
  const sandboxMode = isSandbox()

  return (
    <SquareSettingsClient
      connection={connection}
      sandboxMode={sandboxMode}
      flashConnected={connected}
      flashError={errorParam}
    />
  )
}
