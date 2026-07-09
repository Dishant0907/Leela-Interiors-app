import { GST_RATE, COSTING_PREFIX, INVOICE_PREFIX } from './constants'
import type { CostingFormState, Totals, LineItem } from '@/types/costing'
import type { createClient } from '@/lib/supabase/server'

export type { CostingFormState, Totals }
export type LineItemRow = LineItem

function rowTotal(rows: LineItem[]): number {
  return rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)
}

export function calculateTotals(state: CostingFormState): Totals {
  const kitchenTotal = rowTotal(state.sections.kitchen)
  const accessoriesTotal = rowTotal(state.sections.accessories)
  const hardwareTotal = rowTotal(state.sections.hardware)
  const civilTotal = rowTotal(state.sections.civil)
  const gstRate = state.gstRate || GST_RATE
  const freight = state.freight || 0
  const transactionType = state.transactionType ?? 'intra'

  let cgstRate = 0, sgstRate = 0, igstRate = 0
  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0

  if (transactionType === 'intra') {
    cgstRate = gstRate / 2
    sgstRate = gstRate / 2
    igstRate = 0
    cgstAmount = Math.round(kitchenTotal * cgstRate / 100 * 100) / 100
    sgstAmount = Math.round(kitchenTotal * sgstRate / 100 * 100) / 100
    igstAmount = 0
  } else {
    cgstRate = 0
    sgstRate = 0
    igstRate = gstRate
    cgstAmount = 0
    sgstAmount = 0
    igstAmount = Math.round(kitchenTotal * igstRate / 100 * 100) / 100
  }

  const gstAmount = cgstAmount + sgstAmount + igstAmount
  const grandTotal = kitchenTotal + accessoriesTotal + hardwareTotal + civilTotal + freight + gstAmount

  return {
    kitchenTotal,
    accessoriesTotal,
    hardwareTotal,
    civilTotal,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    gstAmount,
    grandTotal,
  }
}

export function generateCostingNumber(year: number, sequence: number): string {
  return `${COSTING_PREFIX}-${year}-${String(sequence).padStart(3, '0')}`
}

export function generateInvoiceNumber(year: number, sequence: number): string {
  return `${INVOICE_PREFIX}-${year}-${String(sequence).padStart(3, '0')}`
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Next NNN sequence for a `PREFIX-YYYY-NNN` column, scoped to the given year. */
export async function getNextSequence(
  supabase: SupabaseServerClient,
  table: 'costings' | 'invoices',
  column: 'costing_number' | 'invoice_number',
  prefix: string,
  year: number,
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select(column)
    .like(column, `${prefix}-${year}-%`)
    .order(column, { ascending: false })
    .limit(1)

  if (data && data.length > 0) {
    const row = data[0] as Record<string, string>
    const parts = row[column].split('-')
    const n = parseInt(parts.at(-1) ?? '', 10)
    if (!isNaN(n)) return n + 1
  }
  return 1
}

/** Postgres unique_violation error code. */
export const UNIQUE_VIOLATION = '23505'
