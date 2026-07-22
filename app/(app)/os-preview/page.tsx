import { notFound } from 'next/navigation'

/**
 * Former public demo route (unrelated agency concept preview).
 * Kept as an explicit not-found so stale links do not resurrect content.
 */
export default function OsPreviewPage() {
  notFound()
}
