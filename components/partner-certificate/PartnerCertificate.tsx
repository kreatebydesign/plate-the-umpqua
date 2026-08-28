import type { ReactNode } from 'react'
import type {
  PartnerCertificateSampleData,
  PartnerCertificateVariant,
} from '@/lib/site/partnerCertificateConfig'
import {
  CERTIFICATE_SAMPLE_DATA,
  CERTIFICATE_SHARED_COPY,
  CERTIFICATE_PRINT,
  isLongCertificateTitle,
} from '@/lib/site/partnerCertificateConfig'
import styles from './partner-certificate.module.css'

type Props = {
  variant: PartnerCertificateVariant
  /** Design QA sample data. Omit recipient for unassigned certificates. */
  data?: PartnerCertificateSampleData
  /** When false, hide recipient block even if sample data includes a name. */
  showRecipient?: boolean
}

function CertificateShell({ children }: { children: ReactNode }) {
  return (
    <article className={styles.certificate} aria-label="Partner gift certificate">
      <div className={styles.matte} aria-hidden="true" />
      <div className={styles.outerFrame} aria-hidden="true" />
      <div className={styles.innerFrame} aria-hidden="true" />
      <span className={`${styles.cornerMark} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.cornerMark} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.cornerMark} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.cornerMark} ${styles.cornerBR}`} aria-hidden="true" />
      {children}
    </article>
  )
}

export default function PartnerCertificate({
  variant,
  data = CERTIFICATE_SAMPLE_DATA,
  showRecipient = true,
}: Props) {
  const recipient =
    showRecipient && data.recipientName?.trim() ? data.recipientName.trim() : null
  const titleClassName = isLongCertificateTitle(variant.title)
    ? `${styles.title} ${styles.titleLong}`
    : styles.title

  return (
    <div className={styles.preview}>
      <header className={styles.previewChrome}>
        <p className={styles.previewLabel}>
          Print Preview · Partner Certificate · {variant.previewLabel}
        </p>
        <p className={styles.previewSpec}>
          {CERTIFICATE_PRINT.label} · View at 100% / Actual Size · Do not use Fit to
          Page · Safe area {CERTIFICATE_PRINT.safeAreaIn}″
        </p>
      </header>

      <div className={styles.previewStage}>
        {/* ─── FRONT ─── */}
        <section className={styles.sheet}>
          <p className={styles.faceLabel}>Front</p>
          <CertificateShell>
            <div className={styles.face}>
              <header className={styles.brandBlock}>
                <p className={styles.brand}>{CERTIFICATE_SHARED_COPY.brand}</p>
                <p className={styles.brandTag}>{CERTIFICATE_SHARED_COPY.brandTag}</p>
              </header>

              <div className={styles.titleBlock}>
                <h1 className={titleClassName}>{variant.title}</h1>
                <p className={styles.subtitle}>{variant.subtitle}</p>
                <div className={styles.ornament} aria-hidden="true">
                  <span className={styles.ornamentDiamond} />
                </div>
                <p className={styles.supporting}>{variant.supportingLine}</p>
                <p className={styles.occasionCopy}>{variant.occasionCopy}</p>
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaBlock}>
                  <p className={styles.metaLabel}>
                    {CERTIFICATE_SHARED_COPY.presentedLabel}
                  </p>
                  <p className={styles.metaValueScript}>{data.presentedByName}</p>
                  <p className={styles.metaSub}>{data.presentedByCompany}</p>
                </div>

                {recipient ? (
                  <div className={`${styles.metaBlock} ${styles.metaBlockEnd}`}>
                    <p className={styles.metaLabel}>
                      {CERTIFICATE_SHARED_COPY.recipientLabel}
                    </p>
                    <p className={styles.metaValueScript}>{recipient}</p>
                  </div>
                ) : (
                  <div className={styles.metaBlock} aria-hidden="true" />
                )}
              </div>

              <div className={styles.entitlement}>
                <p className={styles.entitlementLine}>
                  {CERTIFICATE_SHARED_COPY.includedGuestsLine1}
                </p>
                <p className={styles.entitlementLine}>
                  {CERTIFICATE_SHARED_COPY.includedGuestsLine2}
                </p>
              </div>

              <p className={styles.certNumber}>
                {CERTIFICATE_SHARED_COPY.certificateLabel}{' '}
                <strong>{data.certificateNumber}</strong>
              </p>
            </div>
          </CertificateShell>
        </section>

        {/* ─── BACK ─── */}
        <section className={styles.sheet}>
          <p className={styles.faceLabel}>Back</p>
          <CertificateShell>
            <div className={`${styles.face} ${styles.backFace}`}>
              <p className={styles.backBrand}>{CERTIFICATE_SHARED_COPY.brand}</p>

              <div className={styles.backZones}>
                <section className={styles.zone}>
                  <h2 className={styles.zoneHeading}>
                    {CERTIFICATE_SHARED_COPY.redeemHeading}
                  </h2>
                  <ol className={styles.stepList}>
                    {CERTIFICATE_SHARED_COPY.redeemSteps.map((step, index) => (
                      <li key={step}>
                        <span className={styles.stepNum} aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className={`${styles.zone} ${styles.zoneCenter}`}>
                  <h2 className={styles.zoneHeading}>
                    {CERTIFICATE_SHARED_COPY.scanHeading}
                  </h2>
                  {/*
                    FUTURE QR BINDING:
                    Replace this placeholder with a generated QR that encodes
                    the certificate redemption URL / token. Do not implement
                    redemption, activation, or scanning backends in this design pass.
                  */}
                  <div className={styles.qrPlaceholder} aria-label="QR placeholder">
                    <div className={styles.qrMark} aria-hidden="true" />
                  </div>
                  <p className={styles.asideNumber}>
                    {CERTIFICATE_SHARED_COPY.certificateLabel}
                    <strong>{data.certificateNumber}</strong>
                  </p>
                  <p className={styles.asideUrl}>{data.redemptionUrlPlaceholder}</p>
                </section>

                <section className={styles.zone}>
                  <h2 className={styles.zoneHeading}>
                    {CERTIFICATE_SHARED_COPY.guestInfoHeading}
                  </h2>
                  <ul className={styles.guestList}>
                    {CERTIFICATE_SHARED_COPY.guestPolicyLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <footer className={styles.backFooter}>
                <div className={styles.questionsBlock}>
                  <p className={styles.footerLabel}>
                    {CERTIFICATE_SHARED_COPY.questionsHeading}
                  </p>
                  <p className={styles.footerContact}>
                    {CERTIFICATE_SHARED_COPY.contactSite}
                    <span aria-hidden="true"> · </span>
                    {CERTIFICATE_SHARED_COPY.contactEmail}
                  </p>
                </div>
                <div className={styles.termsBlock}>
                  <p className={styles.footerLabel}>
                    {CERTIFICATE_SHARED_COPY.termsHeading}
                  </p>
                  <ul className={styles.termsList}>
                    {CERTIFICATE_SHARED_COPY.terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ul>
                </div>
              </footer>
            </div>
          </CertificateShell>
        </section>
      </div>
    </div>
  )
}
