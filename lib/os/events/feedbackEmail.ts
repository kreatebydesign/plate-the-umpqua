import {
  FEEDBACK_CONSENT_WORDING,
  firstNameForFeedbackGreeting,
  GOOGLE_REVIEW_URL,
} from './feedbackConstants'

export type FeedbackEmailContent = {
  subject: string
  html: string
  text: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Personal post-event email from Martin.
 * Absolute production URLs only. No client IDs or raw tokens in copy.
 */
export function buildFeedbackRequestEmail(options: {
  clientFullName?: string | null
  occasionLabel?: string | null
  feedbackUrl: string
  googleReviewUrl?: string
}): FeedbackEmailContent {
  const first = firstNameForFeedbackGreeting(options.clientFullName)
  const greeting = first ? `Hi ${first},` : 'Hello,'
  const occasion =
    options.occasionLabel?.trim() || 'your gathering'
  const googleUrl = options.googleReviewUrl || GOOGLE_REVIEW_URL
  const feedbackUrl = options.feedbackUrl
  const subject = 'Thank you for having Plate The Umpqua at your table'

  const text = [
    greeting,
    '',
    `Thank you again for inviting Plate The Umpqua to be part of ${occasion}. It was a pleasure serving you and your guests.`,
    '',
    'When you have a moment, I’d appreciate hearing how the experience felt from your side. Your feedback helps me keep every detail at the level it should be.',
    '',
    `Share your experience: ${feedbackUrl}`,
    '',
    'If you’d also like to leave a public review, you can share one on Google here:',
    googleUrl,
    '',
    'Thank you,',
    'Martin',
    'Plate The Umpqua',
  ].join('\n')

  const safeGreeting = escapeHtml(greeting)
  const safeOccasion = escapeHtml(occasion)
  const safeFeedback = escapeHtml(feedbackUrl)
  const safeGoogle = escapeHtml(googleUrl)

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f1e8;color:#14120e;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    A short note from Martin after your evening with Plate The Umpqua.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf8f2;border:1px solid #e4dccb;border-radius:4px;">
          <tr>
            <td style="padding:32px 28px 8px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8a7040;">
                Plate The Umpqua
              </p>
              <hr style="border:none;border-top:1px solid rgba(138,112,64,0.35);width:72px;margin:14px 0 0;text-align:left;">
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 8px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:#14120e;">
              <p style="margin:0 0 16px;">${safeGreeting}</p>
              <p style="margin:0 0 16px;">
                Thank you again for inviting Plate The Umpqua to be part of ${safeOccasion}. It was a pleasure serving you and your guests.
              </p>
              <p style="margin:0 0 22px;">
                When you have a moment, I’d appreciate hearing how the experience felt from your side. Your feedback helps me keep every detail at the level it should be.
              </p>
              <p style="margin:0 0 18px;">
                <a href="${safeFeedback}" style="display:inline-block;padding:12px 18px;background:#8a7040;color:#fbf8f2;text-decoration:none;border-radius:4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;">
                  Share your experience
                </a>
              </p>
              <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#3f3a33;">
                If you’d also like to leave a public review, you can share one on Google here:
              </p>
              <p style="margin:0 0 22px;">
                <a href="${safeGoogle}" style="display:inline-block;padding:11px 16px;border:1px solid #8a7040;color:#8a7040;text-decoration:none;border-radius:4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;">
                  Leave a Google review
                </a>
              </p>
              <p style="margin:0;font-size:16px;line-height:1.7;">
                Thank you,<br>
                Martin<br>
                <span style="color:#8a7040;">Plate The Umpqua</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#6a6358;">
              Private hospitality · Roseburg &amp; the Umpqua Valley
              <!-- Consent reference retained server-side: ${FEEDBACK_CONSENT_WORDING} -->
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html, text }
}
