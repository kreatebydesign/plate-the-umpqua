import { NextResponse } from 'next/server'
import { runFeedbackSweep } from '@/lib/os/events/feedbackSweep'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false

  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true

  // Vercel Cron may send the secret via this header on some setups.
  const vercelCron = req.headers.get('x-vercel-cron-authorization')
  if (vercelCron === `Bearer ${secret}`) return true

  return false
}

/**
 * Post-event feedback email sweep.
 * Requires CRON_SECRET bearer auth.
 * Live delivery also requires FEEDBACK_AUTOMATION_ENABLED=true and
 * FEEDBACK_AUTOMATION_START_AT. dryRun=1 never mutates or sends.
 *
 * Required production variables (set only when intentionally launching):
 * - CRON_SECRET
 * - FEEDBACK_AUTOMATION_ENABLED
 * - FEEDBACK_AUTOMATION_START_AT
 */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const dryRun = url.searchParams.get('dryRun') === '1'

  try {
    const result = await runFeedbackSweep({ dryRun })
    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch {
    console.error('[cron/feedback-sweep]')
    return NextResponse.json(
      { ok: false, error: 'sweep_failed' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  return GET(req)
}
