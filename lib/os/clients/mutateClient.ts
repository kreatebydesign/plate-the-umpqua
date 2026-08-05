'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  CLIENT_TYPE_VALUES,
  CLIENT_VIP_VALUES,
  isClientType,
  isClientVip,
  type ClientTypeValue,
  type ClientVipValue,
} from './clientConstants'

export type ClientMutationResult =
  | { ok: true; id: string }
  | { ok: false; message: string }

function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function cleanEmail(value: unknown): string {
  const email = cleanText(value, 160).toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ''
  return email
}

async function requireWriter(returnTo: string) {
  const user = await requirePlateOperator({ returnTo })
  if (!canWriteOperational(asPlateUser(user))) {
    return { user: null as never, error: 'You do not have permission to manage clients.' }
  }
  return { user, error: null as string | null }
}

function parseClientInput(raw: unknown) {
  const input = (raw || {}) as Record<string, unknown>
  const fullName = cleanText(input.fullName, 120)
  const email = cleanEmail(input.email)
  const phone = cleanText(input.phone, 40)
  const instagram = cleanText(input.instagram, 80)
  const clientType = isClientType(String(input.clientType || ''))
    ? (input.clientType as ClientTypeValue)
    : 'private'
  const vipStatus = isClientVip(String(input.vipStatus || ''))
    ? (input.vipStatus as ClientVipValue)
    : 'standard'

  if (!fullName) return { error: 'Enter the client’s name.' as const }
  if (!email) return { error: 'Enter a valid email address.' as const }
  if (!CLIENT_TYPE_VALUES.includes(clientType)) {
    return { error: 'Select a client type.' as const }
  }
  if (!CLIENT_VIP_VALUES.includes(vipStatus)) {
    return { error: 'Select a client tier.' as const }
  }

  return {
    error: null as null,
    data: {
      fullName,
      email,
      phone: phone || undefined,
      instagram: instagram || undefined,
      clientType,
      vipStatus,
    },
  }
}

export async function createClient(rawInput: unknown): Promise<ClientMutationResult> {
  const { user, error } = await requireWriter('/os/clients/new')
  if (error) return { ok: false, message: error }

  const parsed = parseClientInput(rawInput)
  if (parsed.error) return { ok: false, message: parsed.error }

  try {
    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'clients',
      data: parsed.data,
      user,
      overrideAccess: false,
    })
    revalidatePath('/os/clients')
    revalidatePath('/os')
    return { ok: true, id: String(doc.id) }
  } catch (err) {
    const message =
      err instanceof Error && err.message ? err.message : 'Could not create client.'
    return { ok: false, message }
  }
}

export async function updateClient(
  clientId: string,
  rawInput: unknown,
): Promise<ClientMutationResult> {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(clientId)) {
    return { ok: false, message: 'Invalid client.' }
  }

  const { user, error } = await requireWriter(`/os/clients/${clientId}/edit`)
  if (error) return { ok: false, message: error }

  const parsed = parseClientInput(rawInput)
  if (parsed.error) return { ok: false, message: parsed.error }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'clients',
      id: clientId,
      data: parsed.data,
      user,
      overrideAccess: false,
    })
    revalidatePath('/os/clients')
    revalidatePath(`/os/clients/${clientId}`)
    revalidatePath(`/os/clients/${clientId}/edit`)
    revalidatePath('/os')
    return { ok: true, id: clientId }
  } catch (err) {
    const message =
      err instanceof Error && err.message ? err.message : 'Could not update client.'
    return { ok: false, message }
  }
}
