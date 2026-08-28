import type { ReactNode } from 'react'
import type { PartnerCertificateVariant } from '@/lib/site/partnerCertificateConfig'
import {
  CERTIFICATE_SHARED_COPY,
  CERTIFICATE_PRINT,
  isLongCertificateTitle,
} from '@/lib/site/partnerCertificateConfig'
import styles from './partner-certificate.module.css'

type Props = {
  variant: PartnerCertificateVariant
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

/**
 * Bulk-print certificate for preprinted inventory.
 * Presented To / Presented By are blank write-in fields for the
 * gifting professional. Certificate ID is reserved for Plate control.
 *
 * Future architecture (not implemented here):
 * A) unique certificate ID + common redemption QR, or
 * B) unique QR bound to each certificate.
 */
export default function PartnerCertificate({ variant }: Props) {
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
          Page · Safe area {CERTIFICATE_PRINT.safeAreaIn}″ · Handwritten Presented To /
          By
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

              {/*
                Warm ivory personalization panel — ordinary black/blue pen.
                Luxury stationery inset; not a web form. No ornament under lines.
              */}
              <div className={styles.personalizationPanel}>
                <div className={styles.writeFields}>
                  <div className={styles.writeField}>
                    <p className={styles.writeLabel}>
                      {CERTIFICATE_SHARED_COPY.presentedToLabel}
                    </p>
                    <div
                      className={styles.writeLane}
                      aria-label="Handwriting line for Presented To"
                    >
                      <span className={styles.writeRule} aria-hidden="true" />
                    </div>
                  </div>
                  <div className={styles.writeField}>
                    <p className={styles.writeLabel}>
                      {CERTIFICATE_SHARED_COPY.presentedByLabel}
                    </p>
                    <div
                      className={styles.writeLane}
                      aria-label="Handwriting line for Presented By"
                    >
                      <span className={styles.writeRule} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.entitlement}>
                <p className={styles.entitlementLine}>
                  {CERTIFICATE_SHARED_COPY.includedGuestsLine1}
                </p>
                <p className={styles.entitlementLine}>
                  {CERTIFICATE_SHARED_COPY.includedGuestsLine2}
                </p>
              </div>
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
                    the certificate redemption URL / token. Prefer unique QR
                    per certificate, or unique ID + common QR. Do not implement
                    redemption, activation, or scanning backends here.
                  */}
                  <div className={styles.qrPlaceholder} aria-label="QR placeholder">
                    <div className={styles.qrMark} aria-hidden="true" />
                  </div>
                  {/*
                    Reserved for Plate-controlled unique certificate ID
                    (variable-data print, label, or handwriting). Ivory inset
                    supports ordinary black/blue ink and clean VDP.
                  */}
                  <div className={styles.certificateIdPanel}>
                    <p className={styles.certificateIdLabel}>
                      {CERTIFICATE_SHARED_COPY.certificateIdLabel}
                    </p>
                    <span className={styles.certificateIdRule} aria-hidden="true" />
                  </div>
                  <p className={styles.asideUrl}>
                    {CERTIFICATE_SHARED_COPY.redemptionUrlPlaceholder}
                  </p>
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
