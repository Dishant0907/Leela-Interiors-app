import React from 'react'
import { formatINR, formatDate } from '@/lib/format'
import { UNIT_LABELS, type Unit } from '@/lib/constants'
import type { CostingFormState, Totals, BusinessProfile } from '@/types/costing'

const SECTION_KEYS = ['kitchen', 'accessories', 'hardware', 'civil'] as const
const SECTION_LABELS: Record<string, string> = {
  kitchen: 'Kitchen Cabinet Work',
  accessories: 'Accessories',
  hardware: 'Hardware',
  civil: 'Civil Work',
}

interface CostingPreviewProps {
  formState: CostingFormState
  totals: Totals
  costingNumber?: string
  date?: string
  businessProfile?: BusinessProfile | null
}

export function CostingPreview({ formState, totals, costingNumber, date, businessProfile }: CostingPreviewProps) {
  const displayDate = date ?? (formState.costingDate ? formatDate(formState.costingDate) : formatDate(new Date()))
  const transactionType = formState.transactionType ?? 'intra'

  const populatedSections = SECTION_KEYS.filter(
    (key) => formState.sections[key].length > 0,
  )

  const subtotal =
    totals.kitchenTotal +
    totals.accessoriesTotal +
    totals.hardwareTotal +
    totals.civilTotal

  const grandTotalRounded = Math.round(totals.grandTotal)
  const roundOff = grandTotalRounded - totals.grandTotal

  return (
    <div className="bg-white text-[13px] text-gray-900 font-sans leading-snug p-8 print:p-0">
      {/* ── Logo + Company name + Business profile ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-2 border-gray-900 flex items-center justify-center shrink-0">
            <span className="font-bold text-base leading-none">LI</span>
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.25em] uppercase">
              {businessProfile?.business_name ?? 'Leela Interiors'}
            </div>
            {businessProfile && (
              <div className="text-[10px] text-gray-600 mt-0.5 max-w-xs">
                {businessProfile.address}
              </div>
            )}
            {businessProfile && (
              <div className="text-[10px] text-gray-600 mt-0.5">
                GSTIN: <span className="font-medium">{businessProfile.gstin}</span>
                {businessProfile.pan && (
                  <span className="ml-3">PAN: <span className="font-medium">{businessProfile.pan}</span></span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="text-center mb-5">
        <div className="text-[3rem] font-black tracking-[0.2em] uppercase leading-none">
          Costing
        </div>
        {costingNumber ? (
          <div className="mt-1.5 text-[10px] tracking-widest text-gray-700 uppercase">
            Costing No.{' '}
            <span className="font-bold text-[#8B2035]">#{costingNumber}</span>
          </div>
        ) : (
          <div className="mt-1.5 text-[10px] tracking-widest text-gray-600 uppercase">
            Draft
          </div>
        )}
      </div>

      {/* ── Billed To + Date ── */}
      <div className="flex justify-between gap-6 mb-5">
        <div>
          <div className="text-[9px] uppercase tracking-[0.15em] text-gray-600 mb-1">
            Billed To
          </div>
          <div className="font-semibold text-[15px]">
            {formState.clientName || (
              <span className="text-gray-600 italic font-normal text-sm">Client name</span>
            )}
          </div>
          {formState.clientAddress && (
            <div className="text-gray-700 text-xs mt-0.5 max-w-55">
              {formState.clientAddress}
            </div>
          )}
          {formState.clientPhone && (
            <div className="text-gray-700 text-xs mt-0.5">{formState.clientPhone}</div>
          )}
          {formState.clientReference && (
            <div className="text-gray-600 text-xs mt-0.5 italic">{formState.clientReference}</div>
          )}
          {formState.clientGstin && (
            <div className="text-gray-600 text-xs mt-0.5">
              GSTIN: <span className="font-medium">{formState.clientGstin}</span>
            </div>
          )}
          <div className="text-gray-600 mt-2">—</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[9px] uppercase tracking-[0.15em] text-gray-600 mb-1">Date</div>
          <div className="font-semibold text-[15px]">{displayDate}</div>
        </div>
      </div>

      {/* ── Line items table ── */}
      <table className="w-full border-collapse text-xs mb-4">
        <thead>
          <tr className="border-t border-b border-gray-300">
            <th className="text-left py-2 pr-3 text-[9px] uppercase tracking-[0.15em] text-gray-600 font-medium">
              Description
            </th>
            <th className="text-center py-2 px-2 text-[9px] uppercase tracking-[0.15em] text-gray-600 font-medium w-14">
              HSN/SAC
            </th>
            <th className="text-center py-2 px-2 text-[9px] uppercase tracking-[0.15em] text-gray-600 font-medium w-10">
              Qty
            </th>
            <th className="text-right py-2 px-2 text-[9px] uppercase tracking-[0.15em] text-gray-600 font-medium w-20">
              Rate
            </th>
            <th className="text-right py-2 pl-2 text-[9px] uppercase tracking-[0.15em] text-gray-600 font-medium w-24">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {populatedSections.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-gray-600 italic text-center">
                No items added yet.
              </td>
            </tr>
          ) : (
            populatedSections.map((key) => {
              const rows = formState.sections[key]
              const hsnValues = rows.map(r => r.hsn_sac).filter(Boolean)
              const allSameHsn = hsnValues.length === rows.length && hsnValues.length > 0 && new Set(hsnValues).size === 1
              const sectionHsn = allSameHsn ? hsnValues[0] : null

              return (
                <React.Fragment key={key}>
                  {/* Section header row — kitchen label suppressed since this section also covers wardrobe work */}
                  {key !== 'kitchen' && (
                    <tr>
                      <td
                        colSpan={5}
                        className="pt-4 pb-1.5 font-bold text-[10px] uppercase tracking-[0.12em] text-gray-900 border-t border-gray-200"
                      >
                        {SECTION_LABELS[key]}
                        {sectionHsn && (
                          <span className="ml-2 font-normal text-gray-500 normal-case tracking-normal">
                            (HSN/SAC: {sectionHsn})
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                  {/* Item rows */}
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-1.5 pr-3 text-gray-700">{row.description || '—'}</td>
                      <td className="py-1.5 px-2 text-center text-gray-500 text-[10px] font-mono">
                        {sectionHsn ? '—' : (row.hsn_sac || '—')}
                      </td>
                      <td className="py-1.5 px-2 text-center text-gray-700">
                        {row.qty ? `${row.qty} ${UNIT_LABELS[row.unit as Unit] ?? row.unit}` : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-right text-gray-700">
                        {row.rate ? formatINR(row.rate) : '—'}
                      </td>
                      <td className="py-1.5 pl-2 text-right font-bold text-[#8B2035]">
                        {row.amount ? formatINR(row.amount) : '—'}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })
          )}

          {/* Freight as "Other Charges" section */}
          {formState.freight > 0 && (
            <React.Fragment>
              <tr>
                <td
                  colSpan={5}
                  className="pt-4 pb-1.5 font-bold text-[10px] uppercase tracking-[0.12em] text-gray-900 border-t border-gray-200"
                >
                  Other Charges
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-1.5 pr-3 text-gray-700">Freight &amp; Fitting</td>
                <td className="py-1.5 px-2 text-center text-gray-500">—</td>
                <td className="py-1.5 px-2 text-center text-gray-700">1</td>
                <td className="py-1.5 px-2 text-right text-gray-700">
                  {formatINR(formState.freight)}
                </td>
                <td className="py-1.5 pl-2 text-right font-bold text-[#8B2035]">
                  {formatINR(formState.freight)}
                </td>
              </tr>
            </React.Fragment>
          )}
        </tbody>
      </table>

      {/* ── GST-compliant totals block ── */}
      <div className="flex justify-end mb-5">
        <div className="w-64">
          <div className="flex justify-between py-1.5 border-t border-gray-200 text-xs text-gray-700">
            <span>Taxable Value</span>
            <span className="font-medium text-gray-900">{formatINR(subtotal)}</span>
          </div>
          {transactionType === 'intra' ? (
            <>
              <div className="flex justify-between py-1.5 border-t border-gray-200 text-xs text-gray-700">
                <span>CGST @ {totals.cgstRate}%</span>
                <span className="font-medium text-gray-900">{formatINR(totals.cgstAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-t border-gray-200 text-xs text-gray-700">
                <span>SGST @ {totals.sgstRate}%</span>
                <span className="font-medium text-gray-900">{formatINR(totals.sgstAmount)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-1.5 border-t border-gray-200 text-xs text-gray-700">
              <span>IGST @ {totals.igstRate}%</span>
              <span className="font-medium text-gray-900">{formatINR(totals.igstAmount)}</span>
            </div>
          )}
          {roundOff !== 0 && (
            <div className="flex justify-between py-1.5 border-t border-gray-200 text-xs text-gray-700">
              <span>Round Off</span>
              <span className="font-medium text-gray-900">
                {roundOff > 0 ? '+' : '−'}{formatINR(Math.abs(roundOff))}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-t-2 border-gray-900 mt-0.5">
            <span className="font-bold text-sm uppercase tracking-wider">Grand Total</span>
            <span className="font-bold text-base text-[#8B2035]">
              {formatINR(grandTotalRounded)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Colour spec ── */}
      <div className="border-t border-b border-gray-200 py-2 flex gap-6 text-[10px] text-gray-600 mb-4">
        <span>
          Top Shutter:{' '}
          <span className="font-medium text-gray-900">
            {formState.shutterTop || '—'}
          </span>
        </span>
        <span>
          Base Shutter:{' '}
          <span className="font-medium text-gray-900">
            {formState.shutterBase || '—'}
          </span>
        </span>
        <span>
          Cabinet:{' '}
          <span className="font-medium text-gray-900">
            {formState.cabinetColor || '—'}
          </span>
        </span>
      </div>

      {/* ── Terms & Notes ── */}
      {formState.notes && (
        <div className="mb-5">
          <div className="text-[9px] uppercase tracking-[0.15em] text-gray-600 font-medium mb-1.5">
            Terms &amp; Notes
          </div>
          <div className="text-[11px] text-gray-700 whitespace-pre-line leading-relaxed">
            {formState.notes}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="border-t border-gray-200 pt-3 text-center text-[10px] text-gray-600 tracking-wide">
        {businessProfile?.business_name ?? 'Leela Interiors'} · Gurgaon, Haryana
      </div>
    </div>
  )
}
