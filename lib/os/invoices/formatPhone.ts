/**
 * Format phone numbers for client-facing invoice documents.
 * Preserves international numbers; formats common US 10/11-digit values.
 */
export function formatPhoneForInvoice(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  // Keep original readable form when not a standard US number.
  return trimmed
}
