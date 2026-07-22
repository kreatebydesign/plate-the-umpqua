import type { Metadata } from 'next'
import styles from '../../menu-review.module.css'
import { lookupMenuReviewByToken } from '@/lib/os/menus/publicMenuReview'
import MenuReviewForm from './MenuReviewForm'

export const metadata: Metadata = {
  title: 'Private menu review',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ token: string }>

function StateMessage({
  title,
  copy,
}: {
  title: string
  copy: string
}) {
  return (
    <div className={styles.stateCard} role="status">
      <h1 className={styles.stateTitle}>{title}</h1>
      <p className={styles.stateCopy}>{copy}</p>
    </div>
  )
}

export default async function MenuReviewPage({ params }: { params: Params }) {
  const { token } = await params
  const result = await lookupMenuReviewByToken(token)

  if (result.state !== 'valid' || !result.payload) {
    const copyByState: Record<string, { title: string; copy: string }> = {
      invalid: {
        title: 'This link is not available',
        copy: 'The menu review link is invalid or no longer available. Please contact Plate The Umpqua for a new invitation.',
      },
      expired: {
        title: 'This link has expired',
        copy: 'This private menu review link has expired. Please contact Plate The Umpqua for a refreshed invitation.',
      },
      revoked: {
        title: 'This link is no longer active',
        copy: 'This private menu review link has been revoked. Please contact Plate The Umpqua if you still need access.',
      },
      unavailable: {
        title: 'This menu is unavailable',
        copy: 'This menu is no longer available for review. Please contact Plate The Umpqua for assistance.',
      },
    }
    const message = copyByState[result.state] || copyByState.invalid
    return (
      <main className={styles.page}>
        <p className={styles.brand}>Plate The Umpqua</p>
        <StateMessage title={message.title} copy={message.copy} />
        <p className={styles.footer}>Private hospitality · Roseburg & the Umpqua Valley</p>
      </main>
    )
  }

  const menu = result.payload
  const alreadyApproved = menu.status === 'approved'

  return (
    <main className={styles.page}>
      <p className={styles.brand}>{menu.brandName}</p>

      <article className={styles.shell} aria-label="Private dining menu">
        <header>
          <h1 className={styles.title}>{menu.occasionTitle}</h1>
          <p className={styles.meta}>
            {[
              menu.serviceDateLabel,
              menu.guestCount != null ? `${menu.guestCount} guests` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Private dining'}
          </p>
          {menu.introductoryMessage ? (
            <p className={styles.intro}>{menu.introductoryMessage}</p>
          ) : null}
        </header>

        {menu.sections.map((section) => (
          <section key={section.name} className={styles.section}>
            <h2 className={styles.sectionName}>{section.name}</h2>
            {section.items.map((item) => (
              <div key={`${section.name}-${item.title}`}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                {item.description ? (
                  <p className={styles.itemDesc}>{item.description}</p>
                ) : null}
                {item.dietaryLabels.length || item.allergenLabels.length ? (
                  <p className={styles.tags}>
                    {[...item.dietaryLabels, ...item.allergenLabels].join(' · ')}
                  </p>
                ) : null}
              </div>
            ))}
          </section>
        ))}

        {menu.pricingPresentation || menu.displayInvestment ? (
          <section className={styles.section} aria-label="Investment">
            <h2 className={styles.sectionName}>Investment</h2>
            {menu.displayInvestment ? (
              <p className={styles.itemTitle}>{menu.displayInvestment}</p>
            ) : null}
            {menu.pricingPresentation ? (
              <p className={styles.itemDesc}>{menu.pricingPresentation}</p>
            ) : null}
          </section>
        ) : null}
      </article>

      {menu.status === 'revisionRequested' && !alreadyApproved ? (
        <div className={styles.stateCard} role="status" style={{ marginTop: '1.25rem' }}>
          <h2 className={styles.stateTitle}>Revision requested</h2>
          <p className={styles.stateCopy}>
            Your earlier revision request is on file. You may submit an updated
            response below if needed.
          </p>
        </div>
      ) : null}

      <div style={{ marginTop: '1.25rem' }}>
        <MenuReviewForm token={token} alreadyApproved={alreadyApproved} />
      </div>

      <p className={styles.footer}>Private hospitality · Roseburg & the Umpqua Valley</p>
    </main>
  )
}
