/**
 * Temporary: list active Square Sandbox locations for location selection.
 * Returns names + IDs only. Never returns tokens. Remove after use.
 */

import { NextResponse } from 'next/server'
import { listSquareLocations } from '@/lib/os/square/locations'
import { isSandbox } from '@/lib/os/square/env'

export const dynamic = 'force-dynamic'

function redactId(id: string): string {
  if (id.length < 8) return 'too_short'
  return `${id.slice(0, 4)}…${id.slice(-4)}`
}

export async function GET(): Promise<NextResponse> {
  if (!isSandbox()) {
    return NextResponse.json({ error: 'Sandbox only' }, { status: 403 })
  }

  try {
    const locations = await listSquareLocations()
    const active = locations.filter((l) => (l.status || 'ACTIVE').toUpperCase() === 'ACTIVE')

    return NextResponse.json({
      temporary: true,
      environment: 'sandbox',
      activeLocationCount: active.length,
      locations: active.map((l) => ({
        name: l.name,
        locationIdRedacted: redactId(l.id),
        locationId: l.id,
      })),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to list locations' },
      { status: 500 },
    )
  }
}
