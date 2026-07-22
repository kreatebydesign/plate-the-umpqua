'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { updateInquiryOperational } from '@/lib/os/inquiries/updateInquiryOperational'
import {
  INQUIRY_PRIORITY_LABELS,
  INQUIRY_PRIORITY_VALUES,
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUS_VALUES,
} from '@/lib/os/inquiries/inquiryConstants'
import styles from '@/app/(os)/os.module.css'

type Props = {
  inquiryId: string
  initialStatus: string
  initialPriority: string
  statusHookNote: string
}

export default function InquiryOperationalForm({
  inquiryId,
  initialStatus,
  initialPriority,
  statusHookNote,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [priority, setPriority] = useState(initialPriority)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await updateInquiryOperational(inquiryId, {
        status,
        priorityLevel: priority,
      })

      if (!result.ok) {
        setError(result.message)
        return
      }

      setStatus(result.status)
      setPriority(result.priorityLevel)
      setMessage('Operational details saved.')
      router.refresh()
    })
  }

  return (
    <form className={styles.opsForm} onSubmit={onSubmit} aria-busy={pending}>
      <div className={styles.opsFields}>
        <label className={styles.fieldLabel} htmlFor="inquiry-status">
          Status
          <select
            id="inquiry-status"
            className={styles.fieldControl}
            value={status}
            disabled={pending}
            onChange={(e) => setStatus(e.target.value)}
          >
            {INQUIRY_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {INQUIRY_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel} htmlFor="inquiry-priority">
          Priority
          <select
            id="inquiry-priority"
            className={styles.fieldControl}
            value={priority}
            disabled={pending}
            onChange={(e) => setPriority(e.target.value)}
          >
            {INQUIRY_PRIORITY_VALUES.map((value) => (
              <option key={value} value={value}>
                {INQUIRY_PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={styles.fieldHint}>{statusHookNote}</p>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending ? 'Saving…' : 'Save operational details'}
        </button>
      </div>

      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </form>
  )
}
