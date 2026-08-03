'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/app/(os)/os.module.css'
import { createInvoice, updateInvoice } from '@/lib/os/invoices/mutateInvoice'
import { calculateInvoice } from '@/lib/os/invoices/invoiceCalc'
import { formatUsdFromCents } from '@/lib/os/invoices/money'
import {
  BILLING_PRESET_DESCRIPTIONS,
  BILLING_TYPE_LABELS,
  BILLING_TYPE_VALUES,
  PAYMENT_TERMS_LABELS,
  PAYMENT_TERMS_VALUES,
  type BillingTypeValue,
} from '@/lib/os/invoices/invoiceConstants'

import type {
  EditorClientOption,
  EditorEventOption,
  EditorLine,
} from '@/lib/os/invoices/editorTypes'

export type { EditorClientOption, EditorEventOption, EditorLine }

type Props = {
  mode: 'create' | 'edit'
  invoiceId?: string
  clients: EditorClientOption[]
  events: EditorEventOption[]
  initial?: {
    clientId: string
    eventId: string
    issueDate: string
    dueDate: string
    paymentTerms: string
    paymentTermsCustom: string
    billToName: string
    billToEmail: string
    billToPhone: string
    billToCompany: string
    lineItems: EditorLine[]
    discountType: string
    discountValue: number
    taxRateBps: number
    depositRequiredCents: number
    clientMemo: string
    internalNotes: string
  }
}

function todayInputValue() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function newLine(partial?: Partial<EditorLine>): EditorLine {
  return {
    itemKey: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    detail: '',
    billingType: 'flat',
    quantity: 1,
    unitPriceCents: 0,
    isCredit: false,
    ...partial,
  }
}

function centsInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

export default function InvoiceEditorForm({
  mode,
  invoiceId,
  clients,
  events,
  initial,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState(initial?.clientId || '')
  const [eventId, setEventId] = useState(initial?.eventId || '')
  const [issueDate, setIssueDate] = useState(initial?.issueDate?.slice(0, 10) || todayInputValue())
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) || todayInputValue())
  const [paymentTerms, setPaymentTerms] = useState(initial?.paymentTerms || 'net14')
  const [paymentTermsCustom, setPaymentTermsCustom] = useState(
    initial?.paymentTermsCustom || '',
  )
  const [billToName, setBillToName] = useState(initial?.billToName || '')
  const [billToEmail, setBillToEmail] = useState(initial?.billToEmail || '')
  const [billToPhone, setBillToPhone] = useState(initial?.billToPhone || '')
  const [billToCompany, setBillToCompany] = useState(initial?.billToCompany || '')
  const [lines, setLines] = useState<EditorLine[]>(
    initial?.lineItems?.length
      ? initial.lineItems
      : [newLine({ description: 'Event catering', billingType: 'perEvent' })],
  )
  const [discountType, setDiscountType] = useState(initial?.discountType || 'none')
  const [discountValue, setDiscountValue] = useState(initial?.discountValue || 0)
  const [taxRateBps, setTaxRateBps] = useState(initial?.taxRateBps || 0)
  const [depositRequiredCents, setDepositRequiredCents] = useState(
    initial?.depositRequiredCents || 0,
  )
  const [clientMemo, setClientMemo] = useState(initial?.clientMemo || '')
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes || '')

  const clientEvents = useMemo(
    () => events.filter((event) => !clientId || event.clientId === clientId),
    [events, clientId],
  )

  const totals = useMemo(() => {
    try {
      return calculateInvoice({
        lines,
        discountType: discountType as 'none' | 'fixed' | 'percent',
        discountValue,
        taxRateBps,
        amountPaidCents: 0,
      })
    } catch {
      return null
    }
  }, [lines, discountType, discountValue, taxRateBps])

  function onClientChange(nextId: string) {
    setClientId(nextId)
    const client = clients.find((c) => c.id === nextId)
    if (client) {
      setBillToName(client.name)
      setBillToEmail(client.email)
      setBillToPhone(client.phone || '')
    }
    if (eventId) {
      const stillValid = events.some((e) => e.id === eventId && e.clientId === nextId)
      if (!stillValid) setEventId('')
    }
  }

  function onEventChange(nextId: string) {
    setEventId(nextId)
    const event = events.find((e) => e.id === nextId)
    if (!event) return
    if (event.clientId) onClientChange(event.clientId)
    setLines((prev) => {
      if (prev.length === 1 && !prev[0].description) {
        return [
          newLine({
            description: event.name,
            billingType: 'perEvent',
            quantity: event.guestCount && event.guestCount > 0 ? 1 : 1,
          }),
        ]
      }
      return prev
    })
  }

  function updateLine(index: number, patch: Partial<EditorLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function moveLine(index: number, direction: -1 | 1) {
    setLines((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    setError(null)

    const payload = {
      clientId,
      eventId: eventId || null,
      issueDate,
      dueDate,
      paymentTerms,
      paymentTermsCustom,
      billToName,
      billToEmail,
      billToPhone,
      billToCompany,
      lineItems: lines,
      discountType,
      discountValue,
      taxRateBps,
      depositRequiredCents,
      clientMemo,
      internalNotes,
    }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createInvoice(payload)
          : await updateInvoice(invoiceId, payload)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push(`/os/invoices/${result.id}`)
      router.refresh()
    })
  }

  return (
    <form className={styles.opsForm} onSubmit={onSubmit} aria-busy={pending}>
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Client & event</h2>
        <div className={styles.opsFields}>
          <label className={styles.fieldLabel} htmlFor="clientId">
            Client
            <select
              id="clientId"
              className={styles.fieldControl}
              value={clientId}
              required
              onChange={(e) => onClientChange(e.target.value)}
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fieldLabel} htmlFor="eventId">
            Related event
            <select
              id="eventId"
              className={styles.fieldControl}
              value={eventId}
              onChange={(e) => onEventChange(e.target.value)}
            >
              <option value="">None</option>
              {clientEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} · {event.dateLabel}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Billing details</h2>
        <div className={styles.opsFields}>
          <label className={styles.fieldLabel} htmlFor="billToName">
            Name
            <input
              id="billToName"
              className={styles.fieldControl}
              value={billToName}
              required
              onChange={(e) => setBillToName(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor="billToEmail">
            Email
            <input
              id="billToEmail"
              type="email"
              className={styles.fieldControl}
              value={billToEmail}
              required
              onChange={(e) => setBillToEmail(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor="billToPhone">
            Phone
            <input
              id="billToPhone"
              className={styles.fieldControl}
              value={billToPhone}
              onChange={(e) => setBillToPhone(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor="billToCompany">
            Company
            <input
              id="billToCompany"
              className={styles.fieldControl}
              value={billToCompany}
              onChange={(e) => setBillToCompany(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor="issueDate">
            Issue date
            <input
              id="issueDate"
              type="date"
              className={styles.fieldControl}
              value={issueDate}
              required
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor="dueDate">
            Due date
            <input
              id="dueDate"
              type="date"
              className={styles.fieldControl}
              value={dueDate}
              required
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor="paymentTerms">
            Payment terms
            <select
              id="paymentTerms"
              className={styles.fieldControl}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            >
              {PAYMENT_TERMS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {PAYMENT_TERMS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          {paymentTerms === 'custom' ? (
            <label className={styles.fieldLabel} htmlFor="paymentTermsCustom">
              Custom terms
              <input
                id="paymentTermsCustom"
                className={styles.fieldControl}
                value={paymentTermsCustom}
                onChange={(e) => setPaymentTermsCustom(e.target.value)}
              />
            </label>
          ) : null}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Line items</h2>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setLines((prev) => [...prev, newLine()])}
          >
            Add line
          </button>
        </div>
        <p className={styles.fieldHint}>
          Presets: {BILLING_PRESET_DESCRIPTIONS.join(' · ')}
        </p>
        <div className={styles.invoiceLines}>
          {lines.map((line, index) => (
            <div key={line.itemKey} className={styles.invoiceLineCard}>
              <div className={styles.opsFields}>
                <label className={styles.fieldLabel}>
                  Description
                  <input
                    className={styles.fieldControl}
                    list="billing-presets"
                    value={line.description}
                    required
                    onChange={(e) => updateLine(index, { description: e.target.value })}
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Billing type
                  <select
                    className={styles.fieldControl}
                    value={line.billingType}
                    onChange={(e) =>
                      updateLine(index, {
                        billingType: e.target.value as BillingTypeValue,
                      })
                    }
                  >
                    {BILLING_TYPE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {BILLING_TYPE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.fieldLabel}>
                  Quantity
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    className={styles.fieldControl}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, { quantity: Number(e.target.value) || 0 })
                    }
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Unit price (USD)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.fieldControl}
                    value={centsInput(line.unitPriceCents)}
                    onChange={(e) =>
                      updateLine(index, {
                        unitPriceCents: Math.round(Number(e.target.value || 0) * 100),
                      })
                    }
                  />
                </label>
              </div>
              <label className={styles.fieldLabel}>
                Detail
                <textarea
                  className={styles.fieldControl}
                  rows={2}
                  value={line.detail}
                  onChange={(e) => updateLine(index, { detail: e.target.value })}
                />
              </label>
              <div className={styles.invoiceLineActions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={line.isCredit}
                    onChange={(e) => updateLine(index, { isCredit: e.target.checked })}
                  />
                  Credit / client-supplied
                </label>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => moveLine(index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => moveLine(index, 1)}
                    disabled={index === lines.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() =>
                      setLines((prev) =>
                        prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <datalist id="billing-presets">
          {BILLING_PRESET_DESCRIPTIONS.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Adjustments</h2>
        <div className={styles.opsFields}>
          <label className={styles.fieldLabel}>
            Discount type
            <select
              className={styles.fieldControl}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="none">None</option>
              <option value="fixed">Fixed dollar</option>
              <option value="percent">Percentage</option>
            </select>
          </label>
          <label className={styles.fieldLabel}>
            Discount value
            <input
              type="number"
              min="0"
              step="0.01"
              className={styles.fieldControl}
              value={
                discountType === 'percent'
                  ? (discountValue / 100).toFixed(2)
                  : centsInput(discountValue)
              }
              onChange={(e) => {
                const n = Number(e.target.value || 0)
                setDiscountValue(
                  discountType === 'percent' ? Math.round(n * 100) : Math.round(n * 100),
                )
              }}
              disabled={discountType === 'none'}
            />
          </label>
          <label className={styles.fieldLabel}>
            Tax rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={styles.fieldControl}
              value={(taxRateBps / 100).toFixed(2)}
              onChange={(e) => setTaxRateBps(Math.round(Number(e.target.value || 0) * 100))}
            />
          </label>
          <label className={styles.fieldLabel}>
            Deposit required (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              className={styles.fieldControl}
              value={centsInput(depositRequiredCents)}
              onChange={(e) =>
                setDepositRequiredCents(Math.round(Number(e.target.value || 0) * 100))
              }
            />
          </label>
        </div>
        {totals ? (
          <dl className={styles.detailList}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatUsdFromCents(totals.subtotalCents)}</dd>
            </div>
            <div>
              <dt>Credits</dt>
              <dd>−{formatUsdFromCents(totals.creditCents)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>−{formatUsdFromCents(totals.discountCents)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatUsdFromCents(totals.taxCents)}</dd>
            </div>
            <div>
              <dt>Invoice total</dt>
              <dd>{formatUsdFromCents(totals.totalCents)}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Notes</h2>
        <label className={styles.fieldLabel}>
          Client memo (shown on invoice)
          <textarea
            className={styles.fieldControl}
            rows={3}
            value={clientMemo}
            onChange={(e) => setClientMemo(e.target.value)}
          />
        </label>
        <label className={styles.fieldLabel}>
          Internal notes (staff only)
          <textarea
            className={styles.fieldControl}
            rows={3}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
        </label>
      </section>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending
            ? 'Saving…'
            : mode === 'create'
              ? 'Save draft invoice'
              : 'Save invoice'}
        </button>
      </div>
      <div aria-live="polite">
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </form>
  )
}
