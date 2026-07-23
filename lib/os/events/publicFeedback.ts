import { getPayload } from 'payload'
import config from '../../../payload.config'
import {
  FEEDBACK_COMMENT_MAX,
  FEEDBACK_CONSENT_VERSION,
  FEEDBACK_CONSENT_WORDING,
  FEEDBACK_DISPLAY_NAME_MAX,
  FEEDBACK_STOOD_OUT_MAX,
  GOOGLE_REVIEW_URL,
  isValidFeedbackRating,
  sanitizeFeedbackText,
} from './feedbackConstants'
import {
  hashFeedbackToken,
  normalizeFeedbackTokenParam,
  resolveFeedbackLinkState,
  type FeedbackLinkState,
  feedbackTokenHint,
} from './feedbackToken'

export type PublicFeedbackContext = {
  brandName: string
  googleReviewUrl: string
  consentWording: string
  consentVersion: string
}

export type PublicFeedbackLookup =
  | {
      state: 'valid'
      eventId: string
      context: PublicFeedbackContext
    }
  | {
      state: Exclude<FeedbackLinkState, 'valid'>
      context: PublicFeedbackContext
    }

const PUBLIC_CONTEXT: PublicFeedbackContext = {
  brandName: 'Plate The Umpqua',
  googleReviewUrl: GOOGLE_REVIEW_URL,
  consentWording: FEEDBACK_CONSENT_WORDING,
  consentVersion: FEEDBACK_CONSENT_VERSION,
}

/**
 * Resolve a feedback token to a minimized public context.
 * Never reveals whether a specific event or email exists beyond generic states.
 */
export async function lookupFeedbackByToken(
  rawToken: string | null | undefined,
): Promise<PublicFeedbackLookup> {
  const token = normalizeFeedbackTokenParam(rawToken)
  if (!token) {
    return { state: 'invalid', context: PUBLIC_CONTEXT }
  }

  const tokenHash = hashFeedbackToken(token)

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'events',
      overrideAccess: true,
      limit: 1,
      depth: 0,
      where: {
        feedbackTokenHash: { equals: tokenHash },
      },
      select: {
        eventStatus: true,
        feedbackTokenExpiresAt: true,
        feedbackTokenRevokedAt: true,
        feedbackSubmittedAt: true,
        feedbackSentAt: true,
      },
    })

    const doc = result.docs[0]
    if (!doc) {
      return { state: 'invalid', context: PUBLIC_CONTEXT }
    }

    const state = resolveFeedbackLinkState({
      hashFound: true,
      revokedAt: doc.feedbackTokenRevokedAt,
      expiresAt: doc.feedbackTokenExpiresAt,
      submittedAt: doc.feedbackSubmittedAt,
      eventStatus: doc.eventStatus,
    })

    if (state !== 'valid') {
      return { state, context: PUBLIC_CONTEXT }
    }

    // Require that a feedback request was actually sent before accepting submissions.
    if (!doc.feedbackSentAt) {
      return { state: 'unavailable', context: PUBLIC_CONTEXT }
    }

    return {
      state: 'valid',
      eventId: String(doc.id),
      context: PUBLIC_CONTEXT,
    }
  } catch {
    console.error('[experience-feedback] lookup')
    return { state: 'invalid', context: PUBLIC_CONTEXT }
  }
}

export type SubmitExperienceFeedbackInput = {
  token: string
  rating: unknown
  comments: unknown
  stoodOut?: unknown
  testimonialPermission?: unknown
  publicDisplayName?: unknown
}

export type SubmitExperienceFeedbackResult =
  | {
      ok: true
      googleReviewUrl: string
    }
  | {
      ok: false
      message: string
      code?: string
    }

export async function submitExperienceFeedback(
  input: SubmitExperienceFeedbackInput,
): Promise<SubmitExperienceFeedbackResult> {
  const token = normalizeFeedbackTokenParam(input.token)
  if (!token) {
    return {
      ok: false,
      message: 'This feedback link is not valid.',
      code: 'invalid',
    }
  }

  if (!isValidFeedbackRating(input.rating)) {
    return {
      ok: false,
      message: 'Please choose a rating from 1 to 5.',
      code: 'validation',
    }
  }

  const comments = sanitizeFeedbackText(input.comments, FEEDBACK_COMMENT_MAX)
  if (!comments) {
    return {
      ok: false,
      message: 'Please share a few words about the experience.',
      code: 'validation',
    }
  }

  const stoodOut = sanitizeFeedbackText(
    input.stoodOut,
    FEEDBACK_STOOD_OUT_MAX,
  )
  const permission = input.testimonialPermission === true
  const displayName = sanitizeFeedbackText(
    input.publicDisplayName,
    FEEDBACK_DISPLAY_NAME_MAX,
  )

  const lookup = await lookupFeedbackByToken(token)
  if (lookup.state === 'submitted') {
    return {
      ok: false,
      message: 'Feedback for this experience has already been received.',
      code: 'submitted',
    }
  }
  if (lookup.state !== 'valid') {
    return {
      ok: false,
      message: 'This feedback link is not available.',
      code: lookup.state,
    }
  }

  try {
    const payload = await getPayload({ config })
    const event = await payload.findByID({
      collection: 'events',
      id: lookup.eventId,
      overrideAccess: true,
      depth: 1,
    })

    if (event.feedbackSubmittedAt) {
      return {
        ok: false,
        message: 'Feedback for this experience has already been received.',
        code: 'submitted',
      }
    }

    const clientId =
      event.client && typeof event.client === 'object' && 'id' in event.client
        ? String((event.client as { id: string | number }).id)
        : typeof event.client === 'string'
          ? event.client
          : null

    const clientName =
      event.client &&
      typeof event.client === 'object' &&
      typeof (event.client as { fullName?: string }).fullName === 'string'
        ? (event.client as { fullName: string }).fullName.trim()
        : 'Client'

    const nowIso = new Date().toISOString()
    const tokenHash = hashFeedbackToken(token)

    await payload.create({
      collection: 'testimonials',
      overrideAccess: true,
      data: {
        clientName,
        testimonial: comments,
        stoodOut: stoodOut || undefined,
        rating: input.rating,
        source: 'clientFeedback',
        publicationStatus: permission ? 'awaitingModeration' : 'private',
        testimonialPermission: permission,
        consentWordingVersion: permission ? FEEDBACK_CONSENT_VERSION : undefined,
        consentWordingExact: permission ? FEEDBACK_CONSENT_WORDING : undefined,
        consentGrantedAt: permission ? nowIso : undefined,
        publicDisplayName: permission ? displayName || undefined : undefined,
        event: lookup.eventId,
        client: clientId || undefined,
        submittedAt: nowIso,
        tokenHint: feedbackTokenHint(tokenHash),
        featured: false,
      },
    })

    await payload.update({
      collection: 'events',
      id: lookup.eventId,
      overrideAccess: true,
      data: {
        feedbackSubmittedAt: nowIso,
      },
    })

    return {
      ok: true,
      googleReviewUrl: GOOGLE_REVIEW_URL,
    }
  } catch {
    console.error('[experience-feedback] submit')
    return {
      ok: false,
      message: 'Something went wrong. Please try again in a moment.',
      code: 'error',
    }
  }
}
