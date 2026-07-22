import styles from '@/app/(os)/os.module.css'
import { menuWorkflowGuidance } from '@/lib/os/menus/menuConstants'

type Props = {
  status: string
}

export default function MenuWorkflowGuidance({ status }: Props) {
  const guidance = menuWorkflowGuidance(status)

  return (
    <aside className={styles.workflowBanner} aria-label="Menu workflow">
      <p className={styles.workflowStatus}>
        Status: <strong>{guidance.statusLabel}</strong>
      </p>
      <p className={styles.workflowNext}>{guidance.nextAction}</p>
    </aside>
  )
}
