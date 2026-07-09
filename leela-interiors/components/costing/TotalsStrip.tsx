import { formatINR } from '@/lib/format'
import type { Totals, TransactionType } from '@/types/costing'

interface TotalsStripProps {
  totals: Totals
  gstRate: number
  freight: number
  transactionType: TransactionType
}

export function TotalsStrip({ totals, freight, transactionType }: TotalsStripProps) {
  return (
    <div className="rounded-xl bg-gray-900 text-white p-5 space-y-2 text-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Summary</h2>
      <Row label="Kitchen Cabinet Work" value={totals.kitchenTotal} />
      <Row label="Accessories" value={totals.accessoriesTotal} />
      <Row label="Hardware" value={totals.hardwareTotal} />
      <Row label="Civil Work" value={totals.civilTotal} />
      <div className="border-t border-gray-700 pt-2">
        <Row label="Freight & Fitting" value={freight} />
        {transactionType === 'intra' ? (
          <>
            <Row label={`CGST (${totals.cgstRate}%)`} value={totals.cgstAmount} />
            <Row label={`SGST (${totals.sgstRate}%)`} value={totals.sgstAmount} />
          </>
        ) : (
          <Row label={`IGST (${totals.igstRate}%)`} value={totals.igstAmount} />
        )}
      </div>
      <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-base text-white">
        <span>Grand Total</span>
        <span>{formatINR(Math.round(totals.grandTotal))}</span>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span className="font-medium text-white">{formatINR(value)}</span>
    </div>
  )
}
