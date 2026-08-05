import type { Metadata } from 'next'
import styles from '../../os.module.css'
import MobileQaFixtures from '@/components/os/MobileQaFixtures'

export const metadata: Metadata = {
  title: 'Mobile OS fixtures',
  robots: { index: false, follow: false },
}

/**
 * Public visual fixture (no auth). Fake data only — no live financial actions.
 * Uses OS fonts/CSS without SiteShell or authenticated OsShell.
 */
export default function MobileOsFixturesPage() {
  return (
    <div className={styles.content} data-os-fixture="true">
      <section className={`${styles.hero} ${styles.heroCompact}`}>
        <p className={styles.heroDate}>Design fixture</p>
        <h1 className={styles.heroGreeting}>Plate OS mobile controls</h1>
        <p className={styles.heroLine}>
          Visual QA surface for 320–430px. Fake data only — not a live workspace
          and not linked from public navigation.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.button}>
            Primary 44px target
          </button>
          <button type="button" className={`${styles.button} ${styles.buttonQuiet}`}>
            Secondary action
          </button>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Nav labels (long copy)</h2>
        <nav className={styles.nav} aria-label="Sample navigation">
          {[
            'Today at Plate The Umpqua',
            'Inquiries',
            'Events',
            'Clients',
            'Invoices',
            'Recipes',
            'Menus',
            'Square',
          ].map((label) => (
            <span key={label} className={styles.navLink}>
              {label}
            </span>
          ))}
        </nav>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Control fixtures</h2>
        <MobileQaFixtures />
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>List cards</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <div className={styles.inquiryTop}>
              <p className={styles.listTitle}>
                Sample Client LLC — estate dinner follow-up
              </p>
              <span className={styles.statusChip}>Awaiting decision</span>
            </div>
            <p className={styles.listMeta}>
              Private client · Preferred · Jul 13 · fixture only
            </p>
          </li>
          <li className={styles.listItem}>
            <div className={styles.inquiryTop}>
              <p className={styles.listTitle}>Invoice draft PTU-FIXTURE-000</p>
              <span className={`${styles.statusChip} ${styles.statusChipAlert}`}>
                Draft
              </span>
            </div>
            <p className={styles.listMeta}>No live financial record</p>
          </li>
        </ul>
      </section>

      <section className={styles.metrics} aria-label="Metric cards">
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Open inquiries</p>
          <p className={styles.metricValue}>12</p>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Upcoming events</p>
          <p className={styles.metricValue}>4</p>
        </div>
      </section>
    </div>
  )
}
