import type { PartnerSellSheetVariant } from '@/lib/site/partnerSellSheetConfig'
import {
  SELL_SHEET_PRINT,
  SELL_SHEET_SHARED,
  SELL_SHEET_STEPS,
} from '@/lib/site/partnerSellSheetConfig'
import { getPartnerCertificateVariant } from '@/lib/site/partnerCertificateConfig'
import { PREPAID_PARTNER_PACKAGES } from '@/lib/site/partnerConciergePricing'
import PartnerCertificateFrontPreview from '@/components/partner-certificate/PartnerCertificateFrontPreview'
import styles from './partner-sell-sheet.module.css'

type Props = {
  variant: PartnerSellSheetVariant
}

export default function PartnerSellSheet({ variant }: Props) {
  const certificateVariant = getPartnerCertificateVariant(variant.certificateSlug)
  const steps = SELL_SHEET_STEPS.map((step, index) =>
    index === 1 ? { ...step, desc: variant.presentStepDesc } : step,
  )
  const ctaUrl = `https://www.platetheumpqua.com${variant.ctaPath}`
  const headlineClass =
    variant.headline.length > 52
      ? `${styles.heroHeadline} ${styles.heroHeadlineLong}`
      : styles.heroHeadline
  const benefits = variant.benefits.slice(0, 3)

  return (
    <div className={styles.preview}>
      <header className={styles.previewChrome}>
        <p className={styles.previewLabel}>
          Print Preview · Partner Sell Sheet · {variant.previewLabel}
        </p>
        <p className={styles.previewSpec}>
          {SELL_SHEET_PRINT.label} · View at 100% / Actual Size · Safe area{' '}
          {SELL_SHEET_PRINT.safeAreaIn}″
        </p>
      </header>

      <article className={styles.sheet} aria-label="Partner Concierge sell sheet">
        <header className={styles.topBand}>
          <div className={styles.heroPhotoWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={variant.heroImage}
              alt=""
              className={styles.heroPhoto}
              aria-hidden="true"
            />
            <div className={styles.heroPhotoOverlay} aria-hidden="true" />
          </div>
          <div className={styles.topBrand}>
            <p className={styles.brandName}>{SELL_SHEET_SHARED.brand}</p>
            <p className={styles.brandProgram}>{SELL_SHEET_SHARED.programLine}</p>
          </div>
        </header>

        <div className={styles.body}>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>{variant.eyebrow}</p>
            <h1 className={headlineClass}>{variant.headline}</h1>
            <p className={styles.heroSupporting}>{variant.supporting}</p>
            <p className={styles.storyLead}>{variant.storyLead}</p>
          </section>

          <section className={styles.stepsSection} aria-label="How it works">
            <p className={styles.sectionEyebrow}>{SELL_SHEET_SHARED.stepsEyebrow}</p>
            <ol className={styles.stepsList}>
              {steps.map((step, index) => (
                <li key={step.title} className={styles.stepItem}>
                  <span className={styles.stepNum} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className={styles.stepTitle}>{step.title}</p>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.editorialRow} aria-label="Why it matters">
            <div className={styles.whyBlock}>
              <p className={styles.sectionEyebrow}>{SELL_SHEET_SHARED.benefitsEyebrow}</p>
              <h2 className={styles.whyHeadline}>{variant.whyHeadline}</h2>
              <p className={styles.whyLead}>{variant.whyLead}</p>
              <ul className={styles.benefitsList}>
                {benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.certBlock}>
              <p className={styles.certCaption}>{SELL_SHEET_SHARED.certificateCaption}</p>
              <div className={styles.certFrame}>
                {certificateVariant ? (
                  <PartnerCertificateFrontPreview
                    variant={certificateVariant}
                    scaleClassName={styles.certScale}
                  />
                ) : null}
              </div>
            </div>
          </section>

          <section className={styles.packagesSection} aria-label="Partner packages">
            <p className={styles.sectionEyebrow}>{SELL_SHEET_SHARED.packagesEyebrow}</p>
            <div className={styles.packagesGrid}>
              {PREPAID_PARTNER_PACKAGES.map((pkg) => (
                <div key={pkg.title} className={styles.packageCard}>
                  <p className={styles.packageTier}>
                    {pkg.tableCount === 1 ? 'Single' : `${pkg.tableCount}-Pack`}
                  </p>
                  <p className={styles.packagePrice}>{pkg.price}</p>
                  <div className={styles.packageMeta}>
                    {pkg.tableCount > 1 ? (
                      <>
                        <p className={styles.packagePer}>
                          {pkg.perExperiencePrice} per experience
                        </p>
                        {pkg.savingsLabel ? (
                          <p className={styles.packageSave}>
                            {pkg.savingsLabel.toUpperCase()}
                          </p>
                        ) : (
                          <span className={styles.packageMetaSpacer} aria-hidden="true" />
                        )}
                      </>
                    ) : (
                      <>
                        <span className={styles.packageMetaSpacer} aria-hidden="true" />
                        <span className={styles.packageMetaSpacer} aria-hidden="true" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.inclusionBlock}>
              <p className={styles.inclusionLine}>{SELL_SHEET_SHARED.inclusionLine1}</p>
              <p className={styles.inclusionLineStrong}>
                {SELL_SHEET_SHARED.inclusionLine2}
              </p>
              <p className={styles.inclusionLine}>{SELL_SHEET_SHARED.inclusionLine3}</p>
              <p className={styles.inclusionFine}>{SELL_SHEET_SHARED.additionalGuestNote}</p>
            </div>
          </section>

          <footer className={styles.ctaFooter}>
            <div className={styles.ctaMain}>
              <h2 className={styles.ctaHeadline}>{variant.ctaHeadline}</h2>
              <p className={styles.ctaLabel}>{variant.ctaLabel}</p>
              <p className={styles.ctaUrl}>{ctaUrl.replace('https://', '')}</p>
              <p className={styles.contactLine}>
                {SELL_SHEET_SHARED.contactSite}
                <span aria-hidden="true"> · </span>
                {SELL_SHEET_SHARED.contactEmail}
              </p>
            </div>
            <div className={styles.ctaAside}>
              <div className={styles.qrPlaceholder} aria-label="QR placeholder">
                <div className={styles.qrMark} aria-hidden="true" />
              </div>
            </div>
          </footer>
        </div>
      </article>
    </div>
  )
}
