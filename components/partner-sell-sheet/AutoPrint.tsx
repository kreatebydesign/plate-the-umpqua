'use client'

import { useEffect, useRef } from 'react'
import styles from './AutoPrint.module.css'

type Props = {
  /** When true, auto-trigger browser print once and show a screen-only fallback. */
  enabled: boolean
}

/** Prevents duplicate window.print() under React Strict Mode remounts in the same tab. */
const printedKeys = new Set<string>()

/**
 * Auto-print helper for print-intent sell-sheet routes (`?print=1`).
 * Must only mount / enable when the user explicitly chose Print / Save PDF.
 */
export default function AutoPrint({ enabled }: Props) {
  const started = useRef(false)

  useEffect(() => {
    if (!enabled || started.current) return
    started.current = true

    const key =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : 'print'
    if (printedKeys.has(key)) return
    printedKeys.add(key)

    let cancelled = false

    async function prepareAndPrint() {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready
        }
        await Promise.all(
          Array.from(document.images).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener('load', () => resolve(), { once: true })
                  img.addEventListener('error', () => resolve(), { once: true })
                }),
          ),
        )
      } catch {
        // Proceed even if readiness checks fail.
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 350)
      })
      if (cancelled) return
      window.print()
    }

    void prepareAndPrint()

    return () => {
      cancelled = true
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className={styles.bar} role="region" aria-label="Print controls">
      <p className={styles.hint}>
        If the print dialog did not open, use the button below. Keep scale at 100% /
        Actual Size.
      </p>
      <button
        type="button"
        className={styles.button}
        onClick={() => window.print()}
      >
        Print / Save PDF
      </button>
    </div>
  )
}
