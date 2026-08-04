import type { Metadata } from 'next'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import { getAnySquareConnection, getSquareConnection } from '@/lib/os/square/connection'
import { isSandbox } from '@/lib/os/square/env'
import { listSquareLocations } from '@/lib/os/square/locations'
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

  // Environment-scoped: never show a Sandbox connection while running Production (and vice versa).
  const active = await getSquareConnection()
  const connection = active ?? (await getAnySquareConnection())
  const sandboxMode = isSandbox()

  let locations: Array<{ id: string; name: string; status: string; address: string | null }> = []
  let locationsError: string | null = null
  if (active) {
    try {
      locations = await listSquareLocations()
    } catch (err) {
      locationsError = err instanceof Error ? err.message : 'Unable to list Square locations.'
    }
  }

  return (
    <SquareSettingsClient
      connection={connection}
      sandboxMode={sandboxMode}
      flashConnected={connected}
      flashError={errorParam}
      locations={locations}
      locationsError={locationsError}
    />
  )
}
