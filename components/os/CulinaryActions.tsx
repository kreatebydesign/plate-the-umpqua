'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import styles from '@/app/(os)/os.module.css'
import {
  createMenuReviewLink,
  duplicateMenuVersion,
  revokeMenuReviewLink,
  snapshotMenuRevision,
} from '@/lib/os/menus/mutateMenu'
import { duplicateRecipe } from '@/lib/os/recipes/mutateRecipe'

export function RecipeDuplicateButton({ recipeId }: { recipeId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div>
      <button
        type="button"
        className={`${styles.button} ${styles.buttonQuiet}`}
        disabled={pending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await duplicateRecipe(recipeId)
            if (!result.ok) {
              setError(result.message)
              return
            }
            router.push(`/os/recipes/${result.id}`)
            router.refresh()
          })
        }}
      >
        {pending ? 'Duplicating…' : 'Duplicate recipe'}
      </button>
      <div aria-live="polite">
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </div>
  )
}

export function MenuReviewActions({
  menuId,
  clientEmail,
  hasActiveReviewLink,
}: {
  menuId: string
  clientEmail: string | null
  hasActiveReviewLink: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [reviewUrl, setReviewUrl] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function run(
    action: () => ReturnType<typeof createMenuReviewLink> | ReturnType<typeof revokeMenuReviewLink>,
  ) {
    if (pending) return
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message)
        return
      }
      if ('reviewUrl' in result && result.reviewUrl) {
        setReviewUrl(result.reviewUrl)
      }
      if ('emailMessage' in result && result.emailMessage) {
        setMessage(result.emailMessage)
      } else {
        setMessage('Done.')
      }
      router.refresh()
    })
  }

  return (
    <div className={styles.builderForm}>
      <p className={styles.builderHint}>
        Menus are never sent automatically on save. Generate a secure link, then
        optionally email the client.
        {clientEmail
          ? ` Client email on file: ${clientEmail}.`
          : ' No client email on file.'}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          disabled={pending}
          onClick={() =>
            run(() => createMenuReviewLink(menuId, { sendEmail: false }))
          }
        >
          {pending ? 'Working…' : 'Create review link'}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={pending || !clientEmail}
          onClick={() =>
            run(() => createMenuReviewLink(menuId, { sendEmail: true }))
          }
        >
          Send for review by email
        </button>
        {hasActiveReviewLink ? (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            disabled={pending}
            onClick={() => run(() => revokeMenuReviewLink(menuId))}
          >
            Revoke link
          </button>
        ) : null}
      </div>
      {reviewUrl ? (
        <label className={styles.fieldLabel}>
          Secure review link
          <input
            className={styles.fieldControl}
            readOnly
            value={reviewUrl}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      ) : null}
      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </div>
  )
}

export function MenuVersionActions({ menuId }: { menuId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={pending}
          onClick={() => {
            setError(null)
            setMessage(null)
            startTransition(async () => {
              const result = await snapshotMenuRevision(
                menuId,
                'operator-revision',
              )
              if (!result.ok) {
                setError(result.message)
                return
              }
              setMessage('Revision snapshot recorded. Version incremented.')
              router.refresh()
            })
          }}
        >
          {pending ? 'Working…' : 'Record revision snapshot'}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={pending}
          onClick={() => {
            setError(null)
            setMessage(null)
            startTransition(async () => {
              const result = await duplicateMenuVersion(menuId)
              if (!result.ok) {
                setError(result.message)
                return
              }
              router.push(`/os/menus/${result.id}`)
              router.refresh()
            })
          }}
        >
          Duplicate as new version
        </button>
      </div>
      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </div>
  )
}
