import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { GstReportClient } from './GstReportClient'

export const dynamic = 'force-dynamic'

export default async function GstReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const { month: monthStr, year: yearStr } = await searchParams
  const now = new Date()
  const month = Number(monthStr) || now.getMonth() + 1
  const year = Number(yearStr) || now.getFullYear()

  // Build date range for the selected month (invoice_date is a plain date column — no timezone conversion)
  const pad = (n: number) => String(n).padStart(2, '0')
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const start = `${year}-${pad(month)}-01`
  const end = `${nextYear}-${pad(nextMonth)}-01`

  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      invoice_date,
      client_gstin,
      kitchen_total,
      accessories_total,
      hardware_total,
      civil_total,
      freight,
      cgst_rate,
      cgst_amount,
      sgst_rate,
      sgst_amount,
      igst_rate,
      igst_amount,
      gst_amount,
      grand_total,
      costings(client_name)
    `)
    .gte('invoice_date', start)
    .lt('invoice_date', end)
    .order('invoice_date', { ascending: true })

  const rows = (invoices ?? []).map(inv => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date ?? '',
    client_name: (inv.costings as unknown as { client_name: string | null } | null)?.client_name ?? null,
    client_gstin: inv.client_gstin ?? null,
    kitchen_total: Number(inv.kitchen_total),
    accessories_total: Number(inv.accessories_total),
    hardware_total: Number(inv.hardware_total),
    civil_total: Number(inv.civil_total),
    freight: Number(inv.freight),
    cgst_rate: Number(inv.cgst_rate),
    cgst_amount: Number(inv.cgst_amount),
    sgst_rate: Number(inv.sgst_rate),
    sgst_amount: Number(inv.sgst_amount),
    igst_rate: Number(inv.igst_rate),
    igst_amount: Number(inv.igst_amount),
    gst_amount: Number(inv.gst_amount),
    grand_total: Number(inv.grand_total),
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-1">GST Report</h1>
      <p className="text-sm text-text-muted mb-6">Monthly summary of invoices for GST filing.</p>
      <Suspense>
        <GstReportClient invoices={rows} month={month} year={year} />
      </Suspense>
    </div>
  )
}
