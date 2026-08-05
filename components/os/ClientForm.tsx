'use client'

import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition } from 'react'
import styles from '@/app/(os)/os.module.css'
import { createClient, updateClient } from '@/lib/os/clients/mutateClient'
import {
  CLIENT_TYPE_LABELS,
  CLIENT_TYPE_VALUES,
  CLIENT_VIP_LABELS,
  CLIENT_VIP_VALUES,
} from '@/lib/os/clients/clientConstants'

type Initial = {
  fullName: string
  email: string
  phone: string
  instagram: string
  clientType: string
  vipStatus: string
}

type Props = {
  mode: 'create' | 'edit'
  clientId?: string
  initial?: Initial
}

export default function ClientForm({ mode, clientId, initial }: Props) {
  const router = useRouter()
  const formId = useId()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLParagraphElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)

  const [fullName, setFullName] = useState(initial?.fullName || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [instagram, setInstagram] = useState(initial?.instagram || '')
  const [clientType, setClientType] = useState(initial?.clientType || 'private')
  const [vipStatus, setVipStatus] = useState(initial?.vipStatus || 'standard')

  function focusFirstInvalid() {
    if (!fullName.trim()) {
      nameRef.current?.focus()
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!email.trim()) {
      emailRef.current?.focus()
      emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    setMessage(null)
    setError(null)

    if (!fullName.trim() || !email.trim()) {
      setError('Name and email are required.')
      queueMicrotask(focusFirstInvalid)
      return
    }

    const payload = {
      fullName,
      email,
      phone,
      instagram,
      clientType,
      vipStatus,
    }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createClient(payload)
          : await updateClient(clientId || '', payload)

      if (!result.ok) {
        setError(result.message)
        queueMicrotask(focusFirstInvalid)
        return
      }

      setMessage(mode === 'create' ? 'Client saved.' : 'Client updated.')
      router.push(`/os/clients/${result.id}`)
      router.refresh()
    })
  }

  return (
    <form className={styles.opsForm} onSubmit={onSubmit} noValidate>
      <p className={styles.workflowBanner}>
        <strong>Client contact</strong>
        <span className={styles.workflowNext}>
          Private notes and advanced fields stay in Admin. This form is for phone-friendly
          create and edit.
        </span>
      </p>

      <label className={styles.fieldLabel} htmlFor={`${formId}-name`}>
        Full name
        <input
          ref={nameRef}
          id={`${formId}-name`}
          className={styles.fieldControl}
          value={fullName}
          autoComplete="name"
          required
          disabled={pending}
          onChange={(e) => setFullName(e.target.value)}
        />
      </label>

      <label className={styles.fieldLabel} htmlFor={`${formId}-email`}>
        Email
        <input
          ref={emailRef}
          id={`${formId}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          className={styles.fieldControl}
          value={email}
          required
          disabled={pending}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className={styles.fieldLabel} htmlFor={`${formId}-phone`}>
        Phone
        <input
          id={`${formId}-phone`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={styles.fieldControl}
          value={phone}
          disabled={pending}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <label className={styles.fieldLabel} htmlFor={`${formId}-instagram`}>
        Instagram
        <input
          id={`${formId}-instagram`}
          className={styles.fieldControl}
          value={instagram}
          disabled={pending}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@handle"
        />
      </label>

      <label className={styles.fieldLabel} htmlFor={`${formId}-type`}>
        Client type
        <select
          id={`${formId}-type`}
          className={`${styles.fieldControl} ${styles.selectControl}`}
          value={clientType}
          disabled={pending}
          onChange={(e) => setClientType(e.target.value)}
        >
          {CLIENT_TYPE_VALUES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor={`${formId}-tier`}>
        Client tier
        <select
          id={`${formId}-tier`}
          className={`${styles.fieldControl} ${styles.selectControl}`}
          value={vipStatus}
          disabled={pending}
          onChange={(e) => setVipStatus(e.target.value)}
        >
          {CLIENT_VIP_VALUES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_VIP_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.stickyFormActions} aria-live="polite">
        <button type="submit" className={styles.button} disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Save client' : 'Save changes'}
        </button>
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? (
          <p ref={errorRef} className={styles.sectionError}>
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
