import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../../../../os.module.css'
import MenuBuilderForm from '@/components/os/MenuBuilderForm'
import MenuWorkflowGuidance from '@/components/os/MenuWorkflowGuidance'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import {
  ensureRelationshipOption,
  getMenuDetail,
  listClientOptions,
  listEventOptions,
  listInquiryOptions,
} from '@/lib/os/menus/menuQueries'
import { listMenuReadyRecipes } from '@/lib/os/recipes/recipeQueries'

export const metadata: Metadata = {
  title: 'Edit menu',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

function mergeOption(
  options: Array<{ id: string; label: string }>,
  extra: { id: string; label: string } | null,
) {
  if (!extra) return options
  if (options.some((option) => option.id === extra.id)) return options
  return [extra, ...options]
}

export default async function EditMenuPage({ params }: { params: Params }) {
  const user = await requirePlateOperator({ returnTo: '/os/menus' })
  const { id } = await params
  const menu = await getMenuDetail(user, id)
  if (!menu) notFound()

  const [clients, inquiries, events, recipes, clientExtra, inquiryExtra, eventExtra] =
    await Promise.all([
      listClientOptions(user),
      listInquiryOptions(user, { clientId: menu.clientId }),
      listEventOptions(user, { clientId: menu.clientId }),
      listMenuReadyRecipes(user),
      ensureRelationshipOption(user, 'clients', menu.clientId),
      ensureRelationshipOption(user, 'inquiries', menu.inquiryId),
      ensureRelationshipOption(user, 'events', menu.eventId),
    ])

  const clientOptions = clients.slice()
  if (clientExtra && !clientOptions.some((c) => c.id === clientExtra.id)) {
    clientOptions.unshift({
      id: clientExtra.id,
      label: clientExtra.label,
      name: clientExtra.label,
      email: null,
    })
  }

  return (
    <div>
      <section className={styles.hero} aria-label="Edit menu">
        <p className={styles.heroDate}>Menu builder</p>
        <h2 className={styles.heroGreeting}>Edit menu</h2>
        <p className={styles.heroLine}>{menu.internalName}</p>
        <div className={styles.actions}>
          <Link
            href={`/os/menus/${menu.id}`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Back to menu
          </Link>
          <Link
            href={`/os/menus/${menu.id}/preview`}
            className={`${styles.button} ${styles.buttonQuiet}`}
          >
            Preview
          </Link>
        </div>
      </section>

      <MenuWorkflowGuidance status={menu.status} />

      <section className={styles.panel}>
        {menu.canWrite ? (
          <MenuBuilderForm
            mode="edit"
            menuId={menu.id}
            initial={menu}
            clients={clientOptions}
            inquiries={mergeOption(inquiries, inquiryExtra)}
            events={mergeOption(events, eventExtra)}
            recipes={recipes}
          />
        ) : (
          <p className={styles.empty}>
            You can view this menu, but editing requires culinary write access.
          </p>
        )}
      </section>
    </div>
  )
}
