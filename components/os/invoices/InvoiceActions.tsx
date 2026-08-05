'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import styles from '@/app/(os)/os.module.css'
import ConfirmAction from '@/components/os/ConfirmAction'
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

type ConfirmKind = 'send' | 'void' | 'payment' | null

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
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null)

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
      setConfirmKind(null)
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
        {link ? (
          <a
            href={`${link.replace(/\/$/, '')}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Print / Save PDF
          </a>
        ) : null}
        {link ? (
          <a
            href={`/api/invoice/${encodeURIComponent(link.split('/invoice/')[1] || '')}/pdf`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Download PDF
          </a>
        ) : null}
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
        <h3 className={styles.panelTitle}>Step 3 — Send invoice</h3>
        <p className={styles.fieldHint}>
          Separate from Save Draft and Create Square. Confirm before sending.
        </p>
        <label className={styles.fieldLabel}>
          Recipient
          <input
            className={styles.fieldControl}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </label>
        {confirmKind === 'send' ? (
          <ConfirmAction
            open
            title="Send invoice email?"
            body={`This emails ${recipient || 'the recipient'} with the invoice. It does not charge a card.`}
            confirmLabel="Send email"
            pending={pending}
            onCancel={() => setConfirmKind(null)}
            onConfirm={() =>
              run(() => sendInvoiceEmail(invoiceId, recipient), 'Invoice email sent.')
            }
          />
        ) : (
          <button
            type="button"
            className={styles.button}
            disabled={pending}
            onClick={() => setConfirmKind('send')}
          >
            Send invoice email
          </button>
        )}
      </div>

      {canRecordPayment ? (
        <div className={styles.opsForm} style={{ marginTop: '1rem' }}>
          <h3 className={styles.panelTitle}>Record payment</h3>
          <div className={styles.opsFields}>
            <label className={styles.fieldLabel}>
              Amount (USD)
              <input
                className={styles.fieldControl}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className={styles.fieldLabel}>
              Method
              <select
                className={`${styles.fieldControl} ${styles.selectControl}`}
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
          {confirmKind === 'payment' ? (
            <ConfirmAction
              open
              title="Record this payment?"
              body={`Record $${payAmount || '0.00'} as received. This updates the invoice balance in Plate OS.`}
              confirmLabel="Save payment"
              pending={pending}
              onCancel={() => setConfirmKind(null)}
              onConfirm={() =>
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
            />
          ) : (
            <button
              type="button"
              className={styles.button}
              disabled={pending}
              onClick={() => setConfirmKind('payment')}
            >
              Save payment
            </button>
          )}
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
          {confirmKind === 'void' ? (
            <ConfirmAction
              open
              title="Void this invoice?"
              body="Voiding cannot be undone from this screen. The invoice will no longer be collectible in Plate OS."
              confirmLabel="Void invoice"
              tone="danger"
              pending={pending}
              onCancel={() => setConfirmKind(null)}
              onConfirm={() =>
                run(() => voidInvoice(invoiceId, voidReason || 'Voided'), 'Invoice voided.')
              }
            />
          ) : (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonQuiet}`}
              disabled={pending}
              onClick={() => setConfirmKind('void')}
            >
              Void invoice
            </button>
          )}
        </div>
      ) : null}

      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </section>
  )
}
