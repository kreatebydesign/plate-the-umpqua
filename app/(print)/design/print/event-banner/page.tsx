import type { Metadata } from 'next'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import Banner from './Banner'
import styles from './banner.module.css'

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
  title: 'Event Banner Preview | Plate The Umpqua Print',
  description:
    'Isolated large-format print preview for the Plate The Umpqua 96" × 36" hospitality banner.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function EventBannerPage() {
  return (
    <main className={`${work.variable} ${cormorant.variable} ${styles.preview}`}>
      <header className={styles.previewChrome}>
        <p className={styles.previewLabel}>Print Preview · Isolated Asset</p>
        <p className={styles.previewSpec}>96″ × 36″ · Environmental graphic · Safe margins enforced</p>
      </header>

      <div className={styles.previewStage}>
        <div className={styles.previewFrame}>
          <Banner />
        </div>
      </div>
    </main>
  )
}
