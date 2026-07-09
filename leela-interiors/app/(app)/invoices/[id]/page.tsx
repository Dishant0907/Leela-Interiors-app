import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { InvoicePreview } from '@/components/costing/InvoicePreview'
import { PrintButton } from '@/components/costing/PrintButton'
import { PaymentStages } from '@/components/invoice/PaymentStages'
import { DeleteInvoiceButton } from './DeleteInvoiceButton'
import { FirstRunBanner } from '@/components/shared/FirstRunBanner'
import { formatDate } from '@/lib/format'
import type { CostingFormState, Totals } from '@/types/costing'
import type { LineItems } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: invoice, error }, { data: profile }] = await Promise.all([
    supabase
      .from('invoices')
      .select(
        '*, costings(client_name, client_phone, client_address, client_reference, shutter_top, shutter_base, cabinet_color, notes)',
      )
      .eq('id', id)
      .single(),
    supabase
      .from('business_profile')
      .select('business_name, gstin, address, state_code, pan, bank_account_no, bank_ifsc, bank_name, terms_conditions')
      .maybeSingle(),
  ])

  if (error || !invoice) {
    notFound()
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('id, stage, amount, paid_at, notes')
    .eq('invoice_id', id)
    .order('created_at', { ascending: true })

  const costing = (invoice.costings ?? null) as {
    client_name: string | null
    client_phone: string | null
    client_address: string | null
    client_reference: string | null
    shutter_top: string | null
    shutter_base: string | null
    cabinet_color: string | null
    notes: string | null
  } | null

  const lineItems = invoice.line_items as LineItems

  const formState: CostingFormState = {
    clientName: costing?.client_name ?? '',
    clientPhone: costing?.client_phone ?? '',
    clientAddress: costing?.client_address ?? '',
    clientReference: costing?.client_reference ?? '',
    clientGstin: invoice.client_gstin ?? undefined,
    shutterTop: costing?.shutter_top ?? '',
    shutterBase: costing?.shutter_base ?? '',
    cabinetColor: costing?.cabinet_color ?? '',
    sections: lineItems.sections,
    freight: Number(invoice.freight),
    gstRate: Number(invoice.gst_rate),
    transactionType: (invoice.transaction_type ?? 'intra') as 'intra' | 'inter',
    notes: costing?.notes ?? '',
  }

  const totals: Totals = {
    kitchenTotal: Number(invoice.kitchen_total),
    accessoriesTotal: Number(invoice.accessories_total),
    hardwareTotal: Number(invoice.hardware_total),
    civilTotal: Number(invoice.civil_total),
    cgstRate: Number(invoice.cgst_rate),
    sgstRate: Number(invoice.sgst_rate),
    igstRate: Number(invoice.igst_rate),
    cgstAmount: Number(invoice.cgst_amount),
    sgstAmount: Number(invoice.sgst_amount),
    igstAmount: Number(invoice.igst_amount),
    gstAmount: Number(invoice.gst_amount),
    grandTotal: Number(invoice.grand_total),
  }

  const displayDate = invoice.invoice_date ? formatDate(invoice.invoice_date) : undefined

  const businessProfile = profile
    ? {
        business_name: profile.business_name,
        gstin: profile.gstin,
        address: profile.address,
        state_code: profile.state_code,
        pan: profile.pan,
        bank_account_no: profile.bank_account_no,
        bank_ifsc: profile.bank_ifsc,
        bank_name: profile.bank_name,
        terms_conditions: profile.terms_conditions,
      }
    : null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <FirstRunBanner show={!businessProfile?.gstin || !businessProfile?.business_name} />
      {/* Action bar — hidden in print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              {invoice.invoice_number}
            </h1>
            {costing?.client_name && (
              <p className="text-sm text-text-muted mt-0.5">{costing.client_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
          <DeleteInvoiceButton invoiceId={id} />
        </div>
      </div>

      {/* Invoice document — full width when printing */}
      <div className="shadow-sm rounded overflow-hidden print:shadow-none print:rounded-none">
        <InvoicePreview
          formState={formState}
          totals={totals}
          invoiceNumber={invoice.invoice_number}
          date={displayDate}
          businessProfile={businessProfile}
        />
      </div>

      <PaymentStages
        invoice={{ id: invoice.id, grand_total: Math.round(totals.grandTotal) }}
        existingPayments={payments ?? []}
      />
    </div>
  )
}
