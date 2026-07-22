import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../os.module.css'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getInquiryDetail } from '@/lib/os/inquiries/inquiryQueries'
import InquiryOperationalForm from '@/components/os/InquiryOperationalForm'

export const metadata: Metadata = {
  title: 'Inquiry',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function InquiryDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const user = await requirePlateOperator({ returnTo: `/os/inquiries/${id}` })
  const inquiry = await getInquiryDetail(user, id)

  if (!inquiry) {
    notFound()
  }

  return (
    <div className={styles.detailLayout}>
      <section className={styles.hero} aria-label="Inquiry header">
        <p className={styles.heroDate}>
          {inquiry.sourceLabel} · Received {inquiry.receivedLabel}
        </p>
        <h2 className={styles.heroGreeting}>{inquiry.client.name || inquiry.title}</h2>
        <p className={styles.heroLine}>
          {[inquiry.statusLabel, inquiry.occasionLabel, inquiry.priorityLabel]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className={styles.actions}>
          <Link href="/os/inquiries" className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to inquiries
          </Link>
          {inquiry.canEditOperational ? (
            <Link
              href={inquiry.adminHref}
              className={`${styles.button} ${styles.buttonQuiet}`}
            >
              Open in Admin
            </Link>
          ) : null}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="contact-title">
          <h2 id="contact-title" className={styles.panelTitle}>
            Contact
          </h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Name</dt>
              <dd>{inquiry.client.name || '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                {inquiry.client.email ? (
                  <a href={`mailto:${inquiry.client.email}`}>{inquiry.client.email}</a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {inquiry.client.phone ? (
                  <a href={`tel:${inquiry.client.phone.replace(/[^\d+]/g, '')}`}>
                    {inquiry.client.phone}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="request-title">
          <h2 id="request-title" className={styles.panelTitle}>
            Request
          </h2>
          <dl className={styles.detailList}>
            <div>
              <dt>Title</dt>
              <dd>{inquiry.title}</dd>
            </div>
            <div>
              <dt>Occasion</dt>
              <dd>{inquiry.occasionLabel}</dd>
            </div>
            <div>
              <dt>Preferred date</dt>
              <dd>{inquiry.eventDateLabel || '—'}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{inquiry.guestCount != null ? inquiry.guestCount : '—'}</dd>
            </div>
            <div>
              <dt>Location type</dt>
              <dd>{inquiry.locationLabel || '—'}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{inquiry.preferredRegion || '—'}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{inquiry.budgetLabel || '—'}</dd>
            </div>
            {inquiry.addOns.length > 0 ? (
              <div>
                <dt>Add-ons</dt>
                <dd>{inquiry.addOns.join(', ')}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="vision-title">
        <h2 id="vision-title" className={styles.panelTitle}>
          Experience vision
        </h2>
        <p className={styles.visionCopy}>{inquiry.experienceVision || '—'}</p>
      </section>

      {inquiry.canViewDietary && inquiry.dietaryNotes ? (
        <section className={styles.panelSensitive} aria-labelledby="dietary-title">
          <h2 id="dietary-title" className={styles.panelTitle}>
            Dietary notes
          </h2>
          <p className={styles.fieldHint}>
            Operationally sensitive — shown only on this detail view for authorized operators.
          </p>
          <p className={styles.visionCopy}>{inquiry.dietaryNotes}</p>
        </section>
      ) : null}

      <section className={styles.panel} aria-labelledby="ops-title">
        <h2 id="ops-title" className={styles.panelTitle}>
          Operational status
        </h2>
        {inquiry.canEditOperational ? (
          <InquiryOperationalForm
            inquiryId={inquiry.id}
            initialStatus={String(inquiry.status)}
            initialPriority={String(inquiry.priority)}
            statusHookNote={inquiry.statusHookNote}
          />
        ) : (
          <p className={styles.empty}>
            Status: {inquiry.statusLabel}. Priority: {inquiry.priorityLabel}. You can review
            this inquiry, but operational edits require director or curator access.
          </p>
        )}
      </section>
    </div>
  )
}
