'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CostingForm } from '@/components/costing/CostingForm'
import { CostingPreview } from '@/components/costing/CostingPreview'
import { LivePreviewPane } from '@/components/costing/LivePreviewPane'
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

export default function EditCostingPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [initialState, setInitialState] = useState<CostingFormState | null>(null)
  const [previewState, setPreviewState] = useState<CostingFormState>(EMPTY_STATE)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/costings/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setInitialState(json.data)
          setPreviewState(json.data)
        } else {
          setError(json.error ?? 'Failed to load costing')
        }
      })
      .catch(() => setError('Failed to load costing'))
  }, [id])

  useEffect(() => {
    fetch('/api/business-profile')
      .then(r => r.json())
      .then(json => { if (json.data) setBusinessProfile(json.data) })
      .catch(() => {})
  }, [])

  const totals = calculateTotals(previewState)

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>
  }

  if (!initialState) {
    return <div className="p-6 text-text-muted">Loading…</div>
  }

  return (
    <div className="flex h-full min-h-screen">
      {/* Form (full width on mobile, 60% on lg+) */}
      <div className="w-full min-w-0 overflow-y-auto lg:w-3/5">
        <CostingForm
          onUpdate={setPreviewState}
          initialState={initialState}
          costingId={id}
        />
      </div>

      {/* Live preview: side pane on lg+, overlay on mobile */}
      <LivePreviewPane>
        <CostingPreview formState={previewState} totals={totals} businessProfile={businessProfile} />
      </LivePreviewPane>
    </div>
  )
}
