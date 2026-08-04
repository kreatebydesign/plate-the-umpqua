'use client'

import { useState, useTransition } from 'react'
import type { ConnectionRecord } from '@/lib/os/square/connection'
import { selectSquareLocation, disconnectSquare, getSquareOAuthStartUrl } from '@/lib/os/square/actions'
import styles from '../../../os.module.css'
import squareStyles from './square.module.css'

type LocationOption = {
  id: string
  name: string
  status: string
  address: string | null
}

type Props = {
  connection: ConnectionRecord | null
  sandboxMode: boolean
  flashConnected?: boolean
  flashError?: string | null
  locations?: LocationOption[]
  locationsError?: string | null
}

function redactId(id: string): string {
  if (!id || id.length < 8) return id || 'n/a'
  return `${id.slice(0, 4)}…${id.slice(-4)}`
}

export default function SquareSettingsClient({
  connection,
  sandboxMode,
  flashConnected,
  flashError,
  locations = [],
  locationsError = null,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; message: string } | null>(
    flashConnected
      ? { type: 'ok', message: 'Square connected successfully.' }
      : flashError
        ? { type: 'error', message: flashError }
        : null,
  )
  const [selectedLocationId, setSelectedLocationId] = useState('')

  const isConnected = connection?.status === 'connected'
  const activeLocations = locations.filter((l) => String(l.status).toUpperCase() === 'ACTIVE')
  const choices = activeLocations.length > 0 ? activeLocations : locations

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
    const label = sandboxMode ? 'Sandbox' : 'Production / Live'
    if (
      !confirm(
        `Disconnect Square (${label})? This will revoke OAuth tokens for the current environment and stop payment collection.`,
      )
    ) {
      return
    }
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
    if (!selectedLocationId.trim()) return
    const match = choices.find((l) => l.id === selectedLocationId)
    startTransition(async () => {
      setFeedback(null)
      const result = await selectSquareLocation(selectedLocationId, match?.name ?? '')
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
        {sandboxMode ? (
          <span className={squareStyles.sandboxBadge}>Sandbox Mode</span>
        ) : (
          <span className={squareStyles.productionBadge}>Production / Live</span>
        )}
      </div>

      <p className={squareStyles.description}>
        Connect Square to create hosted payment invoices. Plate OS remains the source of truth —
        Square handles secure payment collection only. Invoice emails come from Plate, not Square.
      </p>

      {sandboxMode && (
        <p className={squareStyles.description}>
          Sandbox tip: open the Square Sandbox Dashboard and sign in as your Sandbox test seller
          before clicking Connect. Square’s Sandbox authorization page stays blank until that
          seller session exists.
        </p>
      )}

      {!sandboxMode && (
        <p className={squareStyles.description}>
          Live mode: Martin must authorize Plate The Umpqua’s real Square seller on Square’s
          official login screen. Never paste passwords, secrets, or authorization codes into chat.
        </p>
      )}

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
            <span>Not connected{sandboxMode ? '' : ' to Production'}</span>
          </div>
        )}

        {connection && (
          <dl className={squareStyles.details}>
            <dt>Environment</dt>
            <dd>{connection.environment === 'production' ? 'Production / Live' : 'Sandbox'}</dd>

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
                <dd className={squareStyles.mono}>{redactId(connection.merchantId)}</dd>
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
                <dd className={squareStyles.mono}>{redactId(connection.locationId)}</dd>
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
            Choose the Square location for live invoices. If more than one active location appears,
            pick the Plate The Umpqua location Martin wants connected — nothing is saved until you
            confirm.
          </p>

          {locationsError && (
            <div className={squareStyles.errorBanner} role="alert">
              {locationsError}
            </div>
          )}

          {!locationsError && choices.length === 0 && (
            <p className={squareStyles.description}>No locations returned from Square yet.</p>
          )}

          {choices.length > 0 && (
            <form onSubmit={handleSelectLocation} className={squareStyles.form}>
              <label className={squareStyles.label} htmlFor="sq-location">
                Location
              </label>
              <select
                id="sq-location"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className={squareStyles.input}
                required
                disabled={isPending}
              >
                <option value="">Select a location…</option>
                {choices.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.status}) · {redactId(l.id)}
                    {l.address ? ` · ${l.address}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className={styles.button}
                disabled={isPending || !selectedLocationId.trim()}
              >
                {isPending ? 'Saving…' : 'Save location'}
              </button>
            </form>
          )}
        </section>
      )}

      {sandboxMode ? (
        <section className={squareStyles.section}>
          <h3 className={squareStyles.sectionTitle}>Sandbox Notes</h3>
          <ul className={squareStyles.checklist}>
            <li>Using Square Sandbox — no real payments are processed</li>
            <li>Production requires SQUARE_ENVIRONMENT=production and Production credentials</li>
            <li>Test card: 4111 1111 1111 1111, any future expiry, any CVV</li>
            <li>Webhook endpoint: {'{NEXT_PUBLIC_SITE_URL}'}/api/square/webhook</li>
            <li>OAuth redirect URL: {'{NEXT_PUBLIC_SITE_URL}'}/api/square/oauth/callback</li>
          </ul>
        </section>
      ) : (
        <section className={squareStyles.section}>
          <h3 className={squareStyles.sectionTitle}>Production Notes</h3>
          <ul className={squareStyles.checklist}>
            <li>Live Square seller authorization required — real money when invoices are paid</li>
            <li>Sandbox connection records are isolated and are not used in Production</li>
            <li>Invoice create / sync / pay remain manual Plate OS actions</li>
            <li>
              OAuth callback:{' '}
              https://www.platetheumpqua.com/api/square/oauth/callback
            </li>
            <li>Webhook: https://www.platetheumpqua.com/api/square/webhook</li>
          </ul>
        </section>
      )}
    </div>
  )
}
