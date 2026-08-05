'use client'

import { useState } from 'react'
import styles from '@/app/(os)/os.module.css'
import ConfirmAction from '@/components/os/ConfirmAction'
import RelationshipSelect from '@/components/os/RelationshipSelect'

/** Non-financial fixture controls for director mobile visual QA. */
export default function MobileQaFixtures() {
  const [clientId, setClientId] = useState('fixture-1')
  const [confirmOpen, setConfirmOpen] = useState(true)

  return (
    <>
      <div className={styles.filterBar}>
        <label className={styles.fieldLabel}>
          Sample filter
          <select
            className={`${styles.fieldControl} ${styles.selectControl}`}
            defaultValue="open"
          >
            <option value="open">Open pipeline</option>
            <option value="all">All records</option>
          </select>
        </label>
        <label className={styles.fieldLabel}>
          Search
          <input
            className={styles.fieldControl}
            defaultValue="Sample Client LLC"
            readOnly
          />
        </label>
      </div>

      <RelationshipSelect
        id="mobile-qa-rel"
        label="Sample client"
        value={clientId}
        options={[
          { id: 'fixture-1', label: 'Sample Client LLC' },
          {
            id: 'fixture-2',
            label: 'Very Long Hospitality Partner Name For Overflow',
          },
        ]}
        onChange={setClientId}
      />

      {confirmOpen ? (
        <ConfirmAction
          open
          title="Sample confirmation"
          body="This is a fixture only. No financial action runs from Mobile QA."
          confirmLabel="Looks good"
          cancelLabel="Dismiss"
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
        />
      ) : (
        <button
          type="button"
          className={`${styles.button} ${styles.buttonQuiet}`}
          onClick={() => setConfirmOpen(true)}
        >
          Show sample confirmation
        </button>
      )}

      <div className={styles.formActions}>
        <button type="button" className={styles.button}>
          Sticky primary action
        </button>
        <button type="button" className={`${styles.button} ${styles.buttonQuiet}`}>
          Secondary
        </button>
        <p className={styles.formSuccess}>Success state sample</p>
        <p className={styles.sectionError}>Failure state sample</p>
      </div>
      <p className={styles.fieldHint}>
        Real create/edit forms use a sticky save bar at the bottom of the form.
        This fixture keeps actions in-flow so controls stay visible during visual QA.
      </p>
    </>
  )
}
