'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/(os)/os.module.css'

export type RelationshipOption = {
  id: string
  label: string
}

type Props = {
  id: string
  label: string
  value: string
  options: RelationshipOption[]
  required?: boolean
  optionalNoneLabel?: string
  disabled?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  onChange: (nextId: string) => void
}

/**
 * Human-readable relationship picker with local filter over bounded options.
 * Stores Payload document IDs; never matches by free-text inference.
 */
export default function RelationshipSelect({
  id,
  label,
  value,
  options,
  required = false,
  optionalNoneLabel = 'None',
  disabled = false,
  searchPlaceholder = 'Filter options',
  emptyMessage = 'No matching records.',
  onChange,
}: Props) {
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase().slice(0, 80)
    if (!needle) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle),
    )
  }, [filter, options])

  const selectedStillVisible =
    !value || filtered.some((option) => option.id === value)

  const selectOptions = selectedStillVisible
    ? filtered
    : [
        ...filtered,
        ...(options.find((option) => option.id === value)
          ? [options.find((option) => option.id === value)!]
          : value
            ? [{ id: value, label: 'Selected record' }]
            : []),
      ]

  return (
    <div className={styles.relationshipPicker}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
        <select
          id={id}
          className={styles.fieldControl}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">
            {required ? 'Select…' : optionalNoneLabel}
          </option>
          {selectOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.fieldLabel} htmlFor={`${id}-filter`}>
        <span className={styles.visuallyHidden}>Filter {label}</span>
        <input
          id={`${id}-filter`}
          type="search"
          className={styles.fieldControl}
          value={filter}
          disabled={disabled}
          placeholder={searchPlaceholder}
          maxLength={80}
          autoComplete="off"
          onChange={(event) => setFilter(event.target.value.slice(0, 80))}
        />
      </label>

      {filtered.length === 0 ? (
        <p className={styles.builderHint} role="status">
          {emptyMessage}
        </p>
      ) : (
        <p className={styles.builderHint}>
          Showing {filtered.length} of {options.length} loaded option
          {options.length === 1 ? '' : 's'}.
        </p>
      )}
    </div>
  )
}
