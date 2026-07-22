import type { PublicMenuReviewPayload } from '@/lib/os/menus/publicReviewPayload'
import styles from '@/app/(os)/os.module.css'

type Props = {
  menu: PublicMenuReviewPayload
  compactMeta?: boolean
}

export default function MenuPresentation({ menu, compactMeta = false }: Props) {
  return (
    <article className={styles.previewShell} aria-label="Menu presentation">
      <header>
        <p className={styles.previewBrand}>{menu.brandName}</p>
        <h2 className={styles.previewTitle}>{menu.occasionTitle}</h2>
        {!compactMeta ? (
          <p className={styles.previewMeta}>
            {[
              menu.serviceDateLabel,
              menu.guestCount != null ? `${menu.guestCount} guests` : null,
              `Version ${menu.version}`,
            ]
              .filter(Boolean)
              .join(' · ') || 'Private dining'}
          </p>
        ) : null}
        {menu.introductoryMessage ? (
          <p className={styles.previewIntro}>{menu.introductoryMessage}</p>
        ) : null}
      </header>

      {menu.sections.map((section) => (
        <section key={section.name} className={styles.previewSection}>
          <h3 className={styles.previewSectionName}>{section.name}</h3>
          {section.items.map((item) => (
            <div key={`${section.name}-${item.title}`} className={styles.previewItem}>
              <p className={styles.previewItemTitle}>{item.title}</p>
              {item.description ? (
                <p className={styles.previewItemDesc}>{item.description}</p>
              ) : null}
              {item.dietaryLabels.length || item.allergenLabels.length ? (
                <p className={styles.previewTags}>
                  {[...item.dietaryLabels, ...item.allergenLabels].join(' · ')}
                </p>
              ) : null}
            </div>
          ))}
        </section>
      ))}

      {menu.pricingPresentation || menu.displayInvestment ? (
        <section className={styles.previewSection} aria-label="Investment">
          <h3 className={styles.previewSectionName}>Investment</h3>
          {menu.displayInvestment ? (
            <p className={styles.previewItemTitle}>{menu.displayInvestment}</p>
          ) : null}
          {menu.pricingPresentation ? (
            <p className={styles.previewItemDesc}>{menu.pricingPresentation}</p>
          ) : null}
        </section>
      ) : null}
    </article>
  )
}
