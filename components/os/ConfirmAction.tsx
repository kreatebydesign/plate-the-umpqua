'use client'

import styles from '@/app/(os)/os.module.css'

type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  pending?: boolean
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Inline mobile-safe confirmation (replaces window.confirm for OS actions).
 */
export default function ConfirmAction({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  pending = false,
  tone = 'default',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className={styles.confirmPanel} role="alertdialog" aria-modal="true" aria-labelledby="os-confirm-title">
      <p id="os-confirm-title" className={styles.confirmTitle}>
        {title}
      </p>
      <p className={styles.confirmBody}>{body}</p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          disabled={pending}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`${styles.button}${tone === 'danger' ? ` ${styles.buttonDanger}` : ''}`}
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? 'Working…' : confirmLabel}
        </button>
      </div>
    </div>
  )
}
