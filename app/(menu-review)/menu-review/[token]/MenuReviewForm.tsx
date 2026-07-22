'use client'

import { useState, useTransition } from 'react'
import styles from '../../menu-review.module.css'

type Props = {
  token: string
  alreadyApproved: boolean
}

export default function MenuReviewForm({ token, alreadyApproved }: Props) {
  const [action, setAction] = useState<'approve' | 'requestRevision'>('approve')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(
    alreadyApproved ? 'This menu has already been approved. Thank you.' : null,
  )
  const [pending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(alreadyApproved)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || submitted) return
    setError(null)

    if (action === 'requestRevision' && comment.trim().length < 4) {
      setError('Please share a short note about the revisions you need.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/menu-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            action,
            comment,
          }),
        })

        const data = (await response.json().catch(() => null)) as {
          success?: boolean
          message?: string
        } | null

        if (!response.ok || !data?.success) {
          setError(data?.message || 'Unable to submit your response right now.')
          return
        }

        setSubmitted(true)
        setSuccess(
          action === 'approve'
            ? 'Thank you — your approval has been recorded.'
            : 'Thank you — your revision request has been sent to Plate.',
        )
      } catch {
        setError('Unable to submit your response right now.')
      }
    })
  }

  if (submitted && success) {
    return (
      <div className={styles.stateCard} role="status">
        <h2 className={styles.stateTitle}>Response received</h2>
        <p className={styles.stateCopy}>{success}</p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-busy={pending} noValidate>
      <h2 className={styles.formTitle}>Your response</h2>
      <label className={styles.label} htmlFor="review-action">
        Decision
        <select
          id="review-action"
          className={styles.control}
          value={action}
          disabled={pending}
          onChange={(e) =>
            setAction(e.target.value as 'approve' | 'requestRevision')
          }
        >
          <option value="approve">Approve menu</option>
          <option value="requestRevision">Request revisions</option>
        </select>
      </label>

      <label className={styles.label} htmlFor="review-comment">
        {action === 'requestRevision'
          ? 'Revision notes (required)'
          : 'Comment (optional)'}
        <textarea
          id="review-comment"
          className={styles.textarea}
          value={comment}
          disabled={pending}
          required={action === 'requestRevision'}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending ? 'Sending…' : 'Submit response'}
        </button>
      </div>

      <div aria-live="polite">
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </form>
  )
}
