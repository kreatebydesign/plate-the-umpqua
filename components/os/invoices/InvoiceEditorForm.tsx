'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
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

type LineDraft = EditorLine & { unitPriceDollars: string }

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

function dollarsFromCents(cents: number): string {
  return (Number(cents || 0) / 100).toFixed(2)
}

function centsFromDollars(raw: string): number {
  const n = Number(String(raw || '').replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100)
}

function newLine(partial?: Partial<LineDraft>): LineDraft {
  const unitPriceDollars =
    partial?.unitPriceDollars ??
    (partial?.unitPriceCents != null ? dollarsFromCents(partial.unitPriceCents) : '')
  const unitPriceCents =
    partial?.unitPriceCents ?? (unitPriceDollars ? centsFromDollars(unitPriceDollars) : 0)
  return {
    itemKey: partial?.itemKey || `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: partial?.description ?? '',
    detail: partial?.detail ?? '',
    billingType: partial?.billingType ?? 'flat',
    quantity: partial?.quantity ?? 1,
    isCredit: partial?.isCredit ?? false,
    unitPriceCents,
    unitPriceDollars,
  }
}

function toEditorLines(lines: LineDraft[]): EditorLine[] {
  return lines.map((line) => ({
    itemKey: line.itemKey,
    description: line.description,
    detail: line.detail,
    billingType: line.billingType,
    quantity: line.quantity,
    isCredit: line.isCredit,
    unitPriceCents: centsFromDollars(line.unitPriceDollars || dollarsFromCents(line.unitPriceCents)),
  }))
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const clientRef = useRef<HTMLSelectElement>(null)
  const descriptionRefs = useRef<Array<HTMLInputElement | null>>([])
  const priceRefs = useRef<Array<HTMLInputElement | null>>([])
  const errorRef = useRef<HTMLParagraphElement>(null)

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
  const [lines, setLines] = useState<LineDraft[]>(
    initial?.lineItems?.length
      ? initial.lineItems.map((line) =>
          newLine({
            ...line,
            unitPriceDollars: dollarsFromCents(line.unitPriceCents),
          }),
        )
      : [newLine({ description: '', billingType: 'flat', quantity: 1, unitPriceDollars: '' })],
  )
  const [discountType, setDiscountType] = useState(initial?.discountType || 'none')
  const [discountValue, setDiscountValue] = useState(initial?.discountValue || 0)
  const [taxRateBps, setTaxRateBps] = useState(initial?.taxRateBps || 0)
  const [depositDollars, setDepositDollars] = useState(
    dollarsFromCents(initial?.depositRequiredCents || 0),
  )
  const [clientMemo, setClientMemo] = useState(initial?.clientMemo || '')
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes || '')

  const clientEvents = useMemo(
    () => events.filter((event) => !clientId || event.clientId === clientId),
    [events, clientId],
  )

  const editorLines = useMemo(() => toEditorLines(lines), [lines])

  const totals = useMemo(() => {
    try {
      return calculateInvoice({
        lines: editorLines,
        discountType: discountType as 'none' | 'fixed' | 'percent',
        discountValue,
        taxRateBps,
        amountPaidCents: 0,
      })
    } catch {
      return null
    }
  }, [editorLines, discountType, discountValue, taxRateBps])

  function onClientChange(nextId: string) {
    setClientId(nextId)
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.clientId
      return next
    })
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
      if (prev.length === 1 && !prev[0].description.trim()) {
        return [
          newLine({
            description: event.name,
            billingType: 'perEvent',
            quantity: 1,
            unitPriceDollars: prev[0].unitPriceDollars,
            unitPriceCents: centsFromDollars(prev[0].unitPriceDollars),
          }),
        ]
      }
      return prev
    })
  }

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[`line-${index}-description`]
      delete next[`line-${index}-price`]
      delete next.total
      return next
    })
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

  function validate(): { ok: true } | { ok: false; message: string; focus: () => void } {
    const nextErrors: Record<string, string> = {}
    if (!clientId) {
      nextErrors.clientId = 'Select a client.'
    }
    if (!billToName.trim() || !billToEmail.trim()) {
      nextErrors.billing = 'Billing name and email are required.'
    }

    lines.forEach((line, index) => {
      if (!line.description.trim()) {
        nextErrors[`line-${index}-description`] = 'Enter a description.'
      }
      const cents = centsFromDollars(line.unitPriceDollars)
      if (!line.isCredit && cents <= 0) {
        nextErrors[`line-${index}-price`] = 'Enter a unit price in dollars (for example 1.00).'
      }
    })

    const prepared = toEditorLines(lines)
    let computedTotal = 0
    try {
      computedTotal = calculateInvoice({
        lines: prepared,
        discountType: discountType as 'none' | 'fixed' | 'percent',
        discountValue,
        taxRateBps,
        amountPaidCents: 0,
      }).totalCents
    } catch {
      nextErrors.total = 'Line items are invalid.'
    }
    if (!nextErrors.total && computedTotal <= 0) {
      nextErrors.total = 'Invoice total must be greater than $0.00.'
    }

    setFieldErrors(nextErrors)
    const keys = Object.keys(nextErrors)
    if (keys.length === 0) return { ok: true }

    const message = nextErrors[keys[0]]
    return {
      ok: false,
      message,
      focus: () => {
        if (nextErrors.clientId) {
          clientRef.current?.focus()
          clientRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return
        }
        for (let i = 0; i < lines.length; i++) {
          if (nextErrors[`line-${i}-description`]) {
            descriptionRefs.current[i]?.focus()
            descriptionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
          }
          if (nextErrors[`line-${i}-price`]) {
            priceRefs.current[i]?.focus()
            priceRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
          }
        }
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      },
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    setError(null)

    const check = validate()
    if (!check.ok) {
      setError(check.message)
      // Defer focus until error text paints
      requestAnimationFrame(() => check.focus())
      return
    }

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
      lineItems: toEditorLines(lines),
      discountType,
      discountValue,
      taxRateBps,
      depositRequiredCents: centsFromDollars(depositDollars),
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
        requestAnimationFrame(() => {
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
        return
      }
      router.push(`/os/invoices/${result.id}`)
      router.refresh()
    })
  }

  const selectClass = `${styles.fieldControl} ${styles.selectControl}`

  return (
    <form className={styles.opsForm} onSubmit={onSubmit} aria-busy={pending} noValidate>
      <p className={styles.workflowBanner}>
        <strong>Step 1 — Save draft only.</strong> This does not email the client, create a
        Square invoice, or charge a card. After saving, you can create a Square payment link,
        then send or copy it separately.
      </p>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Client & event</h2>
        <div className={styles.opsFields}>
          <label className={styles.fieldLabel} htmlFor="clientId">
            Client
            <select
              id="clientId"
              ref={clientRef}
              className={`${selectClass}${fieldErrors.clientId ? ` ${styles.fieldInvalid}` : ''}`}
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
            {fieldErrors.clientId ? (
              <span className={styles.fieldErrorText}>{fieldErrors.clientId}</span>
            ) : null}
          </label>
          <label className={styles.fieldLabel} htmlFor="eventId">
            Related event
            <select
              id="eventId"
              className={selectClass}
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
        {clients.length === 0 ? (
          <p className={styles.fieldHint}>
            No clients yet.{' '}
            <Link href="/os/clients" className={styles.inlineLink}>
              Add a client in Plate OS
            </Link>{' '}
            first, then return here.
          </p>
        ) : null}
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
              className={selectClass}
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
        {fieldErrors.billing ? (
          <p className={styles.fieldErrorText}>{fieldErrors.billing}</p>
        ) : null}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Line items</h2>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setLines((prev) => [...prev, newLine({ unitPriceDollars: '0.00' })])}
          >
            Add line
          </button>
        </div>
        <p className={styles.fieldHint}>
          Enter prices in dollars (example: 1.00). Presets:{' '}
          {BILLING_PRESET_DESCRIPTIONS.join(' · ')}
        </p>
        <div className={styles.invoiceLines}>
          {lines.map((line, index) => (
            <div key={line.itemKey} className={styles.invoiceLineCard}>
              <div className={styles.opsFields}>
                <label className={styles.fieldLabel}>
                  Description
                  <input
                    ref={(el) => {
                      descriptionRefs.current[index] = el
                    }}
                    className={`${styles.fieldControl}${
                      fieldErrors[`line-${index}-description`] ? ` ${styles.fieldInvalid}` : ''
                    }`}
                    list="billing-presets"
                    value={line.description}
                    required
                    onChange={(e) => updateLine(index, { description: e.target.value })}
                  />
                  {fieldErrors[`line-${index}-description`] ? (
                    <span className={styles.fieldErrorText}>
                      {fieldErrors[`line-${index}-description`]}
                    </span>
                  ) : null}
                </label>
                <label className={styles.fieldLabel}>
                  Billing type
                  <select
                    className={selectClass}
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
                    inputMode="decimal"
                    className={styles.fieldControl}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, { quantity: Number(e.target.value) || 0 })
                    }
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Unit price ($)
                  <input
                    ref={(el) => {
                      priceRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="1.00"
                    className={`${styles.fieldControl}${
                      fieldErrors[`line-${index}-price`] ? ` ${styles.fieldInvalid}` : ''
                    }`}
                    value={line.unitPriceDollars}
                    onChange={(e) =>
                      updateLine(index, {
                        unitPriceDollars: e.target.value,
                        unitPriceCents: centsFromDollars(e.target.value),
                      })
                    }
                    onBlur={() =>
                      updateLine(index, {
                        unitPriceDollars: dollarsFromCents(
                          centsFromDollars(line.unitPriceDollars),
                        ),
                        unitPriceCents: centsFromDollars(line.unitPriceDollars),
                      })
                    }
                  />
                  {fieldErrors[`line-${index}-price`] ? (
                    <span className={styles.fieldErrorText}>
                      {fieldErrors[`line-${index}-price`]}
                    </span>
                  ) : null}
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
              className={selectClass}
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
              inputMode="decimal"
              className={styles.fieldControl}
              value={
                discountType === 'percent'
                  ? (discountValue / 100).toFixed(2)
                  : dollarsFromCents(discountValue)
              }
              onChange={(e) => {
                const n = Number(e.target.value || 0)
                setDiscountValue(Math.round(n * 100))
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
              inputMode="decimal"
              className={styles.fieldControl}
              value={(taxRateBps / 100).toFixed(2)}
              onChange={(e) => setTaxRateBps(Math.round(Number(e.target.value || 0) * 100))}
            />
          </label>
          <label className={styles.fieldLabel}>
            Deposit required ($)
            <input
              type="text"
              inputMode="decimal"
              className={styles.fieldControl}
              value={depositDollars}
              onChange={(e) => setDepositDollars(e.target.value)}
              onBlur={() => setDepositDollars(dollarsFromCents(centsFromDollars(depositDollars)))}
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
        {fieldErrors.total ? (
          <p className={styles.fieldErrorText}>{fieldErrors.total}</p>
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

      <div className={styles.stickyFormActions} aria-live="polite">
        <button type="submit" className={styles.button} disabled={pending}>
          {pending
            ? 'Saving draft…'
            : mode === 'create'
              ? 'Save draft'
              : 'Save draft changes'}
        </button>
        <p className={styles.fieldHint}>
          Save draft only — no email, no Square publish, no charge.
        </p>
        {error ? (
          <p ref={errorRef} className={styles.sectionError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
