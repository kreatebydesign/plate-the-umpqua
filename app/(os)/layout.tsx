import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import styles from './os.module.css'

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
    default: 'Today at Plate',
    template: '%s · Plate Business OS',
  },
  description:
    'Plate The Umpqua Business OS — private hospitality operations for Plate The Umpqua.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#100f0c',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Isolated OS root — no public SiteShell, no Payload chrome.
 */
export default function OsRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${work.variable} ${cormorant.variable} ${styles.osRoot}`}>
        {children}
      </body>
    </html>
  )
}
