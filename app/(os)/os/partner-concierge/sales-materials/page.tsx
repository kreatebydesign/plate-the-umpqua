import type { Metadata } from 'next'
import SalesMaterialCard from '@/components/os/partner-concierge/SalesMaterialCard'
import styles from '../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { PARTNER_CONCIERGE_SALES_MATERIALS } from '@/lib/os/partnerConciergeSalesMaterials'

export const metadata: Metadata = {
  title: 'Partner Concierge Sales Materials',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const SEND_INSTRUCTIONS = [
  'Print / Save PDF opens the print-ready sell sheet and launches your browser print dialog. Choose Save as PDF or your printer and keep scale at 100% / Actual Size.',
  'Send the PDF along with the corresponding Partner Concierge landing-page link.',
] as const

export default async function PartnerConciergeSalesMaterialsPage() {
  await requirePlateOperator({ returnTo: '/os/partner-concierge/sales-materials' })

  return (
    <div>
      <section className={styles.panel} aria-label="Partner Concierge sales materials">
        <h2 className={styles.panelTitle}>Sales Materials</h2>
        <p className={styles.fieldHint}>
          Professional outreach materials for the Plate The Umpqua Partner Concierge program.
        </p>
      </section>

      <section className={styles.materialGrid} aria-label="Industry sell sheets">
        {PARTNER_CONCIERGE_SALES_MATERIALS.map((material) => (
          <SalesMaterialCard key={material.slug} material={material} />
        ))}
      </section>

      <section className={styles.panel} aria-label="How to send a sell sheet">
        <h2 className={styles.panelTitle}>How to Send a Sell Sheet</h2>
        <ol className={styles.instructionList}>
          {SEND_INSTRUCTIONS.map((step, index) => (
            <li key={step} className={styles.instructionItem}>
              <span className={styles.instructionStep}>{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
