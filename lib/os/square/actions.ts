'use server'

/**
 * Square server actions — used by OS UI components.
 * All actions require director-level auth.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import {
  getSquareConnection,
  updateSquareLocation,
  disconnectSquareConnection,
  decryptAccessToken,
} from './connection'
import {
  revokeTokens,
  buildAuthorizeUrl,
  generateOAuthState,
  assertAuthorizeUrlSafe,
} from './oauth'
import { createSquarePaymentInvoice } from './createInvoice'
import { syncSquareInvoice } from './sync'
import { listSquareLocations } from './locations'
import { getPayload } from 'payload'
import config from '../../../payload.config'

type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; message: string }

async function requireDirector(returnTo = '/os/settings/square'): Promise<
  | { user: Awaited<ReturnType<typeof requirePlateOperator>>; error: null }
  | { user: null; error: string }
> {
  const user = await requirePlateOperator({ returnTo })
  if (!isDirector(asPlateUser(user))) {
    return { user: null, error: 'Directors only — this action requires director access.' }
  }
  return { user, error: null }
}

/** Select and confirm a Square location for the active connection. */
export async function selectSquareLocation(
  locationId: unknown,
  locationName: unknown,
): Promise<ActionResult> {
  const { user, error } = await requireDirector()
  if (error || !user) return { ok: false, message: error ?? 'Unauthorized' }

  if (typeof locationId !== 'string' || !locationId.trim()) {
    return { ok: false, message: 'Location ID is required.' }
  }

  try {
    const connection = await getSquareConnection()
    if (!connection) return { ok: false, message: 'No active Square connection.' }

    const trimmedId = locationId.trim()
    const locations = await listSquareLocations()
    const match = locations.find((l) => l.id === trimmedId)
    if (!match) {
      return {
        ok: false,
        message: 'That location ID is not available on the connected Square merchant.',
      }
    }

    await updateSquareLocation(
      connection.id,
      match.id,
      typeof locationName === 'string' && locationName.trim()
        ? locationName.trim()
        : match.name,
    )

    revalidatePath('/os/settings/square')
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unable to select location.' }
  }
}

/** List Square locations for the connected merchant (read-only). */
export async function listConnectedSquareLocations(): Promise<
  ActionResult<{
    locations: Array<{ id: string; name: string; status: string; address: string | null }>
  }>
> {
  const { user, error } = await requireDirector()
  if (error || !user) return { ok: false, message: error ?? 'Unauthorized' }

  try {
    const connection = await getSquareConnection()
    if (!connection) return { ok: false, message: 'No active Square connection.' }

    const locations = await listSquareLocations()
    return {
      ok: true,
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        status: l.status,
        address: l.address,
      })),
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to list Square locations.',
    }
  }
}

/** Disconnect Square: revokes tokens and marks connection disconnected. */
export async function disconnectSquare(): Promise<ActionResult> {
  const { user, error } = await requireDirector()
  if (error || !user) return { ok: false, message: error ?? 'Unauthorized' }

  try {
    const connection = await getSquareConnection()
    if (!connection) return { ok: false, message: 'No active Square connection.' }

    let accessToken: string | null = null
    try {
      accessToken = await decryptAccessToken(connection.id)
    } catch {
      // Non-fatal — proceed with local disconnect even if we can't decrypt
    }

    if (accessToken) {
      await revokeTokens(connection.merchantId, accessToken)
    }

    await disconnectSquareConnection(connection.id)

    revalidatePath('/os/settings/square')
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unable to disconnect Square.' }
  }
}

/** Create a Square payment invoice for a Plate invoice. */
export async function createSquarePaymentInvoiceAction(
  invoiceId: unknown,
): Promise<ActionResult<{ squarePublicUrl: string; squareInvoiceId: string }>> {
  const { user, error } = await requireDirector('/os/invoices')
  if (error || !user) return { ok: false, message: error ?? 'Unauthorized' }

  if (typeof invoiceId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(invoiceId)) {
    return { ok: false, message: 'Invalid invoice ID.' }
  }

  try {
    const result = await createSquarePaymentInvoice(invoiceId)

    revalidatePath(`/os/invoices/${invoiceId}`)
    revalidatePath('/os/invoices')

    return {
      ok: true,
      squarePublicUrl: result.squarePublicUrl,
      squareInvoiceId: result.squareInvoiceId,
    }
  } catch (err) {
    console.error('[square/actions] createSquarePaymentInvoice', err)
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to create Square invoice.',
    }
  }
}

/** Sync Square invoice state (pull payments, update status). */
export async function syncSquareInvoiceAction(
  invoiceId: unknown,
): Promise<ActionResult<{ newPayments: number; squareStatus: string | null }>> {
  const { user, error } = await requireDirector('/os/invoices')
  if (error || !user) return { ok: false, message: error ?? 'Unauthorized' }

  if (typeof invoiceId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(invoiceId)) {
    return { ok: false, message: 'Invalid invoice ID.' }
  }

  try {
    const result = await syncSquareInvoice(invoiceId)

    revalidatePath(`/os/invoices/${invoiceId}`)
    revalidatePath('/os/invoices')

    return {
      ok: true,
      newPayments: result.newPaymentsRecorded,
      squareStatus: result.squareStatus,
    }
  } catch (err) {
    console.error('[square/actions] syncSquareInvoice', err)
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to sync Square invoice.',
    }
  }
}

/** Generate an OAuth start URL (for client-side redirect). */
export async function getSquareOAuthStartUrl(): Promise<ActionResult<{ url: string }>> {
  const { user, error } = await requireDirector()
  if (error || !user) return { ok: false, message: error ?? 'Unauthorized' }

  try {
    const { state, expiresAt } = generateOAuthState()

    const payload = await getPayload({ config })
    await (payload as any).create({
      collection: 'square-oauth-states',
      overrideAccess: true,
      data: {
        state,
        expiresAt,
        createdBy: user.id,
        usedAt: null,
      },
    })

    const url = buildAuthorizeUrl(state)
    assertAuthorizeUrlSafe(url)
    return { ok: true, url }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unable to start OAuth.' }
  }
}
