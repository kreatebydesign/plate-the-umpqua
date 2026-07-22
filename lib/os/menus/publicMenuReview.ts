import { getPayload } from 'payload'
import config from '../../../payload.config'
import {
  MENU_REVIEW_HISTORY_MAX,
  isMenuReviewAction,
  isOsDocumentId,
} from './menuConstants'
import {
  buildPublicMenuReviewPayload,
  type PublicMenuReviewPayload,
} from './publicReviewPayload'
import {
  hashReviewToken,
  normalizeReviewTokenParam,
  resolveReviewLinkState,
  type ReviewLinkState,
} from './reviewToken'

export type PublicReviewLookup =
  | {
      state: 'valid'
      menuId: string
      payload: PublicMenuReviewPayload
    }
  | {
      state: Exclude<ReviewLinkState, 'valid'>
      payload: null
    }

/**
 * Resolve a public review token to a minimized menu payload.
 * Uses overrideAccess only after hash lookup — never reveals whether
 * unrelated menus exist beyond invalid/expired/revoked/unavailable states.
 */
export async function lookupMenuReviewByToken(
  rawToken: string | null | undefined,
): Promise<PublicReviewLookup> {
  const token = normalizeReviewTokenParam(rawToken)
  if (!token) {
    return { state: 'invalid', payload: null }
  }

  const tokenHash = hashReviewToken(token)

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'menus',
      overrideAccess: true,
      limit: 1,
      depth: 0,
      where: {
        reviewTokenHash: { equals: tokenHash },
      },
      select: {
        occasionTitle: true,
        serviceDate: true,
        guestCount: true,
        introductoryMessage: true,
        pricingPresentation: true,
        displayInvestment: true,
        version: true,
        status: true,
        sections: true,
        reviewTokenHash: true,
        reviewTokenExpiresAt: true,
        reviewTokenRevokedAt: true,
      },
    })

    const doc = result.docs[0]
    if (!doc) {
      return { state: 'invalid', payload: null }
    }

    const state = resolveReviewLinkState({
      hashFound: true,
      revokedAt: doc.reviewTokenRevokedAt,
      expiresAt: doc.reviewTokenExpiresAt,
      menuStatus: doc.status,
    })

    if (state !== 'valid') {
      return { state, payload: null }
    }

    return {
      state: 'valid',
      menuId: String(doc.id),
      payload: buildPublicMenuReviewPayload(doc),
    }
  } catch (err) {
    console.error('[menu-review] lookup', err)
    return { state: 'invalid', payload: null }
  }
}

export type SubmitMenuReviewInput = {
  token: string
  action: string
  comment?: string | null
  clientKeyHint?: string | null
}

export type SubmitMenuReviewResult =
  | { ok: true; action: 'approve' | 'requestRevision' }
  | { ok: false; message: string; code?: string }

export async function submitMenuReview(
  input: SubmitMenuReviewInput,
): Promise<SubmitMenuReviewResult> {
  const token = normalizeReviewTokenParam(input.token)
  if (!token) {
    return { ok: false, message: 'This review link is not valid.', code: 'invalid' }
  }

  if (!isMenuReviewAction(input.action)) {
    return { ok: false, message: 'Choose approve or request revisions.' }
  }

  const comment =
    typeof input.comment === 'string' ? input.comment.trim().slice(0, 2000) : ''

  if (input.action === 'requestRevision' && comment.length < 4) {
    return {
      ok: false,
      message: 'Please share a short note about the revisions you need.',
      code: 'comment_required',
    }
  }

  const tokenHash = hashReviewToken(token)

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'menus',
      overrideAccess: true,
      limit: 1,
      depth: 0,
      where: {
        reviewTokenHash: { equals: tokenHash },
      },
    })

    const doc = result.docs[0]
    if (!doc || !isOsDocumentId(String(doc.id))) {
      return {
        ok: false,
        message: 'This review link is not valid.',
        code: 'invalid',
      }
    }

    const state = resolveReviewLinkState({
      hashFound: true,
      revokedAt: doc.reviewTokenRevokedAt,
      expiresAt: doc.reviewTokenExpiresAt,
      menuStatus: doc.status,
    })

    if (state === 'expired') {
      return {
        ok: false,
        message: 'This review link has expired.',
        code: 'expired',
      }
    }
    if (state === 'revoked') {
      return {
        ok: false,
        message: 'This review link is no longer active.',
        code: 'revoked',
      }
    }
    if (state !== 'valid') {
      return {
        ok: false,
        message: 'This review link is not available.',
        code: 'unavailable',
      }
    }

    if (doc.status === 'approved' && input.action === 'approve') {
      return { ok: true, action: 'approve' }
    }

    const nowIso = new Date().toISOString()
    const reviewRow = {
      action: input.action,
      comment: comment || undefined,
      submittedAt: nowIso,
      menuVersion:
        typeof doc.version === 'number' && doc.version > 0 ? doc.version : 1,
      clientKeyHint: input.clientKeyHint
        ? String(input.clientKeyHint).slice(0, 24)
        : undefined,
    }

    const reviews = [...(doc.reviews || []), reviewRow].slice(
      -MENU_REVIEW_HISTORY_MAX,
    )

    const data: Record<string, unknown> = {
      reviews,
    }

    if (input.action === 'approve') {
      data.status = 'approved'
      data.approvedAt = nowIso
    } else {
      data.status = 'revisionRequested'
      data.approvedAt = null
    }

    await payload.update({
      collection: 'menus',
      id: String(doc.id),
      overrideAccess: true,
      depth: 0,
      data: data as never,
    })

    return { ok: true, action: input.action }
  } catch (err) {
    console.error('[menu-review] submit', err)
    return {
      ok: false,
      message: 'Unable to submit your response right now.',
      code: 'error',
    }
  }
}
