import Link from 'next/link'

/**
 * Payload Admin banner: steer operators to Plate OS invoice workflow.
 */
export default function InvoicesOsWorkflowNotice() {
  return (
    <div
      style={{
        margin: '0 0 1rem',
        padding: '0.9rem 1rem',
        borderRadius: 8,
        border: '1px solid rgba(196, 164, 101, 0.45)',
        background: 'rgba(196, 164, 101, 0.12)',
        color: '#1a1712',
        lineHeight: 1.45,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>
        Create invoices in Plate OS
      </strong>
      <span style={{ fontSize: 14 }}>
        Do not create invoices in this Admin screen (especially on a phone). Use{' '}
        <Link href="/os/invoices/new" style={{ color: '#6b4f1d', fontWeight: 600 }}>
          Plate OS → Invoices → Create invoice
        </Link>
        . Save Draft, Create Square Payment Invoice, and Send Invoice are separate
        steps there.
      </span>
    </div>
  )
}
