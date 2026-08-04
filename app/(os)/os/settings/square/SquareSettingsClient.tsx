'use client'

import { useState, useTransition } from 'react'
import type { ConnectionRecord } from '@/lib/os/square/connection'
import { selectSquareLocation, disconnectSquare, getSquareOAuthStartUrl } from '@/lib/os/square/actions'
import styles from '../../../os.module.css'
import squareStyles from './square.module.css'

type Props = {
  connection: ConnectionRecord | null
  sandboxMode: boolean
  flashConnected?: boolean
  flashError?: string | null
}

export default function SquareSettingsClient({
  connection,
  sandboxMode,
  flashConnected,
  flashError,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; message: string } | null>(
    flashConnected
      ? { type: 'ok', message: 'Square connected successfully.' }
      : flashError
        ? { type: 'error', message: flashError }
        : null,
  )
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')

  const isConnected = connection?.status === 'connected'

  function handleConnect() {
    startTransition(async () => {
      setFeedback(null)
      const result = await getSquareOAuthStartUrl()
      if (!result.ok) {
        setFeedback({ type: 'error', message: result.message })
        return
      }
      window.location.href = result.url
    })
  }

  function handleDisconnect() {
    if (!confirm('Disconnect Square? This will revoke OAuth tokens and stop payment collection.')) return
    startTransition(async () => {
      setFeedback(null)
      const result = await disconnectSquare()
      if (result.ok) {
        setFeedback({ type: 'ok', message: 'Square disconnected.' })
        window.location.reload()
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    })
  }

  function handleSelectLocation(e: React.FormEvent) {
    e.preventDefault()
    if (!locationId.trim()) return
    startTransition(async () => {
      setFeedback(null)
      const result = await selectSquareLocation(locationId, locationName)
      if (result.ok) {
        setFeedback({ type: 'ok', message: 'Location saved.' })
        window.location.reload()
      } else {
        setFeedback({ type: 'error', message: result.message })
      }
    })
  }

  return (
    <div className={squareStyles.page}>
      <div className={squareStyles.header}>
        <h2 className={squareStyles.heading}>Square Integration</h2>
        {sandboxMode && (
          <span className={squareStyles.sandboxBadge}>Sandbox Mode</span>
        )}
      </div>

      <p className={squareStyles.description}>
        Connect Square to create hosted payment invoices. Plate OS remains the source of truth —
        Square handles secure payment collection only. Invoice emails come from Plate, not Square.
      </p>

      {feedback && (
        <div
          className={feedback.type === 'ok' ? squareStyles.successBanner : squareStyles.errorBanner}
          role="alert"
        >
          {feedback.message}
        </div>
      )}

      <section className={squareStyles.section}>
        <h3 className={squareStyles.sectionTitle}>Connection Status</h3>

        {!connection && (
          <div className={squareStyles.statusRow}>
            <span className={squareStyles.statusDot} data-status="disconnected" />
            <span>Not connected</span>
          </div>
        )}

        {connection && (
          <dl className={squareStyles.details}>
            <dt>Status</dt>
            <dd>
              <span className={squareStyles.statusDot} data-status={connection.status} />
              {connection.status === 'connected' ? 'Connected' : connection.status}
            </dd>

            {connection.merchantName && (
              <>
                <dt>Merchant</dt>
                <dd>{connection.merchantName}</dd>
              </>
            )}

            {connection.merchantId && (
              <>
                <dt>Merchant ID</dt>
                <dd className={squareStyles.mono}>{connection.merchantId}</dd>
              </>
            )}

            {connection.locationName && (
              <>
                <dt>Location</dt>
                <dd>{connection.locationName}</dd>
              </>
            )}

            {connection.locationId && (
              <>
                <dt>Location ID</dt>
                <dd className={squareStyles.mono}>{connection.locationId}</dd>
              </>
            )}

            {connection.accessTokenExpiresAt && (
              <>
                <dt>Token expires</dt>
                <dd>{new Date(connection.accessTokenExpiresAt).toLocaleDateString()}</dd>
              </>
            )}

            {connection.lastSyncedAt && (
              <>
                <dt>Last synced</dt>
                <dd>{new Date(connection.lastSyncedAt).toLocaleString()}</dd>
              </>
            )}

            {connection.lastError && (
              <>
                <dt>Last error</dt>
                <dd className={squareStyles.errorText}>{connection.lastError}</dd>
              </>
            )}
          </dl>
        )}

        <div className={squareStyles.actions}>
          {!isConnected ? (
            <button
              type="button"
              className={styles.button}
              onClick={handleConnect}
              disabled={isPending}
            >
              {isPending ? 'Redirecting…' : 'Connect Square'}
            </button>
          ) : (
            <button
              type="button"
              className={styles.textButtonDanger}
              onClick={handleDisconnect}
              disabled={isPending}
            >
              {isPending ? 'Disconnecting…' : 'Disconnect Square'}
            </button>
          )}
        </div>
      </section>

      {isConnected && !connection?.locationId && (
        <section className={squareStyles.section}>
          <h3 className={squareStyles.sectionTitle}>Select Location</h3>
          <p className={squareStyles.description}>
            Enter the Square location ID to use for invoices. You can find this in your Square
            Developer Dashboard or by listing locations via the API.
          </p>
          <form onSubmit={handleSelectLocation} className={squareStyles.form}>
            <label className={squareStyles.label} htmlFor="sq-location-id">
              Location ID
            </label>
            <input
              id="sq-location-id"
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className={squareStyles.input}
              placeholder="e.g. LXXXXXXXXXXXXXXXXXX"
              required
              disabled={isPending}
            />
            <label className={squareStyles.label} htmlFor="sq-location-name">
              Location name (optional)
            </label>
            <input
              id="sq-location-name"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className={squareStyles.input}
              placeholder="e.g. Main Location"
              disabled={isPending}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={isPending || !locationId.trim()}
            >
              {isPending ? 'Saving…' : 'Save location'}
            </button>
          </form>
        </section>
      )}

      {sandboxMode && (
        <section className={squareStyles.section}>
          <h3 className={squareStyles.sectionTitle}>Sandbox Notes</h3>
          <ul className={squareStyles.checklist}>
            <li>Using Square Sandbox — no real payments are processed</li>
            <li>Set SQUARE_ENVIRONMENT=production to activate live payments (director authorization required)</li>
            <li>Test card: 4111 1111 1111 1111, any future expiry, any CVV</li>
            <li>Webhook endpoint: {`{NEXT_PUBLIC_SITE_URL}/api/square/webhook`}</li>
            <li>OAuth redirect URL: {`{NEXT_PUBLIC_SITE_URL}/api/square/oauth/callback`}</li>
          </ul>
        </section>
      )}
    </div>
  )
}
