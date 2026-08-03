import { formatUsdFromCents } from './money'
import { PLATE_INVOICE_BUSINESS } from './invoiceConstants'

export function buildInvoiceEmail(options: {
  clientName: string
  invoiceNumber: string
  totalCents: number
  balanceDueCents: number
  dueDateLabel: string
  invoiceUrl: string
  memo?: string | null
}): { subject: string; html: string; text: string } {
  const {
    clientName,
    invoiceNumber,
    totalCents,
    balanceDueCents,
    dueDateLabel,
    invoiceUrl,
    memo,
  } = options

  const subject = `Invoice ${invoiceNumber} from ${PLATE_INVOICE_BUSINESS.name}`
  const total = formatUsdFromCents(totalCents)
  const balance = formatUsdFromCents(balanceDueCents)

  const text = [
    `Hello ${clientName},`,
    '',
    `Please find invoice ${invoiceNumber} from ${PLATE_INVOICE_BUSINESS.name}.`,
    `Total: ${total}`,
    `Balance due: ${balance}`,
    `Due: ${dueDateLabel}`,
    '',
    `View and print your invoice: ${invoiceUrl}`,
    memo ? `\n${memo}` : '',
    '',
    'With care,',
    PLATE_INVOICE_BUSINESS.name,
    PLATE_INVOICE_BUSINESS.email,
  ]
    .filter(Boolean)
    .join('\n')

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f6f3ec;font-family:Georgia,serif;color:#14120e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4dccb;padding:32px;">
        <tr><td style="font-size:22px;letter-spacing:0.04em;color:#100f0c;">${PLATE_INVOICE_BUSINESS.name}</td></tr>
        <tr><td style="padding-top:18px;font-size:16px;line-height:1.6;">Hello ${escapeHtml(clientName)},</td></tr>
        <tr><td style="padding-top:12px;font-size:16px;line-height:1.6;">
          Invoice <strong>${escapeHtml(invoiceNumber)}</strong> is ready.
        </td></tr>
        <tr><td style="padding-top:16px;font-size:15px;line-height:1.7;color:#3d3830;">
          Total: ${total}<br/>
          Balance due: <strong>${balance}</strong><br/>
          Due: ${escapeHtml(dueDateLabel)}
        </td></tr>
        ${
          memo
            ? `<tr><td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3d3830;">${escapeHtml(memo)}</td></tr>`
            : ''
        }
        <tr><td style="padding-top:24px;">
          <a href="${escapeAttr(invoiceUrl)}" style="display:inline-block;background:#100f0c;color:#f6f3ec;text-decoration:none;padding:12px 18px;font-size:14px;letter-spacing:0.06em;">
            View invoice
          </a>
        </td></tr>
        <tr><td style="padding-top:28px;font-size:13px;color:#6f675d;line-height:1.5;">
          ${PLATE_INVOICE_BUSINESS.region}<br/>
          ${PLATE_INVOICE_BUSINESS.email}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html, text }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;')
}
