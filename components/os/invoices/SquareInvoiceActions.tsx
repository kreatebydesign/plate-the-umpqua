'use client'

import { useState, useTransition } from 'react'
import { createSquarePaymentInvoiceAction, syncSquareInvoiceAction } from '@/lib/os/square/actions'
import styles from '@/app/(os)/os.module.css'

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
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; message: string } | null>(null)
  const [currentUrl, setCurrentUrl] = useState(squarePublicUrl)
  const [currentStatus, setCurrentStatus] = useState(squareStatus)

  const isVoided = status === 'voided'
  const hasSquareInvoice = Boolean(squareInvoiceId)
  const isConnected = squareState === 'connected'

  function handleCreate() {
    if (!canManage || !isConnected || isVoided) return
    startTransition(async () => {
      setFeedback(null)
      const result = await createSquarePaymentInvoiceAction(invoiceId)
      if (result.ok) {
        setCurrentUrl(result.squarePublicUrl)
        setFeedback({ type: 'ok', message: 'Square payment invoice created. Share the pay link with the client.' })
      } else {
        setFeedback({ type: 'error', message: result.message })
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
          message: result.newPayments > 0
            ? `Synced. ${result.newPayments} new payment(s) recorded.`
            : 'Synced. No new payments.',
        })
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
        <a href="/os/settings/square" className={styles.inlineLink ?? ''}>
          Connect Square
        </a>{' '}
        to enable hosted payment invoices.
      </p>
    )
  }

  return (
    <div>
      {feedback && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            marginBottom: '14px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            background: feedback.type === 'ok' ? '#e8f5e9' : '#fce4ec',
            color: feedback.type === 'ok' ? '#1b5e20' : '#880e4f',
            borderLeft: `3px solid ${feedback.type === 'ok' ? '#43a047' : '#e91e63'}`,
          }}
        >
          {feedback.message}
        </div>
      )}

      {squareLastError && (
        <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '12px' }}>
          Last error: {squareLastError}
        </p>
      )}

      {currentUrl && (
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
            Square pay link
          </p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.8125rem', wordBreak: 'break-all', color: 'var(--color-accent)' }}
          >
            {currentUrl}
          </a>
          {currentStatus && (
            <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
              Square status: {currentStatus}
              {squareLastSyncedAt && ` · Last synced ${new Date(squareLastSyncedAt).toLocaleDateString()}`}
            </p>
          )}
        </div>
      )}

      <div className={styles.actions} style={{ flexWrap: 'wrap', gap: '8px' }}>
        {!hasSquareInvoice && !isVoided && (
          <button
            type="button"
            className={styles.button}
            onClick={handleCreate}
            disabled={isPending}
          >
            {isPending ? 'Creating…' : 'Create Square payment invoice'}
          </button>
        )}

        {hasSquareInvoice && (
          <button
            type="button"
            className={styles.buttonQuiet}
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
