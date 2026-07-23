import type { PublicMenuReviewPayload } from '@/lib/os/menus/publicReviewPayload'
import {
  MENU_PRINT_BRAND_FOOTER,
  MENU_PRINT_EMAIL,
  MENU_PRINT_WEBSITE,
  menuPrintIsEmpty,
  type MenuPrintStyle,
} from '@/lib/os/menus/menuPrintPresentation'
import styles from './menu-print.module.css'

type Props = {
  menu: PublicMenuReviewPayload
  style: MenuPrintStyle
  showInvestment: boolean
}

function styleClass(style: MenuPrintStyle): string {
  if (style === 'event') return styles.styleEvent
  if (style === 'minimal') return styles.styleMinimal
  return styles.styleClassic
}

export default function MenuPrintDocument({
  menu,
  style,
  showInvestment,
}: Props) {
  const empty = menuPrintIsEmpty(menu)
  const investmentVisible =
    showInvestment &&
    Boolean(menu.displayInvestment || menu.pricingPresentation)

  const metaParts: string[] = []
  if (menu.serviceDateLabel) metaParts.push(menu.serviceDateLabel)
  if (menu.guestCount != null) {
    metaParts.push(
      `${menu.guestCount} ${menu.guestCount === 1 ? 'guest' : 'guests'}`,
    )
  }

  return (
    <article
      className={`${styles.doc} ${styleClass(style)}`}
      aria-label={`${menu.brandName} menu`}
    >
      <div className={styles.docBody}>
        <header className={styles.brandBlock}>
          <p className={styles.wordmark}>Plate The Umpqua</p>
          <hr className={styles.brandRule} aria-hidden="true" />
        </header>

        <div className={styles.masthead}>
          <h1 className={styles.title}>{menu.occasionTitle}</h1>
          {style === 'event' ? (
            <p className={styles.meta}>
              {menu.serviceDateLabel ? (
                <span className={`${styles.metaLine} ${styles.metaStrong}`}>
                  {menu.serviceDateLabel}
                </span>
              ) : null}
              {menu.guestCount != null ? (
                <span className={styles.metaLine}>
                  {menu.guestCount}{' '}
                  {menu.guestCount === 1 ? 'guest' : 'guests'}
                </span>
              ) : null}
              {!menu.serviceDateLabel && menu.guestCount == null ? (
                <span className={styles.metaLine}>Private dining</span>
              ) : null}
            </p>
          ) : metaParts.length > 0 ? (
            <p className={styles.meta}>{metaParts.join(' · ')}</p>
          ) : null}
          {menu.introductoryMessage ? (
            <p className={styles.intro}>{menu.introductoryMessage}</p>
          ) : null}
        </div>

        {empty ? (
          <p className={styles.emptyState}>
            This menu does not yet have client-visible courses. Add sections and
            dishes in Menu Studio, save, then return to print.
          </p>
        ) : (
          <div className={styles.courses}>
            {menu.sections.map((section, sectionIndex) => (
              <section
                key={`section-${sectionIndex}-${section.name}`}
                className={styles.section}
                aria-labelledby={`print-section-${sectionIndex}`}
              >
                <h2
                  id={`print-section-${sectionIndex}`}
                  className={styles.sectionName}
                >
                  {section.name}
                </h2>
                <hr className={styles.sectionRule} aria-hidden="true" />
                {section.items.map((item, itemIndex) => {
                  const tags = [...item.dietaryLabels, ...item.allergenLabels]
                  return (
                    <div
                      key={`item-${sectionIndex}-${itemIndex}-${item.title}`}
                      className={styles.item}
                    >
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      {item.description ? (
                        <p className={styles.itemDesc}>{item.description}</p>
                      ) : null}
                      {tags.length > 0 ? (
                        <p className={styles.tags}>{tags.join(' · ')}</p>
                      ) : null}
                    </div>
                  )
                })}
              </section>
            ))}
          </div>
        )}

        {investmentVisible ? (
          <section className={styles.investment} aria-label="Investment">
            <p className={styles.investmentLabel}>Investment</p>
            {menu.displayInvestment ? (
              <p className={styles.investmentAmount}>{menu.displayInvestment}</p>
            ) : null}
            {menu.pricingPresentation ? (
              <p className={styles.investmentCopy}>{menu.pricingPresentation}</p>
            ) : null}
          </section>
        ) : null}
      </div>

      <footer className={styles.footer}>
        <hr className={styles.footerRule} aria-hidden="true" />
        <p className={styles.footerLine}>{MENU_PRINT_BRAND_FOOTER}</p>
        <p className={styles.footerLine}>
          {MENU_PRINT_WEBSITE}
          <span aria-hidden="true"> · </span>
          {MENU_PRINT_EMAIL}
        </p>
      </footer>
    </article>
  )
}
