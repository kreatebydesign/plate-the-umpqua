'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useState, useTransition } from 'react'
import styles from '@/app/(os)/os.module.css'
import RelationshipSelect from '@/components/os/RelationshipSelect'
import { createMenu, updateMenu } from '@/lib/os/menus/mutateMenu'
import {
  MENU_STATUS_LABELS,
  MENU_STATUS_VALUES,
  MENU_STRUCTURE_PRESETS,
  type MenuStructurePresetId,
} from '@/lib/os/menus/menuConstants'
import type { MenuDetail } from '@/lib/os/menus/menuQueries'

type ClientOption = { id: string; label: string; name: string; email: string | null }
type RelOption = { id: string; label: string }
type RecipeOption = { id: string; name: string; categoryLabel: string }

type ItemDraft = {
  key: string
  recipeId: string
  clientTitle: string
  clientDescription: string
  showDietary: boolean
  dietaryDisplay: string
  allergenDisplay: string
  internalItemNotes: string
}

type SectionDraft = {
  key: string
  sectionName: string
  items: ItemDraft[]
}

type FormState = {
  internalName: string
  client: string
  inquiry: string
  event: string
  occasionTitle: string
  serviceDate: string
  guestCount: string
  introductoryMessage: string
  pricingPresentation: string
  displayInvestment: string
  internalNotes: string
  status: string
  sections: SectionDraft[]
}

function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyItem(): ItemDraft {
  return {
    key: newKey(),
    recipeId: '',
    clientTitle: '',
    clientDescription: '',
    showDietary: false,
    dietaryDisplay: '',
    allergenDisplay: '',
    internalItemNotes: '',
  }
}

function emptySection(name = 'Course'): SectionDraft {
  return { key: newKey(), sectionName: name, items: [] }
}

function sectionsFromPreset(presetId: MenuStructurePresetId): SectionDraft[] {
  const preset = MENU_STRUCTURE_PRESETS.find((item) => item.id === presetId)
  if (!preset || preset.sections.length === 0) return []
  return preset.sections.map((name) => emptySection(name))
}

function toDateInput(value?: string | null) {
  if (!value) return ''
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return ''
  return new Date(ms).toISOString().slice(0, 10)
}

function fromDetail(detail?: MenuDetail | null): FormState {
  if (!detail) {
    return {
      internalName: '',
      client: '',
      inquiry: '',
      event: '',
      occasionTitle: '',
      serviceDate: '',
      guestCount: '',
      introductoryMessage: '',
      pricingPresentation: '',
      displayInvestment: '',
      internalNotes: '',
      status: 'draft',
      sections: sectionsFromPreset('privateDinner'),
    }
  }

  return {
    internalName: detail.internalName,
    client: detail.clientId || '',
    inquiry: detail.inquiryId || '',
    event: detail.eventId || '',
    occasionTitle: detail.occasionTitle,
    serviceDate: toDateInput(detail.serviceDate),
    guestCount: detail.guestCount != null ? String(detail.guestCount) : '',
    introductoryMessage: detail.introductoryMessage || '',
    pricingPresentation: detail.pricingPresentation || '',
    displayInvestment:
      detail.displayInvestment != null ? String(detail.displayInvestment) : '',
    internalNotes: detail.internalNotes || '',
    status: detail.status,
    sections:
      detail.sections.length > 0
        ? detail.sections.map((section) => ({
            key: newKey(),
            sectionName: section.sectionName,
            items:
              section.items.length > 0
                ? section.items.map((item) => ({
                    key: newKey(),
                    recipeId: item.recipeId || '',
                    clientTitle: item.clientTitle,
                    clientDescription: item.clientDescription || '',
                    showDietary: item.showDietary,
                    dietaryDisplay: item.dietaryDisplay || '',
                    allergenDisplay: item.allergenDisplay || '',
                    internalItemNotes: item.internalItemNotes || '',
                  }))
                : [],
          }))
        : [],
  }
}

type Props = {
  mode: 'create' | 'edit'
  menuId?: string
  initial?: MenuDetail | null
  clients: ClientOption[]
  inquiries: RelOption[]
  events: RelOption[]
  recipes: RecipeOption[]
}

export default function MenuBuilderForm({
  mode,
  menuId,
  initial,
  clients,
  inquiries,
  events,
  recipes,
}: Props) {
  const router = useRouter()
  const formId = useId()
  const [form, setForm] = useState<FormState>(() => fromDetail(initial))
  const [structureId, setStructureId] =
    useState<MenuStructurePresetId>('privateDinner')
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        id: client.id,
        label: client.label || client.name,
      })),
    [clients],
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function patch(partial: Partial<FormState>) {
    setDirty(true)
    setMessage(null)
    setError(null)
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function applyStructure(nextId: MenuStructurePresetId) {
    setStructureId(nextId)
    patch({ sections: sectionsFromPreset(nextId) })
  }

  function updateSection(index: number, next: SectionDraft) {
    const sections = [...form.sections]
    sections[index] = next
    patch({ sections })
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(null)
    setMessage(null)

    if (!form.client) {
      setError('Please choose a client.')
      return
    }
    if (!form.internalName.trim()) {
      setError('Please add an internal menu name.')
      return
    }
    if (!form.occasionTitle.trim()) {
      setError('Please add a client-facing occasion title.')
      return
    }

    const payload = {
      internalName: form.internalName,
      client: form.client,
      inquiry: form.inquiry || null,
      event: form.event || null,
      occasionTitle: form.occasionTitle,
      serviceDate: form.serviceDate || null,
      guestCount: form.guestCount,
      introductoryMessage: form.introductoryMessage,
      pricingPresentation: form.pricingPresentation,
      displayInvestment: form.displayInvestment,
      internalNotes: form.internalNotes,
      status: form.status,
      sections: form.sections.map((section) => ({
        sectionName: section.sectionName,
        items: section.items.map((item) => ({
          recipe: item.recipeId || null,
          clientTitle: item.clientTitle,
          clientDescription: item.clientDescription,
          showDietary: item.showDietary,
          dietaryDisplay: item.dietaryDisplay,
          allergenDisplay: item.allergenDisplay,
          internalItemNotes: item.internalItemNotes,
        })),
      })),
    }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createMenu(payload)
          : await updateMenu(menuId, payload)

      if (!result.ok) {
        setError(result.message)
        return
      }

      setDirty(false)
      setMessage('Menu saved.')
      router.push(`/os/menus/${result.id}`)
      router.refresh()
    })
  }

  return (
    <form
      className={styles.builderForm}
      onSubmit={onSubmit}
      aria-busy={pending}
      noValidate
    >
      {dirty ? (
        <p className={styles.unsavedBanner} role="status">
          You have unsaved changes.
        </p>
      ) : null}

      {mode === 'create' ? (
        <section
          className={styles.builderSection}
          aria-labelledby={`${formId}-structure`}
        >
          <h2 id={`${formId}-structure`} className={styles.builderSectionTitle}>
            Start with a structure
          </h2>
          <p className={styles.builderHint}>
            Optional. Chooses section names only — no dishes or pricing are added.
          </p>
          <div
            className={styles.structureChoices}
            role="radiogroup"
            aria-label="Menu structure"
          >
            {MENU_STRUCTURE_PRESETS.map((preset) => {
              const selected = structureId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.structureChoice} ${selected ? styles.structureChoiceActive : ''}`}
                  disabled={pending}
                  onClick={() => applyStructure(preset.id)}
                >
                  <span className={styles.structureChoiceLabel}>{preset.label}</span>
                  <span className={styles.structureChoiceMeta}>
                    {preset.description}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className={styles.builderSection} aria-labelledby={`${formId}-meta`}>
        <h2 id={`${formId}-meta`} className={styles.builderSectionTitle}>
          Menu details
        </h2>
        <p className={styles.builderHint}>
          Internal fields are marked and never appear on the client review page.
        </p>
        <div className={styles.builderGrid}>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-internal`}
          >
            Internal menu name
            <span className={styles.internalBadge}>Internal</span>
            <input
              id={`${formId}-internal`}
              className={styles.fieldControl}
              value={form.internalName}
              required
              disabled={pending}
              onChange={(e) => patch({ internalName: e.target.value })}
            />
          </label>

          <div className={styles.fieldFull}>
            <RelationshipSelect
              id={`${formId}-client`}
              label="Client"
              value={form.client}
              options={clientOptions}
              required
              disabled={pending}
              searchPlaceholder="Filter clients by name or email"
              emptyMessage="No clients match that filter."
              onChange={(next) =>
                patch({
                  client: next,
                  inquiry: '',
                  event: '',
                })
              }
            />
          </div>

          <label className={styles.fieldLabel} htmlFor={`${formId}-occasion`}>
            Occasion / event title
            <input
              id={`${formId}-occasion`}
              className={styles.fieldControl}
              value={form.occasionTitle}
              required
              disabled={pending}
              onChange={(e) => patch({ occasionTitle: e.target.value })}
            />
          </label>

          <div>
            <RelationshipSelect
              id={`${formId}-inquiry`}
              label="Inquiry (optional)"
              value={form.inquiry}
              options={inquiries}
              disabled={pending}
              optionalNoneLabel="None"
              searchPlaceholder="Filter inquiries"
              emptyMessage="No inquiries match that filter."
              onChange={(next) => patch({ inquiry: next })}
            />
          </div>

          <div>
            <RelationshipSelect
              id={`${formId}-event`}
              label="Event (optional)"
              value={form.event}
              options={events}
              disabled={pending}
              optionalNoneLabel="None"
              searchPlaceholder="Filter events"
              emptyMessage="No events match that filter."
              onChange={(next) => patch({ event: next })}
            />
          </div>

          <label className={styles.fieldLabel} htmlFor={`${formId}-date`}>
            Service date
            <input
              id={`${formId}-date`}
              type="date"
              className={styles.fieldControl}
              value={form.serviceDate}
              disabled={pending}
              onChange={(e) => patch({ serviceDate: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-guests`}>
            Guest count
            <input
              id={`${formId}-guests`}
              className={styles.fieldControl}
              inputMode="numeric"
              value={form.guestCount}
              disabled={pending}
              onChange={(e) => patch({ guestCount: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-status`}>
            Status
            <select
              id={`${formId}-status`}
              className={styles.fieldControl}
              value={form.status}
              disabled={pending}
              onChange={(e) => patch({ status: e.target.value })}
            >
              {MENU_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {MENU_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-intro`}
          >
            Introductory message
            <textarea
              id={`${formId}-intro`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.introductoryMessage}
              disabled={pending}
              onChange={(e) => patch({ introductoryMessage: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-sections`}>
        <div className={styles.repeatToolbar}>
          <h2 id={`${formId}-sections`} className={styles.builderSectionTitle}>
            Menu sections
          </h2>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonQuiet}`}
            disabled={pending}
            onClick={() =>
              patch({ sections: [...form.sections, emptySection('Custom section')] })
            }
          >
            Add section
          </button>
        </div>
        <p className={styles.builderHint}>
          Add dishes to each section. Client titles and descriptions do not modify
          linked recipes.
        </p>

        {form.sections.length === 0 ? (
          <p className={styles.empty}>
            No sections yet. Choose a structure above or add a section to begin.
          </p>
        ) : null}

        <div className={styles.repeatBlock}>
          {form.sections.map((section, sectionIndex) => (
            <div key={section.key} className={styles.repeatCard}>
              <div className={styles.repeatToolbar}>
                <label className={styles.fieldLabel} style={{ flex: 1 }}>
                  Section name
                  <input
                    className={styles.fieldControl}
                    value={section.sectionName}
                    required
                    disabled={pending}
                    onChange={(e) =>
                      updateSection(sectionIndex, {
                        ...section,
                        sectionName: e.target.value,
                      })
                    }
                  />
                </label>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={pending || sectionIndex === 0}
                    onClick={() => {
                      const next = [...form.sections]
                      const [moved] = next.splice(sectionIndex, 1)
                      next.splice(sectionIndex - 1, 0, moved)
                      patch({ sections: next })
                    }}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={pending || sectionIndex === form.sections.length - 1}
                    onClick={() => {
                      const next = [...form.sections]
                      const [moved] = next.splice(sectionIndex, 1)
                      next.splice(sectionIndex + 1, 0, moved)
                      patch({ sections: next })
                    }}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={pending}
                    onClick={() =>
                      patch({
                        sections: form.sections.filter((_, i) => i !== sectionIndex),
                      })
                    }
                  >
                    Remove section
                  </button>
                </div>
              </div>

              <div className={styles.repeatBlock}>
                {section.items.map((item, itemIndex) => (
                  <div key={item.key} className={styles.repeatCard}>
                    <div className={styles.builderGrid}>
                      <label className={`${styles.fieldLabel} ${styles.fieldFull}`}>
                        Link saved recipe (optional)
                        <select
                          className={styles.fieldControl}
                          value={item.recipeId}
                          disabled={pending}
                          onChange={(e) => {
                            const recipeId = e.target.value
                            const recipe = recipes.find((r) => r.id === recipeId)
                            const nextItems = [...section.items]
                            nextItems[itemIndex] = {
                              ...item,
                              recipeId,
                              clientTitle:
                                item.clientTitle || recipe?.name || item.clientTitle,
                            }
                            updateSection(sectionIndex, {
                              ...section,
                              items: nextItems,
                            })
                          }}
                        >
                          <option value="">Custom item (no recipe)</option>
                          {recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name} · {recipe.categoryLabel}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={`${styles.fieldLabel} ${styles.fieldFull}`}>
                        Client-facing title
                        <input
                          className={styles.fieldControl}
                          value={item.clientTitle}
                          required
                          disabled={pending}
                          onChange={(e) => {
                            const nextItems = [...section.items]
                            nextItems[itemIndex] = {
                              ...item,
                              clientTitle: e.target.value,
                            }
                            updateSection(sectionIndex, {
                              ...section,
                              items: nextItems,
                            })
                          }}
                        />
                      </label>
                      <label className={`${styles.fieldLabel} ${styles.fieldFull}`}>
                        Client-facing description
                        <textarea
                          className={`${styles.fieldControl} ${styles.textareaControl}`}
                          value={item.clientDescription}
                          disabled={pending}
                          onChange={(e) => {
                            const nextItems = [...section.items]
                            nextItems[itemIndex] = {
                              ...item,
                              clientDescription: e.target.value,
                            }
                            updateSection(sectionIndex, {
                              ...section,
                              items: nextItems,
                            })
                          }}
                        />
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={item.showDietary}
                          disabled={pending}
                          onChange={(e) => {
                            const nextItems = [...section.items]
                            nextItems[itemIndex] = {
                              ...item,
                              showDietary: e.target.checked,
                            }
                            updateSection(sectionIndex, {
                              ...section,
                              items: nextItems,
                            })
                          }}
                        />
                        Show dietary / allergen labels
                      </label>
                      {item.showDietary ? (
                        <>
                          <label className={styles.fieldLabel}>
                            Dietary display
                            <input
                              className={styles.fieldControl}
                              value={item.dietaryDisplay}
                              disabled={pending}
                              onChange={(e) => {
                                const nextItems = [...section.items]
                                nextItems[itemIndex] = {
                                  ...item,
                                  dietaryDisplay: e.target.value,
                                }
                                updateSection(sectionIndex, {
                                  ...section,
                                  items: nextItems,
                                })
                              }}
                            />
                          </label>
                          <label className={styles.fieldLabel}>
                            Allergen display
                            <input
                              className={styles.fieldControl}
                              value={item.allergenDisplay}
                              disabled={pending}
                              onChange={(e) => {
                                const nextItems = [...section.items]
                                nextItems[itemIndex] = {
                                  ...item,
                                  allergenDisplay: e.target.value,
                                }
                                updateSection(sectionIndex, {
                                  ...section,
                                  items: nextItems,
                                })
                              }}
                            />
                          </label>
                        </>
                      ) : null}
                      <label className={`${styles.fieldLabel} ${styles.fieldFull}`}>
                        Internal item notes
                        <span className={styles.internalBadge}>Internal</span>
                        <textarea
                          className={`${styles.fieldControl} ${styles.textareaControl}`}
                          value={item.internalItemNotes}
                          disabled={pending}
                          onChange={(e) => {
                            const nextItems = [...section.items]
                            nextItems[itemIndex] = {
                              ...item,
                              internalItemNotes: e.target.value,
                            }
                            updateSection(sectionIndex, {
                              ...section,
                              items: nextItems,
                            })
                          }}
                        />
                      </label>
                    </div>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.textButton}
                        disabled={pending || itemIndex === 0}
                        onClick={() => {
                          const nextItems = [...section.items]
                          const [moved] = nextItems.splice(itemIndex, 1)
                          nextItems.splice(itemIndex - 1, 0, moved)
                          updateSection(sectionIndex, {
                            ...section,
                            items: nextItems,
                          })
                        }}
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        className={styles.textButton}
                        disabled={
                          pending || itemIndex === section.items.length - 1
                        }
                        onClick={() => {
                          const nextItems = [...section.items]
                          const [moved] = nextItems.splice(itemIndex, 1)
                          nextItems.splice(itemIndex + 1, 0, moved)
                          updateSection(sectionIndex, {
                            ...section,
                            items: nextItems,
                          })
                        }}
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        className={styles.textButton}
                        disabled={pending}
                        onClick={() =>
                          updateSection(sectionIndex, {
                            ...section,
                            items: section.items.filter((_, i) => i !== itemIndex),
                          })
                        }
                      >
                        Remove item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={`${styles.button} ${styles.buttonQuiet}`}
                disabled={pending}
                onClick={() =>
                  updateSection(sectionIndex, {
                    ...section,
                    items: [...section.items, emptyItem()],
                  })
                }
              >
                Add menu item
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby={`${formId}-pricing`}>
        <h2 id={`${formId}-pricing`} className={styles.builderSectionTitle}>
          Pricing presentation
        </h2>
        <p className={styles.builderHint}>
          Optional client-facing investment language only. Never include food cost or
          margin.
        </p>
        <div className={styles.builderGrid}>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-pricing`}
          >
            Pricing note
            <textarea
              id={`${formId}-pricing`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.pricingPresentation}
              disabled={pending}
              onChange={(e) => patch({ pricingPresentation: e.target.value })}
            />
          </label>
          <label className={styles.fieldLabel} htmlFor={`${formId}-investment`}>
            Display investment (USD)
            <input
              id={`${formId}-investment`}
              className={styles.fieldControl}
              inputMode="decimal"
              value={form.displayInvestment}
              disabled={pending}
              onChange={(e) => patch({ displayInvestment: e.target.value })}
            />
          </label>
          <label
            className={`${styles.fieldLabel} ${styles.fieldFull}`}
            htmlFor={`${formId}-internal-notes`}
          >
            Internal notes
            <span className={styles.internalBadge}>Internal</span>
            <textarea
              id={`${formId}-internal-notes`}
              className={`${styles.fieldControl} ${styles.textareaControl}`}
              value={form.internalNotes}
              disabled={pending}
              onChange={(e) => patch({ internalNotes: e.target.value })}
            />
          </label>
        </div>
      </section>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={pending}>
          {pending
            ? 'Saving…'
            : mode === 'create'
              ? 'Save menu'
              : 'Save changes'}
        </button>
      </div>

      <div aria-live="polite">
        {message ? <p className={styles.formSuccess}>{message}</p> : null}
        {error ? <p className={styles.sectionError}>{error}</p> : null}
      </div>
    </form>
  )
}
