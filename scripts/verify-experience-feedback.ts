/**
 * Experience feedback + menu-print polish verification.
 * Does not send email or mutate production business records.
 * Run: npx --yes tsx scripts/verify-experience-feedback.ts
 */
import assert from 'node:assert/strict'
import {
  buildFeedbackRequestEmail,
} from '../lib/os/events/feedbackEmail'
import {
  evaluateFeedbackEligibility,
  eventEndAtLosAngeles,
  eventMeetsLaunchCutoff,
  feedbackEligibleAt,
  FEEDBACK_AUTOMATION_ENABLED_ENV,
  FEEDBACK_AUTOMATION_START_AT_ENV,
  FEEDBACK_CONSENT_WORDING,
  FEEDBACK_ELIGIBLE_STATUSES,
  firstNameForFeedbackGreeting,
  GOOGLE_REVIEW_URL,
  isFeedbackAutomationEnabledFlag,
  isValidFeedbackRating,
  parseFeedbackAutomationStartAt,
  resolveFeedbackAutomationGate,
} from '../lib/os/events/feedbackConstants'
import { runFeedbackSweep } from '../lib/os/events/feedbackSweep'
import {
  generateFeedbackToken,
  hashFeedbackToken,
  normalizeFeedbackTokenParam,
  resolveFeedbackLinkState,
  feedbackTokensMatch,
} from '../lib/os/events/feedbackToken'
import {
  buildMenuPrintPayload,
  MENU_PRINT_WORDMARK,
} from '../lib/os/menus/menuPrintPresentation'

async function main() {
  // --- Timezone / eligibility ---
  const dateOnly = '2026-06-01T07:00:00.000Z'
  const end = eventEndAtLosAngeles(dateOnly)
  assert.ok(end)
  const eligibleAt = feedbackEligibleAt(end!)
  assert.equal(eligibleAt.getTime() - end!.getTime(), 24 * 60 * 60 * 1000)

  const justEarly = evaluateFeedbackEligibility({
    eventStatus: 'completed',
    eventDate: dateOnly,
    clientEmail: 'guest@example.com',
    feedbackOptOut: false,
    feedbackSentAt: null,
    now: eligibleAt.getTime() - 60_000,
  })
  assert.equal(justEarly.ok, false)
  if (!justEarly.ok) assert.equal(justEarly.reason, 'too_early')

  const justReady = evaluateFeedbackEligibility({
    eventStatus: 'completed',
    eventDate: dateOnly,
    clientEmail: 'guest@example.com',
    now: eligibleAt.getTime() + 1,
  })
  assert.equal(justReady.ok, true)

  assert.equal(
    evaluateFeedbackEligibility({
      eventStatus: 'planning',
      eventDate: dateOnly,
      clientEmail: 'guest@example.com',
      now: eligibleAt.getTime() + 1,
    }).ok,
    false,
  )

  assert.equal(
    evaluateFeedbackEligibility({
      eventStatus: 'completed',
      eventDate: dateOnly,
      clientEmail: 'guest@example.com',
      feedbackOptOut: true,
      now: eligibleAt.getTime() + 1,
    }).ok,
    false,
  )

  assert.equal(
    evaluateFeedbackEligibility({
      eventStatus: 'completed',
      eventDate: dateOnly,
      clientEmail: null,
      now: eligibleAt.getTime() + 1,
    }).ok,
    false,
  )

  assert.equal(
    evaluateFeedbackEligibility({
      eventStatus: 'completed',
      eventDate: dateOnly,
      clientEmail: 'guest@example.com',
      feedbackSentAt: new Date().toISOString(),
      now: eligibleAt.getTime() + 1,
    }).ok,
    false,
  )

  assert.ok(FEEDBACK_ELIGIBLE_STATUSES.includes('confirmed'))
  assert.equal(FEEDBACK_ELIGIBLE_STATUSES.includes('planning' as never), false)

  // --- Launch-safety gates ---
  assert.equal(isFeedbackAutomationEnabledFlag(undefined), false)
  assert.equal(isFeedbackAutomationEnabledFlag(''), false)
  assert.equal(isFeedbackAutomationEnabledFlag('false'), false)
  assert.equal(isFeedbackAutomationEnabledFlag('1'), false)
  assert.equal(isFeedbackAutomationEnabledFlag('TRUE'), false)
  assert.equal(isFeedbackAutomationEnabledFlag('true'), true)

  assert.equal(parseFeedbackAutomationStartAt(undefined), null)
  assert.equal(parseFeedbackAutomationStartAt(''), null)
  assert.equal(parseFeedbackAutomationStartAt('not-a-date'), null)
  assert.ok(parseFeedbackAutomationStartAt('2026-08-01'))

  const gateAbsent = resolveFeedbackAutomationGate({})
  assert.equal(gateAbsent.status, 'disabled')
  assert.equal(gateAbsent.enabled, false)

  const gateFalse = resolveFeedbackAutomationGate({
    [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'false',
  })
  assert.equal(gateFalse.status, 'disabled')

  const gateMissingCutoff = resolveFeedbackAutomationGate({
    [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'true',
  })
  assert.equal(gateMissingCutoff.status, 'config_error')
  assert.equal(gateMissingCutoff.enabled, false)
  assert.equal(gateMissingCutoff.reason, 'missing_or_invalid_start_at')

  const gateInvalidCutoff = resolveFeedbackAutomationGate({
    [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'true',
    [FEEDBACK_AUTOMATION_START_AT_ENV]: 'not-valid',
  })
  assert.equal(gateInvalidCutoff.status, 'config_error')
  assert.equal(gateInvalidCutoff.enabled, false)

  const gateOk = resolveFeedbackAutomationGate({
    [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'true',
    [FEEDBACK_AUTOMATION_START_AT_ENV]: '2026-08-01',
  })
  assert.equal(gateOk.status, 'enabled')
  assert.equal(gateOk.enabled, true)
  assert.equal(gateOk.startAtLabel, '2026-08-01')

  const cutoff = parseFeedbackAutomationStartAt('2026-08-01')
  assert.ok(cutoff)
  assert.equal(eventMeetsLaunchCutoff('2026-07-31T12:00:00.000Z', cutoff!), false)
  assert.equal(eventMeetsLaunchCutoff('2026-08-01T12:00:00.000Z', cutoff!), true)
  assert.equal(eventMeetsLaunchCutoff('2026-08-15T12:00:00.000Z', cutoff!), true)

  assert.equal(
    evaluateFeedbackEligibility({
      eventStatus: 'completed',
      eventDate: '2026-07-20T12:00:00.000Z',
      clientEmail: 'guest@example.com',
      launchStartAt: cutoff,
      now: Date.parse('2026-08-05T20:00:00.000Z'),
    }).ok,
    false,
  )

  // Keep "now" inside the 14-day retry window after eligibility.
  const onCutoff = evaluateFeedbackEligibility({
    eventStatus: 'completed',
    eventDate: '2026-08-01T12:00:00.000Z',
    clientEmail: 'guest@example.com',
    launchStartAt: cutoff,
    now: Date.parse('2026-08-05T20:00:00.000Z'),
  })
  assert.equal(onCutoff.ok, true)

  const afterCutoff = evaluateFeedbackEligibility({
    eventStatus: 'completed',
    eventDate: '2026-08-10T12:00:00.000Z',
    clientEmail: 'guest@example.com',
    launchStartAt: cutoff,
    now: Date.parse('2026-08-15T20:00:00.000Z'),
  })
  assert.equal(afterCutoff.ok, true)

  // Disabled live sweep: zero mutations / emails (no DB required for early exit).
  const disabledLive = await runFeedbackSweep({
    dryRun: false,
    env: {},
  })
  assert.equal(disabledLive.automationEnabled, false)
  assert.equal(disabledLive.automationStatus, 'disabled')
  assert.equal(disabledLive.deliveryAllowed, false)
  assert.equal(disabledLive.sent, 0)
  assert.equal(disabledLive.emailsAttempted, 0)
  assert.equal(disabledLive.mutated, false)
  assert.equal(disabledLive.scanned, 0)

  const falseLive = await runFeedbackSweep({
    dryRun: false,
    env: { [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'false' },
  })
  assert.equal(falseLive.automationEnabled, false)
  assert.equal(falseLive.sent, 0)
  assert.equal(falseLive.mutated, false)
  assert.equal(falseLive.emailsAttempted, 0)

  const missingCutoffLive = await runFeedbackSweep({
    dryRun: false,
    env: { [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'true' },
  })
  assert.equal(missingCutoffLive.automationStatus, 'config_error')
  assert.equal(missingCutoffLive.deliveryAllowed, false)
  assert.equal(missingCutoffLive.sent, 0)
  assert.equal(missingCutoffLive.mutated, false)
  assert.equal(missingCutoffLive.emailsAttempted, 0)
  assert.equal(missingCutoffLive.scanned, 0)

  const dryDisabled = await runFeedbackSweep({
    dryRun: true,
    env: {},
  })
  assert.equal(dryDisabled.dryRun, true)
  assert.equal(dryDisabled.mutated, false)
  assert.equal(dryDisabled.emailsAttempted, 0)
  assert.equal(dryDisabled.sent, 0)
  assert.equal(dryDisabled.automationStatus, 'disabled')

  const dryConfigError = await runFeedbackSweep({
    dryRun: true,
    env: {
      [FEEDBACK_AUTOMATION_ENABLED_ENV]: 'true',
      [FEEDBACK_AUTOMATION_START_AT_ENV]: 'bad',
    },
  })
  assert.equal(dryConfigError.automationStatus, 'config_error')
  assert.equal(dryConfigError.mutated, false)
  assert.equal(dryConfigError.emailsAttempted, 0)
  assert.equal(dryConfigError.sent, 0)

  // --- Tokens ---
  const token = generateFeedbackToken()
  assert.ok(token.length >= 20)
  const hash = hashFeedbackToken(token)
  assert.equal(feedbackTokensMatch(token, hash), true)
  assert.equal(feedbackTokensMatch('nope', hash), false)
  assert.equal(normalizeFeedbackTokenParam('../x'), null)
  assert.equal(normalizeFeedbackTokenParam(token), token)
  assert.equal(
    resolveFeedbackLinkState({ hashFound: false }),
    'invalid',
  )
  assert.equal(
    resolveFeedbackLinkState({
      hashFound: true,
      revokedAt: new Date().toISOString(),
    }),
    'revoked',
  )
  assert.equal(
    resolveFeedbackLinkState({
      hashFound: true,
      submittedAt: new Date().toISOString(),
    }),
    'submitted',
  )
  assert.equal(
    resolveFeedbackLinkState({
      hashFound: true,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }),
    'expired',
  )

  // --- Email copy / anti review-gating ---
  const email = buildFeedbackRequestEmail({
    clientFullName: 'Martin Guest',
    occasionLabel: 'your anniversary dinner',
    feedbackUrl: 'https://platetheumpqua.com/experience/abc',
  })
  assert.equal(
    email.subject,
    'Thank you for having Plate The Umpqua at your table',
  )
  assert.doesNotMatch(email.subject, /\bPlate OS\b|Plate Business OS/)
  assert.match(email.subject, /Plate The Umpqua/)
  assert.match(email.text, /Plate The Umpqua/)
  assert.match(email.html, /Plate The Umpqua/)
  assert.doesNotMatch(email.text, /\bPlate OS\b|Plate Business OS/)
  assert.doesNotMatch(email.html, /\bPlate OS\b|Plate Business OS/)
  assert.match(email.text, /^Hi Martin,/m)
  assert.match(email.text, /Share your experience/)
  assert.match(email.text, /Leave a Google review|Google here/i)
  assert.match(email.html, /Share your experience/)
  assert.match(email.html, /Leave a Google review/)
  assert.ok(email.html.includes(GOOGLE_REVIEW_URL))
  assert.ok(email.text.includes(GOOGLE_REVIEW_URL))
  assert.doesNotMatch(
    email.text,
    /\bfive-star\b|\bWe value your feedback\b|\bAI\b|\bsurvey\b/i,
  )
  assert.doesNotMatch(email.html, /plate-the-umpqua-logo\.png/)

  const anon = buildFeedbackRequestEmail({
    clientFullName: null,
    feedbackUrl: 'https://platetheumpqua.com/experience/abc',
  })
  assert.match(anon.text, /^Hello,/m)

  assert.equal(firstNameForFeedbackGreeting('Alex Rivera'), 'Alex')
  assert.equal(firstNameForFeedbackGreeting(''), null)
  assert.equal(isValidFeedbackRating(1), true)
  assert.equal(isValidFeedbackRating(5), true)
  assert.equal(isValidFeedbackRating(0), false)
  assert.equal(FEEDBACK_CONSENT_WORDING.includes('testimonial'), true)
  assert.equal(GOOGLE_REVIEW_URL.startsWith('https://g.page/'), true)

  // --- Menu print ---
  const printed = buildMenuPrintPayload({
    occasionTitle: 'Quiet dinner',
    serviceDate: '2026-09-01T00:00:00.000Z',
    guestCount: 4,
    introductoryMessage: null,
    pricingPresentation: null,
    displayInvestment: null,
    version: 1,
    status: 'draft',
    sections: [
      {
        sectionName: 'Main',
        items: [
          {
            clientTitle: 'Roasted chicken',
            clientDescription: 'Garden herbs',
            showDietary: false,
            dietaryDisplay: null,
            allergenDisplay: null,
          },
        ],
      },
    ],
  })
  assert.equal(printed.brandName, 'Plate The Umpqua')
  assert.equal(MENU_PRINT_WORDMARK, 'Plate The Umpqua')
  assert.equal(Object.hasOwn(printed, 'logoSrc'), false)

  console.log('verify-experience-feedback: ok')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
