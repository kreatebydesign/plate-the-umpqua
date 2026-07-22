import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import styles from './menu-review.module.css'

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
    default: 'Menu review',
    template: '%s · Plate The Umpqua',
  },
  description: 'Private dining menu review for Plate The Umpqua.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#100f0c',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Isolated client review shell — no public SiteShell, no Plate OS chrome.
 */
export default function MenuReviewRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${work.variable} ${cormorant.variable} ${styles.reviewRoot}`}>
        {children}
      </body>
    </html>
  )
}
