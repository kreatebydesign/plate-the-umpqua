import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import MenuPrintStudio from '@/components/os/menu-print/MenuPrintStudio'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { getMenuDetail } from '@/lib/os/menus/menuQueries'
import {
  buildMenuPrintPayload,
  parseMenuPrintStyle,
} from '@/lib/os/menus/menuPrintPresentation'

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

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ style?: string | string[] }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  try {
    const user = await requirePlateOperator({ returnTo: '/os/menus' })
    const { id } = await params
    const menu = await getMenuDetail(user, id)
    const occasion = menu?.occasionTitle?.trim()
    return {
      title: occasion
        ? `${occasion} · Plate The Umpqua`
        : 'Menu · Plate The Umpqua',
      description: 'Plate The Umpqua private dining menu',
      robots: { index: false, follow: false },
    }
  } catch {
    return {
      title: 'Menu · Plate The Umpqua',
      robots: { index: false, follow: false },
    }
  }
}

export default async function MenuPrintPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  const { id } = await params
  const query = await searchParams
  const menu = await getMenuDetail(user, id)
  if (!menu) notFound()

  const presentation = buildMenuPrintPayload(menu)
  const initialStyle = parseMenuPrintStyle(query.style)

  return (
    <main className={`${work.variable} ${cormorant.variable}`}>
      <MenuPrintStudio
        menu={presentation}
        initialStyle={initialStyle}
        backHref={`/os/menus/${menu.id}`}
      />
    </main>
  )
}
