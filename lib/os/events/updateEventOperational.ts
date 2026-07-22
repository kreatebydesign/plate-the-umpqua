'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  EVENT_UPDATE_ALLOWLIST,
  isEventStatus,
  type EventStatusValue,
} from './eventConstants'

export type UpdateEventResult =
  | { ok: true; id: string; eventStatus: string }
  | { ok: false; message: string }

/**
 * Allowlisted operational update for events.
 * Only `eventStatus` — collection has no hooks / external side effects.
 * Does not alter client identity, notes, venue, or financial package data.
 */
export async function updateEventOperational(
  rawId: unknown,
  rawInput: unknown,
): Promise<UpdateEventResult> {
  const user = await requirePlateOperator({ returnTo: '/os/events' })

  if (!canWriteOperational(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to update events.' }
  }

  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid event.' }
  }

  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return { ok: false, message: 'Invalid update.' }
  }

  const input = rawInput as Record<string, unknown>
  for (const key of Object.keys(input)) {
    if (!(EVENT_UPDATE_ALLOWLIST as readonly string[]).includes(key)) {
      return { ok: false, message: 'Unsupported field.' }
    }
  }

  const data: { eventStatus?: EventStatusValue } = {}

  if ('eventStatus' in input) {
    if (typeof input.eventStatus !== 'string' || !isEventStatus(input.eventStatus)) {
      return { ok: false, message: 'Invalid status.' }
    }
    data.eventStatus = input.eventStatus
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, message: 'No changes provided.' }
  }

  try {
    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'events',
      id: rawId,
      data,
      user,
      overrideAccess: false,
      depth: 0,
    })

    revalidatePath('/os')
    revalidatePath('/os/events')
    revalidatePath(`/os/events/${rawId}`)

    return {
      ok: true,
      id: String(updated.id),
      eventStatus: String(updated.eventStatus || data.eventStatus || ''),
    }
  } catch (err) {
    console.error('[os/events] update', err)
    return { ok: false, message: 'Unable to save changes.' }
  }
}
