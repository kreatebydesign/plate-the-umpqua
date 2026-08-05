'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createSquarePaymentInvoiceAction, syncSquareInvoiceAction } from '@/lib/os/square/actions'
import styles from '@/app/(os)/os.module.css'
import ConfirmAction from '@/components/os/ConfirmAction'

type Props = {
  invoiceId: string
  squareInvoiceId: string | null
  squarePublicUrl: string | null
  squareStatus: string | null
  squareLastSyncedAt: string | null
  squareLastError: string | null
  squareState: 'not_connected' | 'connected' | 'error' | 'disconnected'
  canManage: boolean
  status: string
}

export default function SquareInvoiceActions({
  invoiceId,
  squareInvoiceId,
  squarePublicUrl,
  squareStatus,
  squareLastSyncedAt,
  squareLastError,
  squareState,
  canManage,
  status,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; message: string } | null>(null)
  const [currentUrl, setCurrentUrl] = useState(squarePublicUrl)
  const [currentStatus, setCurrentStatus] = useState(squareStatus)
  const [hasSquareInvoice, setHasSquareInvoice] = useState(Boolean(squareInvoiceId))
  const [confirmCreate, setConfirmCreate] = useState(false)

  const isVoided = status === 'voided'
  const isConnected = squareState === 'connected'

  function handleCreate() {
    if (!canManage || !isConnected || isVoided) return
    setConfirmCreate(false)
    startTransition(async () => {
      setFeedback(null)
      const result = await createSquarePaymentInvoiceAction(invoiceId)
      if (result.ok) {
        setCurrentUrl(result.squarePublicUrl)
        setHasSquareInvoice(true)
        setFeedback({
          type: 'ok',
          message: 'Square payment invoice created. Next: copy the pay link or send the Plate invoice email.',
        })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    })
  }

  function handleCopyPayLink() {
    if (!currentUrl) return
    startTransition(async () => {
      setFeedback(null)
      try {
        await navigator.clipboard.writeText(currentUrl)
        setFeedback({ type: 'ok', message: 'Square pay link copied.' })
      } catch {
        setFeedback({
          type: 'error',
          message: 'Could not copy automatically. Long-press the pay link below to copy.',
        })
      }
    })
  }

  function handleSync() {
    if (!hasSquareInvoice) return
    startTransition(async () => {
      setFeedback(null)
      const result = await syncSquareInvoiceAction(invoiceId)
      if (result.ok) {
        setCurrentStatus(result.squareStatus)
        setFeedback({
          type: 'ok',
          message:
            result.newPayments > 0
              ? `Synced. ${result.newPayments} new payment(s) recorded.`
              : 'Synced. No new payments.',
        })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    })
  }

  if (!canManage) return null

  if (!isConnected) {
    return (
      <p className={styles.fieldHint}>
        Square is not connected.{' '}
        <a href="/os/settings/square" className={styles.inlineLink}>
          Connect Square
        </a>{' '}
        to enable hosted payment invoices.
      </p>
    )
  }

  return (
    <div>
      <p className={styles.workflowBanner}>
        <strong>Step 2 — Create Square payment invoice</strong>
        <span className={styles.workflowNext}>
          Separate from Save Draft and Send Email. Creates a hosted Square pay link only.
        </span>
      </p>

      {feedback && (
        <div
          role="alert"
          className={feedback.type === 'ok' ? styles.formSuccess : styles.sectionError}
          style={{ marginBottom: '0.85rem' }}
        >
          {feedback.message}
        </div>
      )}

      {squareLastError && (
        <p className={styles.sectionError} style={{ marginBottom: '0.75rem' }}>
          Last Square error: {squareLastError}
        </p>
      )}

      {currentUrl && (
        <div style={{ marginBottom: '0.9rem' }}>
          <p className={styles.fieldHint} style={{ marginBottom: '0.35rem' }}>
            Square pay link
          </p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inlineLink}
            style={{ display: 'block', wordBreak: 'break-all', fontSize: '0.9rem' }}
          >
            {currentUrl}
          </a>
          {currentStatus && (
            <p className={styles.fieldHint} style={{ marginTop: '0.35rem' }}>
              Square status: {currentStatus}
              {squareLastSyncedAt
                ? ` · Last synced ${new Date(squareLastSyncedAt).toLocaleDateString()}`
                : ''}
            </p>
          )}
        </div>
      )}

      {!hasSquareInvoice && !isVoided ? (
        confirmCreate ? (
          <ConfirmAction
            open
            title="Create Square payment invoice?"
            body="This creates a hosted Square pay link for this Plate draft. It does not email the client and does not charge a card."
            confirmLabel="Create Square invoice"
            pending={isPending}
            onCancel={() => setConfirmCreate(false)}
            onConfirm={handleCreate}
          />
        ) : (
          <div className={styles.actions} style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
            <button
              type="button"
              className={styles.button}
              onClick={() => setConfirmCreate(true)}
              disabled={isPending}
            >
              Create Square payment invoice
            </button>
          </div>
        )
      ) : null}

      <div className={styles.actions} style={{ flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.65rem' }}>
        {currentUrl && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            onClick={handleCopyPayLink}
            disabled={isPending}
          >
            Copy payment link
          </button>
        )}

        {hasSquareInvoice && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            onClick={handleSync}
            disabled={isPending}
          >
            {isPending ? 'Syncing…' : 'Sync Square payments'}
          </button>
        )}
      </div>
    </div>
  )
}
