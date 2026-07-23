'use client'

import { useId, useState, useTransition } from 'react'
import type { PublicFeedbackContext } from '@/lib/os/events/publicFeedback'
import { GOOGLE_REVIEW_URL } from '@/lib/os/events/feedbackConstants'
import styles from '../../experience.module.css'

type Props = {
  token: string
  context: PublicFeedbackContext
}

export default function ExperienceFeedbackForm({ token, context }: Props) {
  const formId = useId()
  const [rating, setRating] = useState<number | null>(null)
  const [comments, setComments] = useState('')
  const [stoodOut, setStoodOut] = useState('')
  const [permission, setPermission] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(null)

    if (rating == null) {
      setError('Please choose a rating from 1 to 5.')
      return
    }
    if (!comments.trim()) {
      setError('Please share a few words about the experience.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/experience-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            rating,
            comments,
            stoodOut,
            testimonialPermission: permission,
            publicDisplayName: displayName,
          }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          message?: string
          googleReviewUrl?: string
        }
        if (!res.ok || !data.ok) {
          setError(data.message || 'Something went wrong. Please try again.')
          return
        }
        setDone(true)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  if (done) {
    return (
      <div className={styles.form} aria-live="polite">
        <h2 className={styles.googleTitle}>Thank you</h2>
        <p className={styles.lede} style={{ marginTop: '0.75rem' }}>
          Thank you. I appreciate you taking the time to share this with me.
        </p>
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
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field} role="group" aria-labelledby={`${formId}-rating`}>
        <p id={`${formId}-rating`} className={styles.label}>
          Overall experience <span className={styles.required}>*</span>
        </p>
        <div className={styles.ratingGroup}>
          {[1, 2, 3, 4, 5].map((value) => {
            const inputId = `${formId}-rating-${value}`
            return (
              <label key={value} className={styles.ratingOption} htmlFor={inputId}>
                <input
                  id={inputId}
                  className={styles.ratingInput}
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                />
                <span className={styles.ratingFace}>{value}</span>
              </label>
            )
          })}
        </div>
      </div>

      <label className={styles.field} htmlFor={`${formId}-comments`}>
        <span className={styles.label}>
          Comments <span className={styles.required}>*</span>
        </span>
        <textarea
          id={`${formId}-comments`}
          className={styles.textarea}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          maxLength={4000}
          required
        />
      </label>

      <label className={styles.field} htmlFor={`${formId}-stood-out`}>
        <span className={styles.label}>What stood out? (optional)</span>
        <textarea
          id={`${formId}-stood-out`}
          className={styles.textarea}
          value={stoodOut}
          onChange={(e) => setStoodOut(e.target.value)}
          maxLength={800}
        />
      </label>

      <label className={styles.checkboxRow} htmlFor={`${formId}-consent`}>
        <input
          id={`${formId}-consent`}
          className={styles.checkbox}
          type="checkbox"
          checked={permission}
          onChange={(e) => setPermission(e.target.checked)}
        />
        <span>{context.consentWording}</span>
      </label>

      {permission ? (
        <>
          <label className={styles.field} htmlFor={`${formId}-display-name`}>
            <span className={styles.label}>Public display name (optional)</span>
            <input
              id={`${formId}-display-name`}
              className={styles.control}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              placeholder="Martin S. or Private dinner client"
            />
          </label>
          <p className={styles.hint}>
            Permission never publishes your comments automatically. Martin reviews
            any public excerpt first.
          </p>
        </>
      ) : null}

      <div aria-live="polite">
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
    </form>
  )
}
