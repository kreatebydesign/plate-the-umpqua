'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import { Resend } from 'resend'
import config from '../../../payload.config'
import { asPlateUser, canWriteCulinary } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { buildPublicMenuReviewPayload } from './publicReviewPayload'
import {
  isMenuStatus,
  isOsDocumentId,
  MENU_MUTATION_ALLOWLIST,
  MENU_REVISION_HISTORY_MAX,
} from './menuConstants'
import {
  generateReviewToken,
  hashReviewToken,
  reviewTokenExpiresAt,
} from './reviewToken'

export type MenuMutationResult =
  | { ok: true; id: string }
  | { ok: false; message: string }

export type MenuReviewLinkResult =
  | {
      ok: true
      id: string
      reviewUrl: string
      expiresAt: string
      emailed: boolean
      emailMessage: string | null
    }
  | { ok: false; message: string }

function cleanText(value: unknown, max: number): string | undefined {
  if (value == null) return undefined
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

function cleanTextOrEmpty(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function cleanNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.min(n, 1_000_000)
}

function cleanRelId(value: unknown): string | null | undefined {
  if (value === null) return null
  if (value == null || value === '') return undefined
  if (!isOsDocumentId(value)) return undefined
  return value
}

function parseSections(value: unknown) {
  if (value == null) return undefined
  if (!Array.isArray(value)) return undefined

  const sections: Array<{
    sectionName: string
    items: Array<{
      recipe?: string | null
      clientTitle: string
      clientDescription?: string
      showDietary?: boolean
      dietaryDisplay?: string
      allergenDisplay?: string
      internalItemNotes?: string
    }>
  }> = []

  for (const section of value.slice(0, 20)) {
    if (!section || typeof section !== 'object' || Array.isArray(section)) {
      continue
    }
    const s = section as Record<string, unknown>
    const sectionName = cleanText(s.sectionName, 120)
    if (!sectionName) continue

    const items: Array<{
      recipe?: string | null
      clientTitle: string
      clientDescription?: string
      showDietary?: boolean
      dietaryDisplay?: string
      allergenDisplay?: string
      internalItemNotes?: string
    }> = []

    const rawItems = Array.isArray(s.items) ? s.items : []
    for (const item of rawItems.slice(0, 40)) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue
      const row = item as Record<string, unknown>
      const clientTitle = cleanText(row.clientTitle, 160)
      if (!clientTitle) continue

      let recipe: string | null | undefined
      if ('recipe' in row) {
        const id = cleanRelId(row.recipe)
        if (id === undefined) continue
        recipe = id
      }

      items.push({
        recipe: recipe === undefined ? undefined : recipe,
        clientTitle,
        clientDescription: cleanText(row.clientDescription, 800),
        showDietary: Boolean(row.showDietary),
        dietaryDisplay: cleanText(row.dietaryDisplay, 200),
        allergenDisplay: cleanText(row.allergenDisplay, 200),
        internalItemNotes: cleanText(row.internalItemNotes, 800),
      })
    }

    sections.push({ sectionName, items })
  }

  return sections
}

function parseMenuData(
  rawInput: unknown,
): { ok: true; data: Record<string, unknown> } | { ok: false; message: string } {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return { ok: false, message: 'Invalid update.' }
  }

  const input = rawInput as Record<string, unknown>
  for (const key of Object.keys(input)) {
    if (!(MENU_MUTATION_ALLOWLIST as readonly string[]).includes(key)) {
      return { ok: false, message: 'Unsupported field.' }
    }
  }

  const data: Record<string, unknown> = {}

  if ('internalName' in input) {
    const name = cleanText(input.internalName, 160)
    if (!name) return { ok: false, message: 'Internal menu name is required.' }
    data.internalName = name
  }

  if ('client' in input) {
    const id = cleanRelId(input.client)
    if (!id) return { ok: false, message: 'A client relationship is required.' }
    data.client = id
  }

  if ('inquiry' in input) {
    const id = cleanRelId(input.inquiry)
    if (id === undefined) return { ok: false, message: 'Invalid inquiry.' }
    data.inquiry = id
  }

  if ('event' in input) {
    const id = cleanRelId(input.event)
    if (id === undefined) return { ok: false, message: 'Invalid event.' }
    data.event = id
  }

  if ('occasionTitle' in input) {
    const title = cleanText(input.occasionTitle, 160)
    if (!title) return { ok: false, message: 'Occasion title is required.' }
    data.occasionTitle = title
  }

  if ('serviceDate' in input) {
    if (input.serviceDate == null || input.serviceDate === '') {
      data.serviceDate = null
    } else if (typeof input.serviceDate === 'string') {
      const ms = Date.parse(input.serviceDate)
      if (!Number.isFinite(ms)) {
        return { ok: false, message: 'Invalid service date.' }
      }
      data.serviceDate = new Date(ms).toISOString()
    } else {
      return { ok: false, message: 'Invalid service date.' }
    }
  }

  if ('guestCount' in input) {
    data.guestCount = cleanNumber(input.guestCount) ?? null
  }

  if ('introductoryMessage' in input) {
    data.introductoryMessage = cleanTextOrEmpty(input.introductoryMessage, 2000)
  }

  if ('sections' in input) {
    const sections = parseSections(input.sections)
    if (!sections) return { ok: false, message: 'Invalid sections.' }
    data.sections = sections
  }

  if ('pricingPresentation' in input) {
    data.pricingPresentation = cleanTextOrEmpty(input.pricingPresentation, 1000)
  }

  if ('displayInvestment' in input) {
    data.displayInvestment = cleanNumber(input.displayInvestment) ?? null
  }

  if ('internalNotes' in input) {
    data.internalNotes = cleanTextOrEmpty(input.internalNotes, 4000)
  }

  if ('status' in input) {
    if (typeof input.status !== 'string' || !isMenuStatus(input.status)) {
      return { ok: false, message: 'Invalid status.' }
    }
    data.status = input.status
  }

  return { ok: true, data }
}

function clientFacingSnapshot(doc: {
  occasionTitle?: string | null
  serviceDate?: string | null
  guestCount?: number | null
  introductoryMessage?: string | null
  pricingPresentation?: string | null
  displayInvestment?: number | null
  sections?: unknown
}): string {
  return JSON.stringify(
    buildPublicMenuReviewPayload({
      occasionTitle: doc.occasionTitle,
      serviceDate: doc.serviceDate,
      guestCount: doc.guestCount,
      introductoryMessage: doc.introductoryMessage,
      pricingPresentation: doc.pricingPresentation,
      displayInvestment: doc.displayInvestment,
      sections: doc.sections as never,
      version: 1,
      status: 'draft',
    }),
  )
}

function revalidateMenus(id?: string) {
  revalidatePath('/os/menus')
  if (id) {
    revalidatePath(`/os/menus/${id}`)
    revalidatePath(`/os/menus/${id}/preview`)
    revalidatePath(`/os/menus/${id}/edit`)
    revalidatePath(`/os/menus/${id}/print`)
  }
}

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  return 'https://platetheumpqua.com'
}

export async function createMenu(
  rawInput: unknown,
): Promise<MenuMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to create menus.' }
  }

  const parsed = parseMenuData(rawInput)
  if (!parsed.ok) return parsed

  if (!parsed.data.internalName || !parsed.data.client || !parsed.data.occasionTitle) {
    return {
      ok: false,
      message: 'Internal name, client, and occasion title are required.',
    }
  }

  const data = {
    status: 'draft',
    version: 1,
    sections: [] as Array<{ sectionName: string; items: unknown[] }>,
    ...parsed.data,
  }

  if (!('sections' in parsed.data)) {
    data.sections = [
      { sectionName: 'Welcome', items: [] },
      { sectionName: 'Main Course', items: [] },
      { sectionName: 'Dessert', items: [] },
    ]
  }

  try {
    const payload = await getPayload({ config })
    const created = await payload.create({
      collection: 'menus',
      data: data as never,
      user,
      overrideAccess: false,
      depth: 0,
    })
    revalidateMenus(String(created.id))
    return { ok: true, id: String(created.id) }
  } catch (err) {
    console.error('[os/menus] create', err)
    return { ok: false, message: 'Unable to create menu.' }
  }
}

export async function updateMenu(
  rawId: unknown,
  rawInput: unknown,
): Promise<MenuMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to update menus.' }
  }
  if (!isOsDocumentId(rawId)) {
    return { ok: false, message: 'Invalid menu.' }
  }

  const parsed = parseMenuData(rawInput)
  if (!parsed.ok) return parsed
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, message: 'No changes provided.' }
  }

  try {
    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'menus',
      id: rawId,
      data: parsed.data as never,
      user,
      overrideAccess: false,
      depth: 0,
    })
    revalidateMenus(String(updated.id))
    return { ok: true, id: String(updated.id) }
  } catch (err) {
    console.error('[os/menus] update', err)
    return { ok: false, message: 'Unable to save menu.' }
  }
}

export async function duplicateMenuVersion(
  rawId: unknown,
): Promise<MenuMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to duplicate menus.' }
  }
  if (!isOsDocumentId(rawId)) {
    return { ok: false, message: 'Invalid menu.' }
  }

  try {
    const payload = await getPayload({ config })
    const source = await payload.findByID({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })

    const currentVersion =
      typeof source.version === 'number' && source.version > 0
        ? source.version
        : 1
    const snapshot = {
      version: currentVersion,
      snapshotAt: new Date().toISOString(),
      reason: 'version-duplicate',
      snapshotJson: clientFacingSnapshot(source),
    }
    const history = [...(source.revisionHistory || []), snapshot].slice(
      -MENU_REVISION_HISTORY_MAX,
    )

    const clientId =
      typeof source.client === 'object' && source.client
        ? source.client.id
        : source.client
    const inquiryId =
      typeof source.inquiry === 'object' && source.inquiry
        ? source.inquiry.id
        : source.inquiry
    const eventId =
      typeof source.event === 'object' && source.event
        ? source.event.id
        : source.event

    const created = await payload.create({
      collection: 'menus',
      user,
      overrideAccess: false,
      depth: 0,
      data: {
        internalName: `${source.internalName || 'Menu'} (v${currentVersion + 1})`,
        client: clientId,
        inquiry: inquiryId || undefined,
        event: eventId || undefined,
        occasionTitle: source.occasionTitle,
        serviceDate: source.serviceDate || undefined,
        guestCount: source.guestCount ?? undefined,
        introductoryMessage: source.introductoryMessage || undefined,
        sections: (source.sections || []).map((section) => ({
          sectionName: section.sectionName,
          items: (section.items || []).map((item) => ({
            recipe:
              typeof item.recipe === 'object' && item.recipe
                ? item.recipe.id
                : item.recipe || undefined,
            clientTitle: item.clientTitle,
            clientDescription: item.clientDescription || undefined,
            showDietary: Boolean(item.showDietary),
            dietaryDisplay: item.dietaryDisplay || undefined,
            allergenDisplay: item.allergenDisplay || undefined,
            internalItemNotes: item.internalItemNotes || undefined,
          })),
        })),
        pricingPresentation: source.pricingPresentation || undefined,
        displayInvestment: source.displayInvestment ?? undefined,
        internalNotes: source.internalNotes || undefined,
        status: 'draft',
        version: currentVersion + 1,
        revisionHistory: history,
      },
    })

    revalidateMenus(String(created.id))
    return { ok: true, id: String(created.id) }
  } catch (err) {
    console.error('[os/menus] duplicate', err)
    return { ok: false, message: 'Unable to duplicate menu version.' }
  }
}

export async function createMenuReviewLink(
  rawId: unknown,
  options?: { sendEmail?: boolean },
): Promise<MenuReviewLinkResult> {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return {
      ok: false,
      message: 'You do not have permission to send menus for review.',
    }
  }
  if (!isOsDocumentId(rawId)) {
    return { ok: false, message: 'Invalid menu.' }
  }

  const sendEmail = Boolean(options?.sendEmail)

  try {
    const payload = await getPayload({ config })
    const menu = await payload.findByID({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 1,
    })

    const token = generateReviewToken()
    const expiresAt = reviewTokenExpiresAt()
    const nowIso = new Date().toISOString()

    await payload.update({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
      data: {
        reviewTokenHash: hashReviewToken(token),
        reviewTokenExpiresAt: expiresAt.toISOString(),
        reviewTokenRevokedAt: null,
        reviewTokenCreatedAt: nowIso,
        status: 'sent',
        sentAt: nowIso,
      },
    })

    const reviewUrl = `${siteOrigin()}/menu-review/${token}`
    let emailed = false
    let emailMessage: string | null = null

    if (sendEmail) {
      const apiKey = process.env.RESEND_API_KEY
      const clientEmail =
        menu.client &&
        typeof menu.client === 'object' &&
        typeof (menu.client as { email?: string }).email === 'string'
          ? (menu.client as { email: string }).email.trim()
          : ''
      const clientName =
        menu.client &&
        typeof menu.client === 'object' &&
        typeof (menu.client as { fullName?: string }).fullName === 'string'
          ? (menu.client as { fullName: string }).fullName.trim()
          : 'Guest'

      if (!apiKey) {
        emailMessage =
          'Review link created. Email was not sent — RESEND_API_KEY is not configured.'
      } else if (!clientEmail) {
        emailMessage =
          'Review link created. Email was not sent — this client has no email on file.'
      } else {
        const resend = new Resend(apiKey)
        const occasion =
          menu.occasionTitle?.trim() || 'your private dining menu'
        const html = `
          <div style="background:#14120e;padding:40px;font-family:Georgia,serif;">
            <div style="max-width:640px;margin:auto;border:1px solid #c4a46533;padding:30px;background:#0f0e0c;">
              <p style="color:#c4a465;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;">
                Plate The Umpqua
              </p>
              <h1 style="color:#efe6d4;font-weight:400;margin:12px 0 8px;">
                Your private dining menu is ready for review
              </h1>
              <p style="color:#b9ac97;line-height:1.7;">
                Dear ${clientName},
              </p>
              <p style="color:#b9ac97;line-height:1.7;">
                We prepared a menu presentation for ${occasion}. Please review it at your convenience and approve or request revisions.
              </p>
              <p style="margin:28px 0;">
                <a href="${reviewUrl}" style="display:inline-block;padding:14px 22px;background:#c4a465;color:#100f0c;text-decoration:none;letter-spacing:0.04em;">
                  Review menu
                </a>
              </p>
              <p style="color:#6f675d;font-size:13px;line-height:1.6;">
                This private link expires on ${expiresAt.toLocaleString('en-US', {
                  timeZone: 'America/Los_Angeles',
                })}. If you did not expect this message, you may ignore it.
              </p>
            </div>
          </div>
        `

        const result = await resend.emails.send({
          from: 'Plate The Umpqua <info@platetheumpqua.com>',
          to: [clientEmail],
          subject: `Menu ready for review · ${occasion}`,
          html,
        })

        if (result.error) {
          console.error('[os/menus] review email', result.error)
          emailMessage =
            'Review link created, but email delivery failed. You can copy the link instead.'
        } else {
          emailed = true
          emailMessage = `Review email sent to ${clientEmail}.`
        }
      }
    } else {
      emailMessage = 'Secure review link ready to copy. No email was sent.'
    }

    revalidateMenus(rawId)
    return {
      ok: true,
      id: rawId,
      reviewUrl,
      expiresAt: expiresAt.toISOString(),
      emailed,
      emailMessage,
    }
  } catch (err) {
    console.error('[os/menus] review link', err)
    return { ok: false, message: 'Unable to create review link.' }
  }
}

export async function revokeMenuReviewLink(
  rawId: unknown,
): Promise<MenuMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return {
      ok: false,
      message: 'You do not have permission to revoke review links.',
    }
  }
  if (!isOsDocumentId(rawId)) {
    return { ok: false, message: 'Invalid menu.' }
  }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
      data: {
        reviewTokenRevokedAt: new Date().toISOString(),
      },
    })
    revalidateMenus(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/menus] revoke', err)
    return { ok: false, message: 'Unable to revoke review link.' }
  }
}

export async function snapshotMenuRevision(
  rawId: unknown,
  reason?: string,
): Promise<MenuMutationResult> {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  if (!canWriteCulinary(asPlateUser(user))) {
    return { ok: false, message: 'You do not have permission to revise menus.' }
  }
  if (!isOsDocumentId(rawId)) {
    return { ok: false, message: 'Invalid menu.' }
  }

  try {
    const payload = await getPayload({ config })
    const source = await payload.findByID({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })

    const currentVersion =
      typeof source.version === 'number' && source.version > 0
        ? source.version
        : 1
    const snapshot = {
      version: currentVersion,
      snapshotAt: new Date().toISOString(),
      reason: cleanText(reason, 120) || 'manual-snapshot',
      snapshotJson: clientFacingSnapshot(source),
    }
    const history = [...(source.revisionHistory || []), snapshot].slice(
      -MENU_REVISION_HISTORY_MAX,
    )

    await payload.update({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
      data: {
        version: currentVersion + 1,
        revisionHistory: history,
        status:
          source.status === 'revisionRequested' || source.status === 'approved'
            ? 'draft'
            : source.status,
        approvedAt: null,
      },
    })

    revalidateMenus(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/menus] snapshot', err)
    return { ok: false, message: 'Unable to record menu revision.' }
  }
}
