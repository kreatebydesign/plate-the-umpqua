'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import type { PublicMenuReviewPayload } from '@/lib/os/menus/publicReviewPayload'
import {
  MENU_PRINT_STYLE_HINTS,
  MENU_PRINT_STYLE_LABELS,
  MENU_PRINT_STYLES,
  menuPrintHasInvestment,
  type MenuPrintStyle,
} from '@/lib/os/menus/menuPrintPresentation'
import MenuPrintDocument from './MenuPrintDocument'
import styles from './menu-print.module.css'

type Props = {
  menu: PublicMenuReviewPayload
  initialStyle: MenuPrintStyle
  backHref: string
}

export default function MenuPrintStudio({
  menu,
  initialStyle,
  backHref,
}: Props) {
  const styleId = useId()
  const investmentId = useId()
  const [style, setStyle] = useState<MenuPrintStyle>(initialStyle)
  const [showInvestment, setShowInvestment] = useState(
    menuPrintHasInvestment(menu),
  )
  const hasInvestment = menuPrintHasInvestment(menu)

  function onStyleChange(next: MenuPrintStyle) {
    setStyle(next)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('style', next)
      window.history.replaceState({}, '', url.toString())
    } catch {
      // ignore history failures
    }
  }

  function onPrint() {
    window.print()
  }

  return (
    <div className={styles.root}>
      <header className={styles.toolbar} role="region" aria-label="Print controls">
        <div className={styles.toolbarRow}>
          <h1 className={styles.toolbarTitle}>Menu print preview</h1>
          <Link href={backHref} className={`${styles.button} ${styles.buttonQuiet}`}>
            Back to Menu
          </Link>
          <button
            type="button"
            className={styles.button}
            onClick={onPrint}
            aria-label="Print or save as PDF"
          >
            Print / Save PDF
          </button>
        </div>

        <div className={styles.toolbarControls}>
          <label className={styles.field} htmlFor={styleId}>
            <span className={styles.fieldLabel}>Presentation style</span>
            <select
              id={styleId}
              className={styles.select}
              value={style}
              onChange={(event) =>
                onStyleChange(event.target.value as MenuPrintStyle)
              }
            >
              {MENU_PRINT_STYLES.map((value) => (
                <option key={value} value={value}>
                  {MENU_PRINT_STYLE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          {hasInvestment ? (
            <label className={styles.checkboxRow} htmlFor={investmentId}>
              <input
                id={investmentId}
                className={styles.checkbox}
                type="checkbox"
                checked={showInvestment}
                onChange={(event) => setShowInvestment(event.target.checked)}
              />
              Include investment
            </label>
          ) : null}
        </div>

        <p className={styles.styleHint}>{MENU_PRINT_STYLE_HINTS[style]}</p>
        <p className={styles.toolbarMeta}>
          Showing the last saved client-facing menu. Internal notes, costs, and
          record IDs are never included.
        </p>
        <p className={styles.guidance}>
          <strong>For a clean menu PDF,</strong> choose Letter, Portrait, 100%
          scale, and turn off browser headers and footers. Background graphics
          are optional — the menu remains readable without them.
        </p>
      </header>

      <div className={styles.stage}>
        <div className={styles.sheetFrame}>
          <div className={styles.sheet}>
            <div className={styles.sheetInner}>
              <MenuPrintDocument
                menu={menu}
                style={style}
                showInvestment={showInvestment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
