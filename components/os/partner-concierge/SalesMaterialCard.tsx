'use client'

import { useState, useTransition } from 'react'
import type { PartnerConciergeSalesMaterial } from '@/lib/os/partnerConciergeSalesMaterials'
import styles from '@/app/(os)/os.module.css'

type Props = {
  material: PartnerConciergeSalesMaterial
}

export default function SalesMaterialCard({ material }: Props) {
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; message: string } | null>(
    null,
  )
  const [isPending, startTransition] = useTransition()

  function handleCopyLandingPage() {
    startTransition(async () => {
      setFeedback(null)
      try {
        await navigator.clipboard.writeText(material.landingPageUrl)
        setFeedback({ type: 'ok', message: 'Landing page link copied.' })
      } catch {
        setFeedback({
          type: 'error',
          message: 'Could not copy automatically. Copy the link below manually.',
        })
      }
    })
  }

  return (
    <article className={styles.materialCard} aria-label={`${material.industryLabel} sell sheet`}>
      <div className={styles.materialCardHeader}>
        <p className={styles.materialIndustry}>{material.industryLabel}</p>
        <h2 className={styles.materialProgram}>{material.programLabel}</h2>
      </div>

      <div className={styles.actions}>
        <a
          href={material.sellSheetPath}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
        >
          Preview Sell Sheet
        </a>
        <a
          href={`${material.sellSheetPath}?print=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.buttonQuiet}`}
          title="Opens the print-ready sell sheet and launches your browser print dialog. Choose Save as PDF or your printer at 100% / Actual Size."
        >
          Print / Save PDF
        </a>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          onClick={handleCopyLandingPage}
          disabled={isPending}
        >
          Copy Landing Page Link
        </button>
      </div>

      {feedback ? (
        <p
          role="alert"
          className={feedback.type === 'ok' ? styles.formSuccess : styles.sectionError}
        >
          {feedback.message}
        </p>
      ) : null}

      <p className={styles.materialUrl}>{material.landingPageUrl}</p>
    </article>
  )
}
