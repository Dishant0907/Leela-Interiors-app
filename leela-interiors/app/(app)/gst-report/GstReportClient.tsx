'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatINR } from '@/lib/format'

type InvoiceRow = {
  id: string
  invoice_number: string
  invoice_date: string
  client_name: string | null
  client_gstin: string | null
  kitchen_total: number
  accessories_total: number
  hardware_total: number
  civil_total: number
  freight: number
  cgst_rate: number
  cgst_amount: number
  sgst_rate: number
  sgst_amount: number
  igst_rate: number
  igst_amount: number
  gst_amount: number
  grand_total: number
}

interface Props {
  invoices: InvoiceRow[]
  month: number
  year: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function GstReportClient({ invoices, month, year }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(m: number, y: number) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('month', String(m))
    p.set('year', String(y))
    router.push(`?${p.toString()}`)
  }

  // Summary totals
  const totalTaxable = invoices.reduce((s, i) => s + i.kitchen_total + i.accessories_total + i.hardware_total + i.civil_total, 0)
  const totalCgst = invoices.reduce((s, i) => s + i.cgst_amount, 0)
  const totalSgst = invoices.reduce((s, i) => s + i.sgst_amount, 0)
  const totalIgst = invoices.reduce((s, i) => s + i.igst_amount, 0)
  const totalTax = invoices.reduce((s, i) => s + i.gst_amount, 0)

  // Generate year options (current year ± 2)
  const yearOptions = Array.from({ length: 5 }, (_, i) => year - 2 + i)

  function exportCsv() {
    const header = 'Invoice No.,Date,Client,Client GSTIN,Taxable Value,CGST Rate,CGST Amount,SGST Rate,SGST Amount,IGST Rate,IGST Amount,Grand Total'
    const rows = invoices.map(i => {
      const taxable = i.kitchen_total + i.accessories_total + i.hardware_total + i.civil_total
      return [
        i.invoice_number,
        formatShortDate(i.invoice_date),
        i.client_name ?? '',
        i.client_gstin ?? '',
        taxable.toFixed(2),
        i.cgst_rate,
        i.cgst_amount.toFixed(2),
        i.sgst_rate,
        i.sgst_amount.toFixed(2),
        i.igst_rate,
        i.igst_amount.toFixed(2),
        i.grand_total.toFixed(2),
      ].join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GST-Report-${MONTHS[month - 1]}-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Month/year picker */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={month}
          onChange={e => navigate(Number(e.target.value), year)}
          className="rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary"
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => navigate(month, Number(e.target.value))}
          className="rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary"
        >
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className="text-sm text-text-muted">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <SummaryCard label="Taxable Value" value={formatINR(totalTaxable)} />
        <SummaryCard label="Total CGST" value={formatINR(totalCgst)} />
        <SummaryCard label="Total SGST" value={formatINR(totalSgst)} />
        <SummaryCard label="Total IGST" value={formatINR(totalIgst)} />
        <SummaryCard label="Total Tax" value={formatINR(totalTax)} accent />
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={exportCsv}
          disabled={invoices.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Breakdown table */}
      {invoices.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface p-10 text-center text-sm text-text-muted">
          No invoices for {MONTHS[month - 1]} {year}.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-surface border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Invoice No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Client GSTIN</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Taxable Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">CGST</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">SGST</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">IGST</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Total Tax</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map(inv => {
                  const taxable = inv.kitchen_total + inv.accessories_total + inv.hardware_total + inv.civil_total
                  return (
                    <tr key={inv.id} className="hover:bg-bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatShortDate(inv.invoice_date)}</td>
                      <td className="px-4 py-3 text-text-primary">{inv.client_name ?? '—'}</td>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs">{inv.client_gstin ?? '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(taxable)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-muted">{formatINR(inv.cgst_amount)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-muted">{formatINR(inv.sgst_amount)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-muted">{formatINR(inv.igst_amount)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-text-primary">{formatINR(inv.gst_amount)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-[#8B2035]">{formatINR(inv.grand_total)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-bg-surface font-semibold">
                  <td colSpan={4} className="px-4 py-3 text-text-muted text-xs uppercase tracking-wider">Totals</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalTaxable)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalCgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalSgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalIgst)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-primary">{formatINR(totalTax)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#8B2035]">{formatINR(invoices.reduce((s, i) => s + i.grand_total, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-[#8B2035]/20 bg-[#8B2035]/5' : 'border-border bg-bg-surface'}`}>
      <div className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${accent ? 'text-[#8B2035]' : 'text-text-primary'}`}>{value}</div>
    </div>
  )
}
