/**
 * Square location helpers.
 * Fetches available locations for the connected merchant.
 */

import { getSquareClient } from './client'

export type PlateSquareLocation = {
  id: string
  name: string
  address: string | null
  status: string
}

/** List all active locations for the connected Square merchant. */
export async function listSquareLocations(): Promise<PlateSquareLocation[]> {
  const client = await getSquareClient()
  const response = await client.locations.list()

  // HttpResponsePromise<ListLocationsResponse> resolves to ListLocationsResponse directly
  const locations = response.locations ?? []
  return locations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((l: any) => Boolean(l.id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((l: any) => ({
      id: l.id as string,
      name: (l.name ?? l.id) as string,
      address: l.address
        ? [l.address.addressLine1, l.address.locality, l.address.administrativeDistrictLevel1]
            .filter(Boolean)
            .join(', ') || null
        : null,
      status: (l.status ?? 'ACTIVE') as string,
    }))
}
