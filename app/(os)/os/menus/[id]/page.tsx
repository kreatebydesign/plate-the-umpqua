import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../os.module.css'
import {
  MenuReviewActions,
  MenuVersionActions,
} from '@/components/os/CulinaryActions'
import MenuPresentation from '@/components/os/MenuPresentation'
import MenuWorkflowGuidance from '@/components/os/MenuWorkflowGuidance'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getMenuDetail } from '@/lib/os/menus/menuQueries'
import { buildPublicMenuReviewPayload } from '@/lib/os/menus/publicReviewPayload'

export const metadata: Metadata = {
  title: 'Menu',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function MenuDetailPage({ params }: { params: Params }) {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  const { id } = await params
  const menu = await getMenuDetail(user, id)
  if (!menu) notFound()

  const presentation = buildPublicMenuReviewPayload({
    occasionTitle: menu.occasionTitle,
    serviceDate: menu.serviceDate,
    guestCount: menu.guestCount,
    introductoryMessage: menu.introductoryMessage,
    pricingPresentation: menu.pricingPresentation,
    displayInvestment: menu.displayInvestment,
    version: menu.version,
    status: menu.status,
    sections: menu.sections.map((section) => ({
      sectionName: section.sectionName,
      items: section.items.map((item) => ({
        clientTitle: item.clientTitle,
        clientDescription: item.clientDescription,
        showDietary: item.showDietary,
        dietaryDisplay: item.dietaryDisplay,
        allergenDisplay: item.allergenDisplay,
      })),
    })),
  })

  return (
    <div className={styles.detailLayout}>
      <section className={styles.hero} aria-label="Menu detail">
        <p className={styles.heroDate}>Client presentations</p>
        <h2 className={styles.heroGreeting}>{menu.internalName}</h2>
        <p className={styles.heroLine}>
          {menu.occasionTitle} · {menu.statusLabel} · Version {menu.version}
        </p>
        <div className={styles.actions}>
          <Link href="/os/menus" className={`${styles.button} ${styles.buttonQuiet}`}>
            All menus
          </Link>
          {menu.canWrite ? (
            <Link href={`/os/menus/${menu.id}/edit`} className={styles.button}>
              Edit menu
            </Link>
          ) : null}
          <Link
            href={`/os/menus/${menu.id}/preview`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Client preview
          </Link>
          {menu.canManageInAdmin ? (
            <Link
              href={`/admin/collections/menus/${menu.id}`}
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <MenuWorkflowGuidance status={menu.status} />

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Relationships</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Client</dt>
              <dd>
                {menu.clientHref && menu.clientName ? (
                  <Link href={menu.clientHref}>{menu.clientName}</Link>
                ) : (
                  menu.clientName || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Inquiry</dt>
              <dd>
                {menu.inquiryHref && menu.inquiryTitle ? (
                  <Link href={menu.inquiryHref}>{menu.inquiryTitle}</Link>
                ) : (
                  menu.inquiryTitle || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>
                {menu.eventHref && menu.eventName ? (
                  <Link href={menu.eventHref}>{menu.eventName}</Link>
                ) : (
                  menu.eventName || '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Service date</dt>
              <dd>{menu.serviceDateLabel}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{menu.guestCount ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Review status</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Status</dt>
              <dd>{menu.statusLabel}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{menu.version}</dd>
            </div>
            <div>
              <dt>Sent</dt>
              <dd>{menu.sentAt || '—'}</dd>
            </div>
            <div>
              <dt>Approved</dt>
              <dd>{menu.approvedAt || '—'}</dd>
            </div>
            <div>
              <dt>Review link</dt>
              <dd>
                {menu.reviewRevoked
                  ? 'Revoked'
                  : menu.hasActiveReviewLink
                    ? `Active · expires ${menu.reviewExpiresLabel}`
                    : 'None active'}
              </dd>
            </div>
            <div>
              <dt>Revision snapshots</dt>
              <dd>{menu.revisionCount}</dd>
            </div>
          </dl>
        </section>
      </div>

      {menu.internalNotes ? (
        <section className={styles.panelSensitive}>
          <h2 className={styles.panelTitle}>
            Internal notes <span className={styles.internalBadge}>Internal</span>
          </h2>
          <p className={styles.visionCopy}>{menu.internalNotes}</p>
        </section>
      ) : null}

      {menu.canWrite ? (
        <section className={styles.panel} aria-label="Send for review">
          <h2 className={styles.panelTitle}>Client review link</h2>
          <MenuReviewActions
            menuId={menu.id}
            clientEmail={menu.clientEmail}
            hasActiveReviewLink={menu.hasActiveReviewLink}
          />
        </section>
      ) : null}

      {menu.canWrite ? (
        <section className={styles.panel} aria-label="Versioning">
          <h2 className={styles.panelTitle}>Versioning</h2>
          <MenuVersionActions menuId={menu.id} />
        </section>
      ) : null}

      {menu.reviews.length > 0 ? (
        <section className={styles.panel} aria-label="Review history">
          <h2 className={styles.panelTitle}>Client responses</h2>
          <ul className={styles.list}>
            {menu.reviews.map((review, index) => (
              <li key={`${review.submittedAt}-${index}`} className={styles.listMeta}>
                <strong>
                  {review.action === 'approve' ? 'Approved' : 'Revision requested'}
                </strong>
                {review.menuVersion ? ` · v${review.menuVersion}` : ''}
                {review.submittedAt ? ` · ${review.submittedAt}` : ''}
                {review.comment ? (
                  <p className={styles.visionCopy}>{review.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.panel} aria-label="Client presentation preview">
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Client presentation</h2>
        </div>
        <MenuPresentation menu={presentation} />
      </section>
    </div>
  )
}
