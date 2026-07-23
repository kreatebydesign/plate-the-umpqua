import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../../os.module.css'
import MenuPresentation from '@/components/os/MenuPresentation'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getMenuDetail } from '@/lib/os/menus/menuQueries'
import { buildMenuPrintPayload } from '@/lib/os/menus/menuPrintPresentation'

export const metadata: Metadata = {
  title: 'Menu preview',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function MenuPreviewPage({ params }: { params: Params }) {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  const { id } = await params
  const menu = await getMenuDetail(user, id)
  if (!menu) notFound()

  const presentation = buildMenuPrintPayload(menu)

  return (
    <div>
      <section className={styles.hero} aria-label="Menu preview">
        <p className={styles.heroDate}>Client presentation</p>
        <h2 className={styles.heroGreeting}>Preview</h2>
        <p className={styles.heroLine}>
          Exact client-facing presentation for {menu.internalName}. Internal notes
          are excluded. Use Print / PDF for the branded Letter menu.
        </p>
        <div className={styles.actions}>
          <Link
            href={`/os/menus/${menu.id}`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Back to menu
          </Link>
          <Link
            href={`/os/menus/${menu.id}/print`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Print / PDF
          </Link>
          {menu.canWrite ? (
            <Link
              href={`/os/menus/${menu.id}/edit`}
              className={styles.button}
            >
              Edit menu
            </Link>
          ) : null}
        </div>
      </section>

      <MenuPresentation menu={presentation} />
    </div>
  )
}
