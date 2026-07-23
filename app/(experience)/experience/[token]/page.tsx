import type { Metadata } from 'next'
import { lookupFeedbackByToken } from '@/lib/os/events/publicFeedback'
import { GOOGLE_REVIEW_URL } from '@/lib/os/events/feedbackConstants'
import ExperienceFeedbackForm from './ExperienceFeedbackForm'
import styles from '../../experience.module.css'

export const dynamic = 'force-dynamic'

type Params = Promise<{ token: string }>

export const metadata: Metadata = {
  title: 'Share your experience',
  robots: { index: false, follow: false },
}

function GoogleInvite() {
  return (
    <div className={styles.invite}>
      <p className={styles.inviteCopy}>
        You can still share your experience on Google.
      </p>
      <div className={styles.ctaRow}>
        <a
          className={styles.linkButton}
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Leave a Google review
        </a>
      </div>
    </div>
  )
}

function UnavailableState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lede}>{body}</p>
      <GoogleInvite />
    </>
  )
}

export default async function ExperienceFeedbackPage({
  params,
}: {
  params: Params
}) {
  const { token } = await params
  const lookup = await lookupFeedbackByToken(token)
  const isValid = lookup.state === 'valid'

  return (
    <main className={styles.stage}>
      <article className={styles.panel}>
        <p className={styles.wordmark}>{lookup.context.brandName}</p>
        <hr className={styles.rule} aria-hidden="true" />

        {isValid ? (
          <>
            <h1 className={styles.title}>Share your experience</h1>
            <p className={styles.lede}>
              Thank you for having Plate The Umpqua be part of your occasion. I’d
              appreciate hearing what stood out and anything I could make even
              better.
            </p>
            <ExperienceFeedbackForm token={token} context={lookup.context} />
          </>
        ) : lookup.state === 'submitted' ? (
          <UnavailableState
            title="Already received"
            body="Thank you — feedback for this experience has already been received."
          />
        ) : lookup.state === 'expired' ? (
          <UnavailableState
            title="This link has expired"
            body="This feedback link may have expired or is no longer active. If you recently joined us for an experience and need assistance, please contact Plate The Umpqua directly."
          />
        ) : (
          <UnavailableState
            title="This link is unavailable"
            body="This feedback link may have expired or is no longer active. If you recently joined us for an experience and need assistance, please contact Plate The Umpqua directly."
          />
        )}
      </article>
    </main>
  )
}
