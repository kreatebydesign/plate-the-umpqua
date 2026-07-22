import { NextResponse } from 'next/server'
import {
  getMenuReviewClientKey,
  isMenuReviewRateLimited,
  isPlausibleMenuReviewOrigin,
} from '@/lib/os/menus/reviewRateLimit'
import { submitMenuReview } from '@/lib/os/menus/publicMenuReview'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    if (!isPlausibleMenuReviewOrigin(req)) {
      return NextResponse.json(
        { success: false, message: 'Unable to submit your response.' },
        { status: 403 },
      )
    }

    const clientKey = getMenuReviewClientKey(req)
    if (isMenuReviewRateLimited(clientKey)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many attempts. Please wait and try again.',
        },
        { status: 429 },
      )
    }

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request.' },
        { status: 400 },
      )
    }

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request.' },
        { status: 400 },
      )
    }

    const body = raw as Record<string, unknown>
    const result = await submitMenuReview({
      token: typeof body.token === 'string' ? body.token : '',
      action: typeof body.action === 'string' ? body.action : '',
      comment: typeof body.comment === 'string' ? body.comment : '',
      clientKeyHint: clientKey.slice(0, 24),
    })

    if (!result.ok) {
      const status =
        result.code === 'comment_required'
          ? 400
          : result.code === 'invalid' ||
              result.code === 'expired' ||
              result.code === 'revoked' ||
              result.code === 'unavailable'
            ? 410
            : 400
      return NextResponse.json(
        { success: false, message: result.message },
        { status },
      )
    }

    return NextResponse.json({
      success: true,
      action: result.action,
    })
  } catch (err) {
    console.error('[menu-review] api', err)
    return NextResponse.json(
      { success: false, message: 'Unable to submit your response.' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed.' },
    { status: 405 },
  )
}
