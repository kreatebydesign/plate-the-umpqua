'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import {
  duplicateInvoice,
  ensureInvoicePublicLink,
  markInvoiceSent,
  recordInvoicePayment,
  sendInvoiceEmail,
  voidInvoice,
} from '@/lib/os/invoices/mutateInvoice'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_VALUES } from '@/lib/os/invoices/invoiceConstants'

type Props = {
  invoiceId: string
  status: string
  billToEmail: string
  publicLink: string | null
  canEdit: boolean
  canRecordPayment: boolean
  canManage: boolean
}

export default function InvoiceActions({
  invoiceId,
  status,
  billToEmail,
  publicLink,
  canEdit,
  canRecordPayment,
  canManage,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState(publicLink)
  const [recipient, setRecipient] = useState(billToEmail)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('card')
  const [payRef, setPayRef] = useState('')
  const [voidReason, setVoidReason] = useState('')

  function run(action: () => Promise<{ ok: true } | { ok: false; message: string }>, success: string) {
    if (pending) return
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message)
        return
      }
      setMessage(success)
      router.refresh()
    })
  }

  if (!canManage) return null

  return (
    <section className={styles.panel} aria-label="Invoice actions">
      <h2 className={styles.panelTitle}>Actions</h2>
      <div className={styles.actions}>
        {canEdit ? (
          <Link
            href={`/os/invoices/${invoiceId}/edit`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Edit
          </Link>
        ) : null}
        <button
          type="button"
          className={styles.button}
          disabled={pending}
          onClick={() =>
            run(async () => {
              const result = await ensureInvoicePublicLink(invoiceId)
              if (result.ok) {
                setLink(result.url)
                try {
                  await navigator.clipboard.writeText(result.url)
                } catch {
                  /* ignore clipboard failures */
                }
              }
              return result
            }, 'Secure invoice link ready (copied when available).')
          }
        >
          Copy secure link
        </button>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Open client view
          </a>
        ) : null}
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={pending}
          onClick={() => window.print()}
        >
          Print invoice
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={pending}
          onClick={() =>
            run(async () => {
              const result = await duplicateInvoice(invoiceId)
              if (result.ok) {
                router.push(`/os/invoices/${result.id}`)
              }
              return result
            }, 'Invoice duplicated.')
          }
        >
          Duplicate
        </button>
        {status === 'draft' ? (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            disabled={pending}
            onClick={() => run(() => markInvoiceSent(invoiceId), 'Marked as sent.')}
          >
            Mark sent
          </button>
        ) : null}
      </div>

      <div className={styles.opsForm} style={{ marginTop: '1rem' }}>
        <h3 className={styles.panelTitle}>Send email</h3>
        <label className={styles.fieldLabel}>
          Recipient
          <input
            className={styles.fieldControl}
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </label>
        <button
          type="button"
          className={styles.button}
          disabled={pending}
          onClick={() =>
            run(() => sendInvoiceEmail(invoiceId, recipient), 'Invoice email sent.')
          }
        >
          Send invoice email
        </button>
      </div>

      {canRecordPayment ? (
        <div className={styles.opsForm} style={{ marginTop: '1rem' }}>
          <h3 className={styles.panelTitle}>Record payment</h3>
          <div className={styles.opsFields}>
            <label className={styles.fieldLabel}>
              Amount (USD)
              <input
                className={styles.fieldControl}
                type="number"
                min="0.01"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </label>
            <label className={styles.fieldLabel}>
              Method
              <select
                className={styles.fieldControl}
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                {PAYMENT_METHOD_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PAYMENT_METHOD_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.fieldLabel}>
              Reference
              <input
                className={styles.fieldControl}
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className={styles.button}
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  recordInvoicePayment(invoiceId, {
                    amountCents: Math.round(Number(payAmount || 0) * 100),
                    method: payMethod,
                    reference: payRef,
                    paidAt: new Date().toISOString(),
                  }),
                'Payment recorded.',
              )
            }
          >
            Save payment
          </button>
        </div>
      ) : null}

      {status !== 'voided' ? (
        <div className={styles.opsForm} style={{ marginTop: '1rem' }}>
          <h3 className={styles.panelTitle}>Void invoice</h3>
          <label className={styles.fieldLabel}>
            Reason
            <input
              className={styles.fieldControl}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            disabled={pending}
            onClick={() =>
              run(() => voidInvoice(invoiceId, voidReason || 'Voided'), 'Invoice voided.')
            }
          >
            Void invoice
          </button>
        </div>
      ) : null}

      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </section>
  )
}
