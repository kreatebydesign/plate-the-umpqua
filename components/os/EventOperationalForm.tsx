'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { updateEventOperational } from '@/lib/os/events/updateEventOperational'
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VALUES,
} from '@/lib/os/events/eventConstants'
import styles from '@/app/(os)/os.module.css'

type Props = {
  eventId: string
  initialStatus: string
}

export default function EventOperationalForm({
  eventId,
  initialStatus,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await updateEventOperational(eventId, {
        eventStatus: status,
      })

      if (!result.ok) {
        setError(result.message)
        return
      }

      setStatus(result.eventStatus)
      setMessage('Operational status saved.')
      router.refresh()
    })
  }

  return (
    <form className={styles.opsForm} onSubmit={onSubmit} aria-busy={pending}>
      <div className={styles.opsFields}>
        <label className={styles.fieldLabel} htmlFor="event-status">
          Status
          <select
            id="event-status"
            className={styles.fieldControl}
            value={status}
            disabled={pending}
            onChange={(e) => setStatus(e.target.value)}
          >
            {EVENT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {EVENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={styles.fieldHint}>
        Status updates apply only to this event record. There is no automated
        email or calendar sync from Plate OS.
      </p>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending ? 'Saving…' : 'Save status'}
        </button>
      </div>

      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </form>
  )
}
