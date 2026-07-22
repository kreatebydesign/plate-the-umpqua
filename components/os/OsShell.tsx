'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { OS_NAV } from '@/lib/os/constants'
import styles from '@/app/(os)/os.module.css'

type OsShellProps = {
  userName: string
  userRoleLabel: string
  children: ReactNode
}

const PAGE_META: Record<string, { title: string; eyebrow: string }> = {
  '/os': { title: 'Today at Plate', eyebrow: 'Daily overview' },
  '/os/inquiries': { title: 'Inquiries', eyebrow: 'Leads & requests' },
  '/os/events': { title: 'Events', eyebrow: 'Confirmed hospitality' },
  '/os/clients': { title: 'Clients', eyebrow: 'Relationships' },
}

function navIsActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function OsShell({
  userName,
  userRoleLabel,
  children,
}: OsShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const drawerId = useId()
  const titleId = useId()

  const page = useMemo(() => {
    return (
      PAGE_META[pathname] || {
        title: 'Plate Business OS',
        eyebrow: 'Operations',
      }
    )
  }, [pathname])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  async function signOut() {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Continue to login even if logout request fails.
    }
    router.replace('/admin/login')
    router.refresh()
  }

  const nav = (
    <>
      <div className={styles.brand}>
        <p className={styles.brandEyebrow}>Business OS</p>
        <p className={styles.brandTitle}>Plate The Umpqua</p>
        <p className={styles.brandSub}>Hospitality operations</p>
      </div>

      <nav className={styles.nav} aria-label="Plate OS">
        {OS_NAV.map((item) => {
          const active = navIsActive(pathname, item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={close}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.metaLinks}>
          <Link href="/admin" className={styles.metaLink} onClick={close}>
            Payload Admin
          </Link>
          <Link href="/" className={styles.metaLink} onClick={close}>
            Public website
          </Link>
          <button type="button" className={styles.textButton} onClick={signOut}>
            Sign out
          </button>
        </div>

        <div className={styles.userCard}>
          <p className={styles.userName}>{userName}</p>
          <p className={styles.userRole}>{userRoleLabel}</p>
        </div>

        <p className={styles.powered}>Powered by Kreate by Design</p>
      </div>
    </>
  )

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${styles.desktopOnly}`} aria-label="Primary">
        {nav}
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarCopy}>
            <p className={styles.topbarEyebrow}>{page.eyebrow}</p>
            <h1 id={titleId} className={styles.topbarTitle}>
              {page.title}
            </h1>
          </div>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            aria-expanded={open}
            aria-controls={drawerId}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>
        </header>

        <div className={styles.content} aria-labelledby={titleId}>
          {children}
        </div>
      </div>

      {open ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={close}
        />
      ) : null}

      <aside
        id={drawerId}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-hidden={!open}
        aria-label="Mobile navigation"
      >
        {nav}
      </aside>
    </div>
  )
}
