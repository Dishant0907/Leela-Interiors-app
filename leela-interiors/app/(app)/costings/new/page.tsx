'use client'

import { useState, useEffect } from 'react'
import { CostingForm } from '@/components/costing/CostingForm'
import { CostingPreview } from '@/components/costing/CostingPreview'
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
  const [previewState, setPreviewState] = useState<CostingFormState>(EMPTY_STATE)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const totals = calculateTotals(previewState)

  useEffect(() => {
    fetch('/api/business-profile')
      .then(r => r.json())
      .then(json => { if (json.data) setBusinessProfile(json.data) })
      .catch(() => {})
  }, [])

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="px-6 pt-6">
        <FirstRunBanner show={!businessProfile?.gstin || !businessProfile?.business_name} />
      </div>
      <div className="flex flex-1">
      {/* Left: form (60%) */}
      <div className="w-3/5 overflow-y-auto">
        <CostingForm onUpdate={setPreviewState} />
      </div>

      {/* Right: live preview (40%) */}
      <div className="w-2/5 border-l border-border bg-gray-100 overflow-y-auto">
        <div className="sticky top-0 max-h-screen overflow-y-auto p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Live Preview</p>
          <div className="shadow-sm rounded overflow-hidden">
            <CostingPreview formState={previewState} totals={totals} businessProfile={businessProfile} />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
