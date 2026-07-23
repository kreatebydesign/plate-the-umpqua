import { NextResponse } from 'next/server'
import {
  getFeedbackClientKey,
  isFeedbackRateLimited,
  isPlausibleFeedbackOrigin,
} from '@/lib/os/events/feedbackRateLimit'
import { submitExperienceFeedback } from '@/lib/os/events/publicFeedback'
import { GOOGLE_REVIEW_URL } from '@/lib/os/events/feedbackConstants'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Body = {
  token?: unknown
  rating?: unknown
  comments?: unknown
  stoodOut?: unknown
  testimonialPermission?: unknown
  publicDisplayName?: unknown
}

export async function POST(req: Request) {
  if (!isPlausibleFeedbackOrigin(req)) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  const clientKey = getFeedbackClientKey(req)
  if (isFeedbackRateLimited(clientKey)) {
    return NextResponse.json(
      { ok: false, message: 'Please wait a moment and try again.' },
      { status: 429 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid request.' },
      { status: 400 },
    )
  }

  const result = await submitExperienceFeedback({
    token: typeof body.token === 'string' ? body.token : '',
    rating:
      typeof body.rating === 'number'
        ? body.rating
        : typeof body.rating === 'string'
          ? Number(body.rating)
          : body.rating,
    comments: body.comments,
    stoodOut: body.stoodOut,
    testimonialPermission: body.testimonialPermission === true,
    publicDisplayName: body.publicDisplayName,
  })

  if (!result.ok) {
    const status =
      result.code === 'validation'
        ? 400
        : result.code === 'submitted'
          ? 409
          : 400
    return NextResponse.json(result, { status })
  }

  return NextResponse.json({
    ok: true,
    googleReviewUrl: GOOGLE_REVIEW_URL,
  })
}

export async function GET() {
  return NextResponse.json({ ok: false, message: 'Method not allowed' }, {
    status: 405,
  })
}
