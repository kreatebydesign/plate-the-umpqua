import path from 'node:path'
import React from 'react'
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer'
import type { InvoiceDocumentModel } from './invoiceDocumentModel'

const fontDir = path.join(process.cwd(), 'public/fonts/invoice')

let fontsRegistered = false

function registerInvoiceFonts() {
  if (fontsRegistered) return
  Font.register({
    family: 'CormorantGaramond',
    fonts: [
      {
        src: path.join(fontDir, 'CormorantGaramond-400.ttf'),
        fontWeight: 400,
      },
      {
        src: path.join(fontDir, 'CormorantGaramond-600.ttf'),
        fontWeight: 600,
      },
    ],
  })
  Font.register({
    family: 'WorkSans',
    fonts: [
      {
        src: path.join(fontDir, 'WorkSans-400.ttf'),
        fontWeight: 400,
      },
      {
        src: path.join(fontDir, 'WorkSans-500.ttf'),
        fontWeight: 500,
      },
    ],
  })
  Font.registerHyphenationCallback((word) => [word])
  fontsRegistered = true
}

const colors = {
  ink: '#14120e',
  soft: '#3d3830',
  muted: '#6a6358',
  line: '#d9d0c0',
  gold: '#8a7040',
  panel: '#f7f2e8',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'WorkSans',
    fontSize: 10,
    color: colors.ink,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 42,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    paddingBottom: 14,
    marginBottom: 16,
  },
  wordmark: {
    fontFamily: 'CormorantGaramond',
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 6,
  },
  meta: {
    color: colors.soft,
    fontSize: 9.5,
    lineHeight: 1.45,
  },
  rightMeta: {
    textAlign: 'right',
    maxWidth: 220,
  },
  invoiceLabel: {
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  invoiceNumber: {
    fontFamily: 'CormorantGaramond',
    fontSize: 18,
    fontWeight: 600,
    marginTop: 2,
    marginBottom: 8,
  },
  parties: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 14,
  },
  partyCol: {
    flex: 1,
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: 500,
    marginBottom: 4,
  },
  dueBanner: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    marginBottom: 14,
  },
  dueCaption: {
    color: colors.gold,
    fontSize: 8,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  dueAmount: {
    fontFamily: 'CormorantGaramond',
    fontSize: 22,
    fontWeight: 600,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 7,
  },
  th: {
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  colDesc: { width: '38%' },
  colBasis: { width: '18%' },
  colQty: { width: '10%' },
  colRate: { width: '16%' },
  colAmt: { width: '18%', textAlign: 'right' },
  lineTitle: {
    fontWeight: 500,
    color: colors.ink,
  },
  lineDetail: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 9,
  },
  totalsWrap: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totalsPanel: {
    width: 220,
    borderTopWidth: 1.5,
    borderTopColor: colors.ink,
    paddingTop: 6,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    color: colors.soft,
  },
  totalsStrong: {
    marginTop: 4,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    color: colors.ink,
    fontWeight: 500,
  },
  totalsDue: {
    color: colors.ink,
    fontWeight: 500,
    fontSize: 11,
  },
  memo: {
    marginTop: 16,
  },
  footer: {
    marginTop: 22,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    alignItems: 'center',
  },
  footerWordmark: {
    fontFamily: 'CormorantGaramond',
    fontSize: 12,
    fontWeight: 600,
  },
  footerThanks: {
    marginTop: 4,
    color: colors.soft,
    fontSize: 9.5,
  },
  footerMeta: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 8.5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 8,
  },
})

function InvoicePdfDocument({ invoice }: { invoice: InvoiceDocumentModel }) {
  return (
    <Document
      title={`${invoice.invoiceNumber} · Plate The Umpqua`}
      author="Plate The Umpqua"
      subject="Private hospitality invoice"
      creator="Plate The Umpqua Invoice"
    >
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header} fixed={false}>
          <View>
            <Text style={styles.wordmark}>{invoice.business.name}</Text>
            <Text style={styles.meta}>
              {invoice.business.address ? `${invoice.business.address}\n` : ''}
              {invoice.business.region}
              {'\n'}
              {invoice.business.email}
              {invoice.business.phone ? `\n${invoice.business.phone}` : ''}
              {'\n'}
              {invoice.business.website}
            </Text>
          </View>
          <View style={styles.rightMeta}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.meta}>Issue date: {invoice.issueDateLabel}</Text>
            <Text style={styles.meta}>Due date: {invoice.dueDateLabel}</Text>
            <Text style={styles.meta}>Terms: {invoice.paymentTermsLabel}</Text>
            {invoice.clientStatusLabel ? (
              <Text style={styles.meta}>Status: {invoice.clientStatusLabel}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyCol}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={styles.meta}>
              {invoice.billTo.name}
              {invoice.billTo.company ? `\n${invoice.billTo.company}` : ''}
              {`\n${invoice.billTo.email}`}
              {invoice.billTo.phone ? `\n${invoice.billTo.phone}` : ''}
            </Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.sectionLabel}>Event & terms</Text>
            <Text style={styles.meta}>
              {invoice.event.name || 'Private hospitality'}
              {invoice.event.dateLabel ? `\n${invoice.event.dateLabel}` : ''}
              {invoice.event.venue ? `\n${invoice.event.venue}` : ''}
              {invoice.event.guestCount ? `\n${invoice.event.guestCount} guests` : ''}
              {`\nPayment terms: ${invoice.paymentTermsLabel}`}
            </Text>
          </View>
        </View>

        <View style={styles.dueBanner} wrap={false}>
          <Text style={styles.dueCaption}>{invoice.amountDueNowCaption}</Text>
          <Text style={styles.dueAmount}>{invoice.amountDueNowLabel}</Text>
        </View>

        <View style={styles.tableHeader} fixed>
          <Text style={[styles.th, styles.colDesc]}>Description</Text>
          <Text style={[styles.th, styles.colBasis]}>Basis</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colRate]}>Rate</Text>
          <Text style={[styles.th, styles.colAmt]}>Amount</Text>
        </View>

        {invoice.lines.map((line, index) => (
          <View key={`${line.description}-${index}`} style={styles.tableRow} wrap={false}>
            <View style={styles.colDesc}>
              <Text style={styles.lineTitle}>
                {line.isCredit ? 'Credit · ' : ''}
                {line.description}
              </Text>
              {line.detail ? <Text style={styles.lineDetail}>{line.detail}</Text> : null}
            </View>
            <Text style={styles.colBasis}>{line.billingTypeLabel}</Text>
            <Text style={styles.colQty}>{line.quantityLabel}</Text>
            <Text style={styles.colRate}>{line.unitPriceLabel}</Text>
            <Text style={styles.colAmt}>{line.lineTotalLabel}</Text>
          </View>
        ))}

        <View style={styles.totalsWrap} wrap={false}>
          <View style={styles.totalsPanel}>
            {invoice.totalsRows.map((row) => (
              <View
                key={row.key}
                style={[
                  styles.totalsRow,
                  row.emphasis === 'strong' ? styles.totalsStrong : {},
                  row.emphasis === 'due' ? styles.totalsDue : {},
                ]}
              >
                <Text>{row.label}</Text>
                <Text>{row.valueLabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {invoice.clientMemo ? (
          <View style={styles.memo} wrap={false}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.meta}>{invoice.clientMemo}</Text>
          </View>
        ) : null}

        <View style={styles.footer} wrap={false}>
          <Text style={styles.footerWordmark}>{invoice.business.name}</Text>
          <Text style={styles.footerThanks}>{invoice.thankYou}</Text>
          <Text style={styles.footerMeta}>
            {invoice.business.email}
            {invoice.business.phone ? ` · ${invoice.business.phone}` : ''}
            {' · '}
            {invoice.business.website}
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ''
          }
          fixed
        />
      </Page>
    </Document>
  )
}

export async function renderInvoicePdfBuffer(invoice: InvoiceDocumentModel): Promise<Buffer> {
  registerInvoiceFonts()
  const buffer = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />)
  return Buffer.from(buffer)
}
