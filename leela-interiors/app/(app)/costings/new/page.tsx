'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CostingForm } from '@/components/costing/CostingForm'
import { CostingPreview } from '@/components/costing/CostingPreview'
import { LivePreviewPane } from '@/components/costing/LivePreviewPane'
import { FirstRunBanner } from '@/components/shared/FirstRunBanner'
import { calculateTotals } from '@/lib/costing'
import { GST_RATE } from '@/lib/constants'
import type { CostingFormState, BusinessProfile } from '@/types/costing'

const EMPTY_STATE: CostingFormState = {
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  clientReference: '',
  shutterTop: '',
  shutterBase: '',
  cabinetColor: '',
  sections: { kitchen: [], accessories: [], hardware: [], civil: [] },
  freight: 0,
  gstRate: GST_RATE,
  transactionType: 'intra',
  notes: '',
}

export default function NewCostingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-muted">Loading…</div>}>
      <NewCostingPageInner />
    </Suspense>
  )
}

function NewCostingPageInner() {
  const searchParams = useSearchParams()
  const duplicateFrom = searchParams.get('duplicateFrom')

  const [initialState, setInitialState] = useState<CostingFormState | null>(null)
  const [previewState, setPreviewState] = useState<CostingFormState>(EMPTY_STATE)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const totals = calculateTotals(previewState)

  useEffect(() => {
    fetch('/api/business-profile')
      .then(r => r.json())
      .then(json => { if (json.data) setBusinessProfile(json.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!duplicateFrom) return

    fetch(`/api/costings/${duplicateFrom}`)
      .then(r => r.json())
      .then(json => {
        const source = json.data as CostingFormState | undefined
        if (!source) return

        // Kitchen sizes carry over; finish is what's changing, so its cost and labels reset.
        const duplicated: CostingFormState = {
          ...source,
          clientId: undefined,
          costingDate: undefined,
          shutterTop: '',
          shutterBase: '',
          cabinetColor: '',
          sections: {
            ...source.sections,
            kitchen: source.sections.kitchen.map(item => ({
              ...item,
              id: crypto.randomUUID(),
              rate: 0,
              amount: 0,
            })),
          },
        }

        setInitialState(duplicated)
        setPreviewState(duplicated)
      })
      .catch(() => {})
  }, [duplicateFrom])

  if (duplicateFrom && !initialState) {
    return <div className="p-6 text-text-muted">Loading…</div>
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <FirstRunBanner show={!businessProfile?.gstin || !businessProfile?.business_name} />
      </div>
      <div className="flex flex-1">
      {/* Form (full width on mobile, 60% on lg+) */}
      <div className="w-full min-w-0 overflow-y-auto lg:w-3/5">
        <CostingForm onUpdate={setPreviewState} initialState={initialState ?? undefined} />
      </div>

      {/* Live preview: side pane on lg+, overlay on mobile */}
      <LivePreviewPane>
        <CostingPreview formState={previewState} totals={totals} businessProfile={businessProfile} />
      </LivePreviewPane>
      </div>
    </div>
  )
}
