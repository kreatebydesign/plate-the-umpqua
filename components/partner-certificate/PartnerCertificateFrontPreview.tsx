import type { PartnerCertificateVariant } from '@/lib/site/partnerCertificateConfig'
import {
  CERTIFICATE_SHARED_COPY,
  isLongCertificateTitle,
} from '@/lib/site/partnerCertificateConfig'
import certStyles from './partner-certificate.module.css'

type Props = {
  variant: PartnerCertificateVariant
  /** CSS module class for scale wrapper from sell sheet */
  scaleClassName?: string
}

/**
 * Front face only — for sell-sheet and collateral embedding.
 * Uses the approved certificate design at physical 7×5 dimensions;
 * parent applies scale for composition.
 */
export default function PartnerCertificateFrontPreview({
  variant,
  scaleClassName,
}: Props) {
  const titleClassName = isLongCertificateTitle(variant.title)
    ? `${certStyles.title} ${certStyles.titleLong}`
    : certStyles.title

  return (
    <div className={scaleClassName} aria-hidden="true">
      <article className={certStyles.certificate}>
        <div className={certStyles.matte} aria-hidden="true" />
        <div className={certStyles.outerFrame} aria-hidden="true" />
        <div className={certStyles.innerFrame} aria-hidden="true" />
        <span
          className={`${certStyles.cornerMark} ${certStyles.cornerTL}`}
          aria-hidden="true"
        />
        <span
          className={`${certStyles.cornerMark} ${certStyles.cornerTR}`}
          aria-hidden="true"
        />
        <span
          className={`${certStyles.cornerMark} ${certStyles.cornerBL}`}
          aria-hidden="true"
        />
        <span
          className={`${certStyles.cornerMark} ${certStyles.cornerBR}`}
          aria-hidden="true"
        />
        <div className={certStyles.face}>
          <header className={certStyles.brandBlock}>
            <p className={certStyles.brand}>{CERTIFICATE_SHARED_COPY.brand}</p>
            <p className={certStyles.brandTag}>{CERTIFICATE_SHARED_COPY.brandTag}</p>
          </header>
          <div className={certStyles.titleBlock}>
            <p className={titleClassName}>{variant.title}</p>
            <p className={certStyles.subtitle}>{variant.subtitle}</p>
            <div className={certStyles.ornament} aria-hidden="true">
              <span className={certStyles.ornamentDiamond} />
            </div>
            <p className={certStyles.supporting}>{variant.supportingLine}</p>
            <p className={certStyles.occasionCopy}>{variant.occasionCopy}</p>
          </div>
          <div className={certStyles.personalizationPanel}>
            <div className={certStyles.writeFields}>
              <div className={certStyles.writeField}>
                <p className={certStyles.writeLabel}>
                  {CERTIFICATE_SHARED_COPY.presentedToLabel}
                </p>
                <div className={certStyles.writeLane}>
                  <span className={certStyles.writeRule} aria-hidden="true" />
                </div>
              </div>
              <div className={certStyles.writeField}>
                <p className={certStyles.writeLabel}>
                  {CERTIFICATE_SHARED_COPY.presentedByLabel}
                </p>
                <div className={certStyles.writeLane}>
                  <span className={certStyles.writeRule} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className={certStyles.entitlement}>
            <p className={certStyles.entitlementLine}>
              {CERTIFICATE_SHARED_COPY.includedGuestsLine1}
            </p>
            <p className={certStyles.entitlementLine}>
              {CERTIFICATE_SHARED_COPY.includedGuestsLine2}
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}
