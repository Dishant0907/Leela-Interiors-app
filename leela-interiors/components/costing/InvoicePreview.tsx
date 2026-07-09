import React from 'react'
import { formatINR, formatDate, amountInWords } from '@/lib/format'
import { SECTIONS, SECTION_LABELS, UNIT_LABELS, type Unit } from '@/lib/constants'
import type { CostingFormState, Totals, BusinessProfile } from '@/types/costing'

const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa',
  '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '36': 'Telangana', '37': 'Andhra Pradesh',
}

const LABEL = 'text-[9px] uppercase tracking-[0.1em] text-gray-500'
const CELL = 'px-3 py-2'
const META_ROW = 'flex justify-between gap-3 py-0.5'

interface InvoicePreviewProps {
  formState: CostingFormState
  totals: Totals
  invoiceNumber?: string
  date?: string
  businessProfile?: BusinessProfile | null
}

export function InvoicePreview({ formState, totals, invoiceNumber, date, businessProfile }: InvoicePreviewProps) {
  const displayDate = date ?? formatDate(new Date())
  const transactionType = formState.transactionType ?? 'intra'

  const placeOfSupplyCode =
    transactionType === 'inter' && formState.clientGstin
      ? formState.clientGstin.slice(0, 2)
      : (businessProfile?.state_code ?? null)
  const placeOfSupply = placeOfSupplyCode
    ? (GST_STATE_CODES[placeOfSupplyCode] ?? placeOfSupplyCode)
    : null

  const businessName = businessProfile?.business_name ?? 'Leela Interiors'

  const populatedSections = SECTIONS.filter((key) => formState.sections[key].length > 0)

  const subtotal =
    totals.kitchenTotal + totals.accessoriesTotal + totals.hardwareTotal + totals.civilTotal

  const grandTotalRounded = Math.round(totals.grandTotal)
  const roundOff = grandTotalRounded - totals.grandTotal

  const hasItems = populatedSections.length > 0 || formState.freight > 0

  // ── HSN/SAC tax summary ── GST applies only to the Kitchen Cabinet Work subtotal.
  const kitchenHsnValues = formState.sections.kitchen.map((r) => r.hsn_sac).filter(Boolean)
  const kitchenAllSameHsn =
    kitchenHsnValues.length === formState.sections.kitchen.length &&
    kitchenHsnValues.length > 0 &&
    new Set(kitchenHsnValues).size === 1
  const kitchenHsn = kitchenAllSameHsn ? kitchenHsnValues[0] : kitchenHsnValues.length ? 'Multiple' : '—'

  const exemptTotal = totals.accessoriesTotal + totals.hardwareTotal + totals.civilTotal + formState.freight

  const { map: serialMap, count: itemCount } = populatedSections.reduce(
    (acc, key) => {
      formState.sections[key].forEach((row) => {
        acc.count += 1
        acc.map.set(row.id, acc.count)
      })
      return acc
    },
    { map: new Map<string, number>(), count: 0 },
  )
  const freightSerial = formState.freight > 0 ? itemCount + 1 : null

  return (
    <div className="bg-white text-gray-900 font-sans text-[11px] leading-snug border border-gray-400">
      {/* ── Top bar: GSTIN + copy type ── */}
      <div className="flex items-center justify-between border-b border-gray-400 px-3 py-1.5">
        <div className="font-semibold">GSTIN: {businessProfile?.gstin ?? '—'}</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Original Copy
        </div>
      </div>

      {/* ── Centered title + business identity ── */}
      <div className="border-b border-gray-400 px-3 py-3 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em]">Tax Invoice</div>
        <div className="mt-1 text-xl font-black uppercase tracking-wide">{businessName}</div>
        {businessProfile?.address && (
          <div className="mt-0.5 text-gray-700">{businessProfile.address}</div>
        )}
      </div>

      {/* ── Invoice meta ── */}
      <div className="grid grid-cols-2 border-b border-gray-400">
        <div className={`${CELL} border-r border-gray-400`}>
          <div className={META_ROW}>
            <span className="text-gray-600">Invoice No.</span>
            <span className="font-bold text-[#8B2035]">{invoiceNumber ?? 'DRAFT'}</span>
          </div>
          <div className={META_ROW}>
            <span className="text-gray-600">Dated</span>
            <span className="font-semibold">{displayDate}</span>
          </div>
          <div className={META_ROW}>
            <span className="text-gray-600">Reverse Charge</span>
            <span className="font-semibold">N</span>
          </div>
        </div>
        <div className={CELL}>
          {placeOfSupply && (
            <div className={META_ROW}>
              <span className="text-gray-600">Place of Supply</span>
              <span className="font-semibold">{placeOfSupply}</span>
            </div>
          )}
          {businessProfile?.state_code && (
            <div className={META_ROW}>
              <span className="text-gray-600">State Code</span>
              <span className="font-semibold">{businessProfile.state_code}</span>
            </div>
          )}
          {businessProfile?.pan && (
            <div className={META_ROW}>
              <span className="text-gray-600">PAN</span>
              <span className="font-semibold">{businessProfile.pan}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Billed / Shipped To ── */}
      <div className="grid grid-cols-2 border-b border-gray-400">
        <div className={`${CELL} border-r border-gray-400`}>
          <div className={`${LABEL} mb-1`}>Billed To</div>
          <div className="font-semibold text-[13px]">
            {formState.clientName || (
              <span className="italic font-normal text-gray-500">Client name</span>
            )}
          </div>
          {formState.clientAddress && (
            <div className="mt-0.5 text-gray-700">{formState.clientAddress}</div>
          )}
          {formState.clientPhone && (
            <div className="mt-0.5 text-gray-700">{formState.clientPhone}</div>
          )}
          <div className="mt-0.5 text-gray-700">
            GSTIN/UIN: <span className="font-medium">{formState.clientGstin || '—'}</span>
          </div>
          {formState.clientReference && (
            <div className="mt-0.5 italic text-gray-500">{formState.clientReference}</div>
          )}
        </div>
        <div className={CELL}>
          <div className={`${LABEL} mb-1`}>Shipped To</div>
          <div className="font-semibold text-[13px]">
            {formState.clientName || (
              <span className="italic font-normal text-gray-500">Client name</span>
            )}
          </div>
          {formState.clientAddress && (
            <div className="mt-0.5 text-gray-700">{formState.clientAddress}</div>
          )}
          <div className="mt-0.5 text-gray-700">
            GSTIN/UIN: <span className="font-medium">{formState.clientGstin || '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Line items table ── */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="w-8 border-r border-gray-300 px-2 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-600">
              S.N
            </th>
            <th className="border-r border-gray-300 px-3 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wide text-gray-600">
              Description of Goods
            </th>
            <th className="w-20 border-r border-gray-300 px-2 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-600">
              HSN/SAC
            </th>
            <th className="w-12 border-r border-gray-300 px-2 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-600">
              Qty
            </th>
            <th className="w-20 border-r border-gray-300 px-2 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wide text-gray-600">
              Rate
            </th>
            <th className="w-24 px-3 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wide text-gray-600">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {!hasItems ? (
            <tr>
              <td colSpan={6} className="border-b border-gray-300 py-6 text-center italic text-gray-500">
                No items.
              </td>
            </tr>
          ) : (
            <>
              {populatedSections.map((key) => {
                const rows = formState.sections[key]
                return (
                  <React.Fragment key={key}>
                    {/* Kitchen label suppressed since this section also covers wardrobe work */}
                    {key !== 'kitchen' && (
                      <tr>
                        <td
                          colSpan={6}
                          className="border-y border-gray-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
                        >
                          {SECTION_LABELS[key]}
                        </td>
                      </tr>
                    )}
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200">
                        <td className="border-r border-gray-200 px-2 py-1 text-center text-gray-500">
                          {serialMap.get(row.id)}
                        </td>
                        <td className="border-r border-gray-200 px-3 py-1 text-gray-700">
                          {row.description || '—'}
                        </td>
                        <td className="border-r border-gray-200 px-2 py-1 text-center font-mono text-[10px] text-gray-600">
                          {row.hsn_sac || '—'}
                        </td>
                        <td className="border-r border-gray-200 px-2 py-1 text-center text-gray-700">
                          {row.qty ? `${row.qty} ${UNIT_LABELS[row.unit as Unit] ?? row.unit}` : '—'}
                        </td>
                        <td className="border-r border-gray-200 px-2 py-1 text-right text-gray-700">
                          {row.rate ? formatINR(row.rate) : '—'}
                        </td>
                        <td className="px-3 py-1 text-right font-semibold text-gray-900">
                          {row.amount ? formatINR(row.amount) : '—'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}

              {formState.freight > 0 && (
                <React.Fragment>
                  <tr>
                    <td
                      colSpan={6}
                      className="border-y border-gray-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
                    >
                      Other Charges
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-200 px-2 py-1 text-center text-gray-500">
                      {freightSerial}
                    </td>
                    <td className="border-r border-gray-200 px-3 py-1 text-gray-700">
                      Freight &amp; Fitting
                    </td>
                    <td className="border-r border-gray-200 px-2 py-1 text-center text-gray-500">—</td>
                    <td className="border-r border-gray-200 px-2 py-1 text-center text-gray-700">1</td>
                    <td className="border-r border-gray-200 px-2 py-1 text-right text-gray-700">
                      {formatINR(formState.freight)}
                    </td>
                    <td className="px-3 py-1 text-right font-semibold text-gray-900">
                      {formatINR(formState.freight)}
                    </td>
                  </tr>
                </React.Fragment>
              )}
            </>
          )}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div className="flex justify-end border-b border-gray-400">
        <div className="w-72">
          <div className="flex justify-between border-t border-gray-300 px-3 py-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatINR(subtotal)}</span>
          </div>
          {transactionType === 'intra' ? (
            <>
              <div className="flex justify-between border-t border-gray-300 px-3 py-1">
                <span className="text-gray-600">Add : CGST @ {totals.cgstRate.toFixed(2)}%</span>
                <span className="font-medium">{formatINR(totals.cgstAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 px-3 py-1">
                <span className="text-gray-600">Add : SGST @ {totals.sgstRate.toFixed(2)}%</span>
                <span className="font-medium">{formatINR(totals.sgstAmount)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between border-t border-gray-300 px-3 py-1">
              <span className="text-gray-600">Add : IGST @ {totals.igstRate.toFixed(2)}%</span>
              <span className="font-medium">{formatINR(totals.igstAmount)}</span>
            </div>
          )}
          {formState.freight > 0 && (
            <div className="flex justify-between border-t border-gray-300 px-3 py-1">
              <span className="text-gray-600">Freight</span>
              <span className="font-medium">{formatINR(formState.freight)}</span>
            </div>
          )}
          {roundOff !== 0 && (
            <div className="flex justify-between border-t border-gray-300 px-3 py-1">
              <span className="text-gray-600">Round Off</span>
              <span className="font-medium">
                {roundOff > 0 ? '+' : '−'}{formatINR(Math.abs(roundOff))}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-400 bg-gray-50 px-3 py-2">
            <span className="font-bold uppercase tracking-wide">Grand Total</span>
            <span className="font-bold text-[13px] text-[#8B2035]">
              {formatINR(grandTotalRounded)}
            </span>
          </div>
        </div>
      </div>

      {/* ── HSN/SAC tax summary ── */}
      <table className="w-full border-collapse border-b border-gray-400 text-[10px]">
        <thead>
          <tr className="border-b border-gray-300 bg-gray-50">
            <th className="border-r border-gray-300 px-2 py-1 text-left font-semibold uppercase tracking-wide text-gray-600">
              HSN/SAC
            </th>
            <th className="border-r border-gray-300 px-2 py-1 text-center font-semibold uppercase tracking-wide text-gray-600">
              Tax Rate
            </th>
            <th className="border-r border-gray-300 px-2 py-1 text-right font-semibold uppercase tracking-wide text-gray-600">
              Taxable Amt.
            </th>
            {transactionType === 'intra' ? (
              <>
                <th className="border-r border-gray-300 px-2 py-1 text-right font-semibold uppercase tracking-wide text-gray-600">
                  CGST Amt.
                </th>
                <th className="border-r border-gray-300 px-2 py-1 text-right font-semibold uppercase tracking-wide text-gray-600">
                  SGST Amt.
                </th>
              </>
            ) : (
              <th className="border-r border-gray-300 px-2 py-1 text-right font-semibold uppercase tracking-wide text-gray-600">
                IGST Amt.
              </th>
            )}
            <th className="px-2 py-1 text-right font-semibold uppercase tracking-wide text-gray-600">
              Total Tax
            </th>
          </tr>
        </thead>
        <tbody>
          {totals.kitchenTotal > 0 && (
            <tr className="border-b border-gray-200">
              <td className="border-r border-gray-200 px-2 py-1 font-mono">{kitchenHsn}</td>
              <td className="border-r border-gray-200 px-2 py-1 text-center">
                {transactionType === 'intra'
                  ? `${(totals.cgstRate + totals.sgstRate).toFixed(0)}%`
                  : `${totals.igstRate.toFixed(0)}%`}
              </td>
              <td className="border-r border-gray-200 px-2 py-1 text-right">{formatINR(totals.kitchenTotal)}</td>
              {transactionType === 'intra' ? (
                <>
                  <td className="border-r border-gray-200 px-2 py-1 text-right">{formatINR(totals.cgstAmount)}</td>
                  <td className="border-r border-gray-200 px-2 py-1 text-right">{formatINR(totals.sgstAmount)}</td>
                </>
              ) : (
                <td className="border-r border-gray-200 px-2 py-1 text-right">{formatINR(totals.igstAmount)}</td>
              )}
              <td className="px-2 py-1 text-right font-semibold">{formatINR(totals.gstAmount)}</td>
            </tr>
          )}
          {exemptTotal > 0 && (
            <tr>
              <td className="border-r border-gray-200 px-2 py-1 font-mono text-gray-500">—</td>
              <td className="border-r border-gray-200 px-2 py-1 text-center text-gray-500">0%</td>
              <td className="border-r border-gray-200 px-2 py-1 text-right">{formatINR(exemptTotal)}</td>
              {transactionType === 'intra' ? (
                <>
                  <td className="border-r border-gray-200 px-2 py-1 text-right text-gray-500">—</td>
                  <td className="border-r border-gray-200 px-2 py-1 text-right text-gray-500">—</td>
                </>
              ) : (
                <td className="border-r border-gray-200 px-2 py-1 text-right text-gray-500">—</td>
              )}
              <td className="px-2 py-1 text-right text-gray-500">—</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Amount in words ── */}
      <div className={`${CELL} border-b border-gray-400`}>
        <div className={LABEL}>Amount Chargeable (in words)</div>
        <div className="mt-0.5 font-semibold italic">{amountInWords(grandTotalRounded)}</div>
      </div>

      {/* ── Colour spec ── */}
      <div className="flex flex-wrap gap-6 border-b border-gray-400 px-3 py-1.5 text-gray-600">
        <span>
          Top Shutter: <span className="font-medium text-gray-900">{formState.shutterTop || '—'}</span>
        </span>
        <span>
          Base Shutter: <span className="font-medium text-gray-900">{formState.shutterBase || '—'}</span>
        </span>
        <span>
          Cabinet: <span className="font-medium text-gray-900">{formState.cabinetColor || '—'}</span>
        </span>
      </div>

      {/* ── Bank details ── */}
      {(businessProfile?.bank_account_no || businessProfile?.bank_ifsc || businessProfile?.bank_name) && (
        <div className={`${CELL} border-b border-gray-400`}>
          <span className={LABEL}>Bank Details </span>
          <span className="ml-1 text-gray-700">
            {businessProfile?.bank_account_no && (
              <>Bank A/c no. <span className="font-medium">{businessProfile.bank_account_no}</span></>
            )}
            {businessProfile?.bank_ifsc && (
              <>
                <br />
                IFSC Code. <span className="font-medium">{businessProfile.bank_ifsc}</span>
                {businessProfile?.bank_name && (
                  <> &nbsp; Bank Name - <span className="font-medium">{businessProfile.bank_name}</span></>
                )}
              </>
            )}
          </span>
        </div>
      )}

      {/* ── Terms & signature ── */}
      <div className="grid grid-cols-2">
        <div className={`${CELL} border-r border-gray-400`}>
          <div className={`${LABEL} mb-1`}>Terms and Conditions</div>
          <div className="whitespace-pre-line text-gray-700">
            {businessProfile?.terms_conditions || 'E.& O.E.'}
          </div>
          {formState.notes && (
            <div className="mt-2 whitespace-pre-line text-gray-600">{formState.notes}</div>
          )}
        </div>
        <div className={`${CELL} flex min-h-28 flex-col justify-between`}>
          <div className="flex items-start justify-between text-gray-600">
            <span>Receiver&apos;s Signature</span>
          </div>
          <div className="self-end text-right">
            <div className="text-gray-600">
              For <span className="font-semibold text-gray-900">{businessName}</span>
            </div>
            <div className="mt-6 border-t border-gray-400 pt-1 text-gray-600">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-gray-400 py-2 text-center text-[9px] italic text-gray-400">
        This is a computer-generated invoice and does not require a physical signature.
      </div>
    </div>
  )
}
