export const GST_RATE = 18
export const COSTING_PREFIX = 'LI'
export const INVOICE_PREFIX = 'INV'
export const SECTIONS = ['kitchen', 'accessories', 'hardware', 'civil'] as const

export const UNITS = ['nos', 'sqft', 'rft', 'set', 'lot'] as const
export type Unit = (typeof UNITS)[number]
export const UNIT_LABELS: Record<Unit, string> = {
  nos: 'Nos',
  sqft: 'Sqft',
  rft: 'Rft',
  set: 'Set',
  lot: 'Lot',
}
export const DEFAULT_UNIT: Unit = 'nos'
export const DEFAULT_TERMS = `1. 60% advance payment required to start work.
2. 30% payment before delivery of material.
3. 10% payment on completion.
4. Warranty: 1 year on workmanship.
5. Any extra civil work will be charged separately.
6. Delivery time: 4–6 weeks from advance payment.`

export const SECTION_LABELS: Record<string, string> = {
  kitchen: 'Kitchen Cabinet Work',
  accessories: 'Accessories',
  hardware: 'Hardware',
  civil: 'Civil Work',
}

// Common HSN/SAC codes for reference — do not auto-insert
// 9403  – Furniture (kitchen cabinets, wardrobes)
// 9405  – Fixtures and fittings
// 9988  – Manufacturing services on physical inputs (civil/fabrication work)
// 8302  – Hardware (hinges, handles, channels)
