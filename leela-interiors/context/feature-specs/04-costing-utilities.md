Read `AGENTS.md` before starting.

The schema is ready. Build the core business logic utilities before touching any UI.

## lib/constants.ts

```ts
export const GST_RATE = 18
export const COSTING_PREFIX = 'LI'
export const INVOICE_PREFIX = 'INV'
export const SECTIONS = ['kitchen', 'accessories', 'hardware', 'civil'] as const
export const DEFAULT_TERMS = `1. 60% advance payment required to start work.
2. 30% payment before delivery of material.
3. 10% payment on completion.
4. Warranty: 1 year on workmanship.
5. Any extra civil work will be charged separately.
6. Delivery time: 4–6 weeks from advance payment.`
```

## lib/costing.ts

Export a `calculateTotals(formState)` function.

Rules:
- compute `amount = qty × rate` for each line item
- `kitchen_total` = sum of Kitchen Cabinet Work section amounts
- `accessories_total`, `hardware_total`, `civil_total` = sums of respective sections
- `gst_amount` = `kitchen_total × gst_rate / 100`
- GST is never applied to accessories, hardware, civil, or freight
- `grand_total` = `kitchen_total + accessories_total + hardware_total + civil_total + freight + gst_amount`

Also export `generateCostingNumber(year: number, sequence: number): string`.
Format: `LI-2026-001` — year and zero-padded 3-digit sequence.

Also export `generateInvoiceNumber(year: number, sequence: number): string`.
Format: `INV-2026-001`.

## lib/format.ts

```ts
export function formatINR(amount: number): string
// formats as ₹1,20,000 using Indian number system

export function formatDate(date: string | Date): string
// formats as "7 May 2026"
```

## Types

Create `src/types/costing.ts`:

```ts
export type Section = 'kitchen' | 'accessories' | 'hardware' | 'civil'

export interface LineItem {
  id: string
  description: string
  qty: number
  rate: number
  amount: number
}

export interface CostingFormState {
  clientName: string
  clientPhone: string
  clientAddress: string
  clientReference: string
  shutterTop: string
  shutterBase: string
  cabinetColor: string
  sections: Record<Section, LineItem[]>
  freight: number
  gstRate: number
  notes: string
}

export interface Totals {
  kitchenTotal: number
  accessoriesTotal: number
  hardwareTotal: number
  civilTotal: number
  gstAmount: number
  grandTotal: number
}
```

### Check when done

- `calculateTotals` returns correct totals with GST only on kitchen section
- `formatINR(120000)` returns `₹1,20,000`
- `generateCostingNumber(2026, 1)` returns `LI-2026-001`
- `generateInvoiceNumber(2026, 1)` returns `INV-2026-001`
- no TypeScript errors
