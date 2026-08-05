import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import MobileQaFixtures from '@/components/os/MobileQaFixtures'

export const metadata: Metadata = {
  title: 'Mobile QA',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const ROUTES = [
  { href: '/os', label: 'Dashboard' },
  { href: '/os/clients', label: 'Clients' },
  { href: '/os/clients/new', label: 'Client create' },
  { href: '/os/events', label: 'Events' },
  { href: '/os/inquiries', label: 'Inquiries' },
  { href: '/os/recipes', label: 'Recipes' },
  { href: '/os/recipes/new', label: 'Recipe create' },
  { href: '/os/menus', label: 'Menus' },
  { href: '/os/menus/new', label: 'Menu create' },
  { href: '/os/invoices', label: 'Invoices' },
  { href: '/os/invoices/new', label: 'Invoice create' },
  { href: '/os/settings/square', label: 'Square settings' },
]

/**
 * Director-only visual QA surface for mobile widths.
 * Fixture UI only — no invoice create, send, Square, or charge.
 */
export default async function MobileQaPage() {
  const user = await requirePlateOperator({ returnTo: '/os/mobile-qa' })
  if (!isDirector(asPlateUser(user))) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Mobile QA is available to directors only.</p>
      </div>
    )
  }

  return (
    <div>
      <section className={`${styles.hero} ${styles.heroCompact}`} aria-label="Mobile QA">
        <p className={styles.heroDate}>Director checklist</p>
        <h2 className={styles.heroGreeting}>Mobile QA</h2>
        <p className={styles.heroLine}>
          Open each route at 320 / 375 / 390 / 430px. Fixture controls below use
          fake data only — do not create, email, sync, or charge live invoices
          from this checklist.
        </p>
      </section>

      <section className={styles.panel} aria-label="Route checklist">
        <h2 className={styles.panelTitle}>Routes to verify</h2>
        <ul className={styles.list}>
          {ROUTES.map((route) => (
            <li key={route.href} className={styles.listItem}>
              <Link href={route.href} className={styles.listLink}>
                <span className={styles.listTitle}>{route.label}</span>
                <span className={styles.listMeta}>{route.href}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-label="Control fixtures">
        <h2 className={styles.panelTitle}>Control fixtures (fake data)</h2>
        <p className={styles.fieldHint}>
          Check overflow, select chevrons, 16px inputs, 44px targets, sticky save,
          and confirm panels on a narrow phone width.
        </p>
        <MobileQaFixtures />
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>List card sample</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <div className={styles.inquiryTop}>
              <p className={styles.listTitle}>Long status label sample for wrap check</p>
              <span className={styles.statusChip}>Awaiting decision</span>
            </div>
            <p className={styles.listMeta}>
              Sample Client LLC · Private dinner · Jul 13 · no financial amounts
            </p>
          </li>
        </ul>
      </section>
    </div>
  )
}
