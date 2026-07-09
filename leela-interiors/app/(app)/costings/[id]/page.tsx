import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CostingPreview } from '@/components/costing/CostingPreview'
import { PrintButton } from '@/components/costing/PrintButton'
import { ConvertToInvoiceButton } from './ConvertToInvoiceButton'
import { DeleteCostingButton } from './DeleteCostingButton'
import { FirstRunBanner } from '@/components/shared/FirstRunBanner'
import { formatDate } from '@/lib/format'
import type { CostingFormState, Totals } from '@/types/costing'
import type { LineItems } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export default async function CostingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: costing, error }, { data: profile }] = await Promise.all([
    supabase.from('costings').select('*').eq('id', id).single(),
    supabase.from('business_profile').select('business_name, gstin, address, state_code, pan').maybeSingle(),
  ])

  if (error || !costing) {
    notFound()
  }

  const lineItems = costing.line_items as LineItems

  const formState: CostingFormState = {
    costingDate: costing.costing_date ?? undefined,
    clientName: costing.client_name ?? '',
    clientPhone: costing.client_phone ?? '',
    clientAddress: costing.client_address ?? '',
    clientReference: costing.client_reference ?? '',
    clientGstin: costing.client_gstin ?? undefined,
    shutterTop: costing.shutter_top ?? '',
    shutterBase: costing.shutter_base ?? '',
    cabinetColor: costing.cabinet_color ?? '',
    sections: lineItems.sections,
    freight: Number(costing.freight),
    gstRate: Number(costing.gst_rate),
    transactionType: (costing.transaction_type ?? 'intra') as 'intra' | 'inter',
    notes: costing.notes ?? '',
  }

  const totals: Totals = {
    kitchenTotal: Number(costing.kitchen_total),
    accessoriesTotal: Number(costing.accessories_total),
    hardwareTotal: Number(costing.hardware_total),
    civilTotal: Number(costing.civil_total),
    cgstRate: Number(costing.cgst_rate),
    sgstRate: Number(costing.sgst_rate),
    igstRate: Number(costing.igst_rate),
    cgstAmount: Number(costing.cgst_amount),
    sgstAmount: Number(costing.sgst_amount),
    igstAmount: Number(costing.igst_amount),
    gstAmount: Number(costing.gst_amount),
    grandTotal: Number(costing.grand_total),
  }

  const displayDate = costing.costing_date ? formatDate(costing.costing_date) : undefined

  const businessProfile = profile
    ? { business_name: profile.business_name, gstin: profile.gstin, address: profile.address, state_code: profile.state_code, pan: profile.pan }
    : null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <FirstRunBanner show={!businessProfile?.gstin || !businessProfile?.business_name} />
      {/* Action bar — hidden in print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/costings"
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Costings
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              {costing.costing_number}
            </h1>
            {costing.client_name && (
              <p className="text-sm text-text-muted mt-0.5">{costing.client_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/costings/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-gray-100 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <ConvertToInvoiceButton costingId={id} />
          <PrintButton />
          <DeleteCostingButton costingId={id} />
        </div>
      </div>

      {/* Costing document — full width when printing */}
      <CostingPreview
        formState={formState}
        totals={totals}
        costingNumber={costing.costing_number}
        date={displayDate}
        businessProfile={businessProfile}
      />
    </div>
  )
}
