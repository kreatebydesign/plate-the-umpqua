import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import styles from './invoice.module.css'

const work = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: {
    default: 'Invoice',
    template: '%s · Plate The Umpqua',
  },
  description: 'Private hospitality invoice for Plate The Umpqua.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#100f0c',
  width: 'device-width',
  initialScale: 1,
}

export default function InvoiceRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${work.variable} ${cormorant.variable} ${styles.invoiceRoot}`}>
        {children}
      </body>
    </html>
  )
}
