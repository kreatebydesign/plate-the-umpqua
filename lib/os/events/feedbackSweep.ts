import { getPayload } from 'payload'
import { Resend } from 'resend'
import config from '../../../payload.config'
import {
  FEEDBACK_BATCH_SIZE,
  FEEDBACK_ELIGIBLE_STATUSES,
  FEEDBACK_SEND_CLAIM_STALE_MS,
  evaluateFeedbackEligibility,
  GOOGLE_REVIEW_URL,
  resolveFeedbackAutomationGate,
  type FeedbackAutomationGate,
} from './feedbackConstants'
import { buildFeedbackRequestEmail } from './feedbackEmail'
import {
  feedbackTokenExpiresAt,
  feedbackTokenHint,
  generateFeedbackToken,
  hashFeedbackToken,
} from './feedbackToken'

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  return 'https://platetheumpqua.com'
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return ''
}

function clientEmailFrom(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const email = (value as { email?: string | null }).email?.trim()
  return email || null
}

function clientNameFrom(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const name = (value as { fullName?: string | null }).fullName?.trim()
  return name || null
}

export type FeedbackSweepExclusion = {
  reason: string
  count: number
}

export type FeedbackSweepResult = {
  scanned: number
  attempted: number
  sent: number
  skipped: number
  failed: number
  wouldBeEligible: number
  dryRun: boolean
  automationEnabled: boolean
  automationStatus: FeedbackAutomationGate['status']
  automationReason: FeedbackAutomationGate['reason']
  launchCutoff: string | null
  deliveryAllowed: boolean
  exclusions: FeedbackSweepExclusion[]
  mutated: boolean
  emailsAttempted: number
}

function emptyResult(
  dryRun: boolean,
  gate: FeedbackAutomationGate,
  extras?: Partial<FeedbackSweepResult>,
): FeedbackSweepResult {
  return {
    scanned: 0,
    attempted: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    wouldBeEligible: 0,
    dryRun,
    automationEnabled: gate.enabled,
    automationStatus: gate.status,
    automationReason: gate.reason,
    launchCutoff: gate.startAtLabel,
    deliveryAllowed: false,
    exclusions: [],
    mutated: false,
    emailsAttempted: 0,
    ...extras,
  }
}

function bumpExclusion(
  map: Map<string, number>,
  reason: string,
): void {
  map.set(reason, (map.get(reason) || 0) + 1)
}

/**
 * Bounded post-event feedback sweep with hard launch-safety gates.
 *
 * Live delivery requires FEEDBACK_AUTOMATION_ENABLED=true and a valid
 * FEEDBACK_AUTOMATION_START_AT. Otherwise: zero emails, zero mutations.
 * dryRun never mutates and reports would-be eligibility safely.
 */
export async function runFeedbackSweep(options?: {
  now?: number
  dryRun?: boolean
  limit?: number
  env?: Record<string, string | undefined>
}): Promise<FeedbackSweepResult> {
  const now = options?.now ?? Date.now()
  const dryRun = Boolean(options?.dryRun)
  const env = options?.env ?? process.env
  const gate = resolveFeedbackAutomationGate(env)
  const limit = Math.min(
    Math.max(options?.limit ?? FEEDBACK_BATCH_SIZE, 1),
    FEEDBACK_BATCH_SIZE,
  )

  // Live mode: fail closed / disabled — do not claim, token, update, or email.
  if (!dryRun && !gate.enabled) {
    return emptyResult(false, gate, {
      deliveryAllowed: false,
    })
  }

  // Dry-run with config error: report config, scan nothing mutating.
  if (dryRun && gate.status === 'config_error') {
    return emptyResult(true, gate, {
      deliveryAllowed: false,
      exclusions: [{ reason: 'missing_or_invalid_start_at', count: 1 }],
    })
  }

  // Dry-run while disabled still needs a cutoff to score launch eligibility.
  // Without one, report disabled status and do not invent a cutoff.
  if (dryRun && gate.status === 'disabled') {
    return emptyResult(true, gate, {
      deliveryAllowed: false,
      exclusions: [{ reason: 'automation_disabled', count: 1 }],
    })
  }

  if (!gate.enabled || !gate.startAt) {
    return emptyResult(dryRun, gate)
  }

  const deliveryAllowed = !dryRun && gate.enabled
  const result = emptyResult(dryRun, gate, {
    deliveryAllowed,
  })

  const payload = await getPayload({ config })
  const claimCutoff = new Date(now - FEEDBACK_SEND_CLAIM_STALE_MS).toISOString()
  const lookback = new Date(now - 45 * 24 * 60 * 60 * 1000)
  const queryStart =
    gate.startAt.getTime() > lookback.getTime() ? gate.startAt : lookback

  const found = await payload.find({
    collection: 'events',
    overrideAccess: true,
    depth: 1,
    limit,
    sort: 'eventDate',
    where: {
      and: [
        { eventStatus: { in: [...FEEDBACK_ELIGIBLE_STATUSES] } },
        { feedbackSentAt: { exists: false } },
        { feedbackOptOut: { not_equals: true } },
        { eventDate: { greater_than_equal: queryStart.toISOString() } },
        {
          or: [
            { feedbackSendClaimedAt: { exists: false } },
            { feedbackSendClaimedAt: { less_than: claimCutoff } },
          ],
        },
      ],
    },
  })

  result.scanned = found.docs.length
  const exclusionMap = new Map<string, number>()

  for (const doc of found.docs) {
    const email = clientEmailFrom(doc.client)
    const eligibility = evaluateFeedbackEligibility({
      eventStatus: doc.eventStatus,
      eventDate: doc.eventDate,
      clientEmail: email,
      feedbackOptOut: Boolean(doc.feedbackOptOut),
      feedbackSentAt: doc.feedbackSentAt,
      launchStartAt: gate.startAt,
      now,
    })

    if (!eligibility.ok) {
      result.skipped += 1
      bumpExclusion(exclusionMap, eligibility.reason)
      continue
    }

    result.wouldBeEligible += 1
    result.attempted += 1

    if (dryRun || !deliveryAllowed) {
      result.skipped += 1
      bumpExclusion(exclusionMap, dryRun ? 'dry_run' : 'automation_disabled')
      continue
    }

    const eventId = asId(doc.id)
    if (!eventId || !email) {
      result.failed += 1
      bumpExclusion(exclusionMap, 'missing_email')
      continue
    }

    const token = generateFeedbackToken()
    const tokenHash = hashFeedbackToken(token)
    const expiresAt = feedbackTokenExpiresAt(now)
    const claimedAt = new Date(now).toISOString()

    try {
      await payload.update({
        collection: 'events',
        id: eventId,
        overrideAccess: true,
        data: {
          feedbackSendClaimedAt: claimedAt,
          feedbackTokenHash: tokenHash,
          feedbackTokenExpiresAt: expiresAt.toISOString(),
          feedbackTokenCreatedAt: claimedAt,
          feedbackTokenRevokedAt: null,
          feedbackLastError: null,
        },
      })
      result.mutated = true
    } catch {
      console.error('[feedback-sweep] claim failed', eventId)
      result.failed += 1
      bumpExclusion(exclusionMap, 'claim_failed')
      continue
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      await safePatch(payload, eventId, {
        feedbackSendClaimedAt: null,
        feedbackLastError: 'resend_not_configured',
      })
      result.failed += 1
      bumpExclusion(exclusionMap, 'resend_not_configured')
      continue
    }

    const feedbackUrl = `${siteOrigin()}/experience/${token}`
    const rawName =
      typeof doc.eventName === 'string' ? doc.eventName.trim() : ''
    const occasionLabel =
      rawName.length >= 3 &&
      rawName.length <= 80 &&
      !/\b(test|draft|internal)\b/i.test(rawName)
        ? rawName
        : 'your gathering'

    const content = buildFeedbackRequestEmail({
      clientFullName: clientNameFrom(doc.client),
      occasionLabel,
      feedbackUrl,
      googleReviewUrl: GOOGLE_REVIEW_URL,
    })

    try {
      result.emailsAttempted += 1
      const resend = new Resend(apiKey)
      const sendResult = await resend.emails.send({
        from: 'Plate The Umpqua <info@platetheumpqua.com>',
        to: [email],
        subject: content.subject,
        html: content.html,
        text: content.text,
      })

      if (sendResult.error) {
        console.error('[feedback-sweep] provider error', eventId)
        await safePatch(payload, eventId, {
          feedbackSendClaimedAt: null,
          feedbackLastError: 'provider_rejected',
        })
        result.failed += 1
        bumpExclusion(exclusionMap, 'provider_rejected')
        continue
      }

      const messageId =
        sendResult.data && typeof sendResult.data.id === 'string'
          ? sendResult.data.id
          : null

      await payload.update({
        collection: 'events',
        id: eventId,
        overrideAccess: true,
        data: {
          feedbackSentAt: new Date().toISOString(),
          feedbackProviderMessageId: messageId,
          feedbackSendClaimedAt: null,
          feedbackLastError: null,
        },
      })

      result.sent += 1
      void feedbackTokenHint(tokenHash)
    } catch {
      console.error('[feedback-sweep] send failed', eventId)
      await safePatch(payload, eventId, {
        feedbackSendClaimedAt: null,
        feedbackLastError: 'send_exception',
      })
      result.failed += 1
      bumpExclusion(exclusionMap, 'send_exception')
    }
  }

  result.exclusions = [...exclusionMap.entries()].map(([reason, count]) => ({
    reason,
    count,
  }))

  return result
}

async function safePatch(
  payload: Awaited<ReturnType<typeof getPayload>>,
  eventId: string,
  data: Record<string, unknown>,
) {
  try {
    await payload.update({
      collection: 'events',
      id: eventId,
      overrideAccess: true,
      data,
    })
  } catch {
    console.error('[feedback-sweep] patch failed', eventId)
  }
}
