import type { ReactNode } from 'react'

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Isolated print-design root layout.
 * Intentionally separate from the public SiteShell / Payload admin trees.
 */
export default function PrintDesignLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#14120e' }}>{children}</body>
    </html>
  )
}
