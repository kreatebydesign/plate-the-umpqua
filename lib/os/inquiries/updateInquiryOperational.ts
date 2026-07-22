'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  INQUIRY_UPDATE_ALLOWLIST,
  isInquiryPriority,
  isInquiryStatus,
  type InquiryPriorityValue,
  type InquiryStatusValue,
} from './inquiryConstants'

export type UpdateInquiryResult =
  | { ok: true; id: string; status: string; priorityLevel: string }
  | { ok: false; message: string }

/**
 * Allowlisted operational update for inquiries.
 * Does not alter contact identity, original vision, dietary notes, or internal notes.
 *
 * Collection hook: if status is set to `newLead` while experienceVision exists,
 * Payload beforeChange advances it to `discoveryNeeded` (no email/external side effect).
 */
export async function updateInquiryOperational(
  rawId: unknown,
  rawInput: unknown,
): Promise<UpdateInquiryResult> {
  const user = await requirePlateOperator({ returnTo: '/os/inquiries' })

  if (!canWriteOperational(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to update inquiries.' }
  }

  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid inquiry.' }
  }

  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return { ok: false, message: 'Invalid update.' }
  }

  const input = rawInput as Record<string, unknown>
  for (const key of Object.keys(input)) {
    if (!(INQUIRY_UPDATE_ALLOWLIST as readonly string[]).includes(key)) {
      return { ok: false, message: 'Unsupported field.' }
    }
  }

  const data: {
    status?: InquiryStatusValue
    priorityLevel?: InquiryPriorityValue
  } = {}

  if ('status' in input) {
    if (typeof input.status !== 'string' || !isInquiryStatus(input.status)) {
      return { ok: false, message: 'Invalid status.' }
    }
    data.status = input.status
  }

  if ('priorityLevel' in input) {
    if (typeof input.priorityLevel !== 'string' || !isInquiryPriority(input.priorityLevel)) {
      return { ok: false, message: 'Invalid priority.' }
    }
    data.priorityLevel = input.priorityLevel
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, message: 'No changes provided.' }
  }

  try {
    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'inquiries',
      id: rawId,
      data,
      user,
      overrideAccess: false,
      depth: 0,
    })

    revalidatePath('/os')
    revalidatePath('/os/inquiries')
    revalidatePath(`/os/inquiries/${rawId}`)

    return {
      ok: true,
      id: String(updated.id),
      status: String(updated.status || data.status || ''),
      priorityLevel: String(updated.priorityLevel || data.priorityLevel || ''),
    }
  } catch (err) {
    console.error('[os/inquiries] update', err)
    return { ok: false, message: 'Unable to save changes.' }
  }
}
