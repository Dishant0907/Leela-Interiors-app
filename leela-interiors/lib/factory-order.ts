import { FACTORY_STATUSES, FACTORY_SECTIONS } from '@/lib/constants'
import type { LineItems } from '@/types/supabase'
import type { FactoryOrderItem, FactoryOrderStatus, FactorySection } from '@/types/factory-order'

/** Sections where area (sq ft) is shown. */
export const SQFT_SECTIONS: readonly FactorySection[] = ['cabinet', 'shutter']

const MM2_PER_SQFT = 92903

/** (width × height × qty) mm² converted to sq ft, 2 decimals. Null if width or height is missing. */
export function itemSqft(item: Pick<FactoryOrderItem, 'width' | 'height' | 'qty'>): number | null {
  if (item.width === null || item.height === null) return null
  return Math.round(((item.width * item.height * item.qty) / MM2_PER_SQFT) * 100) / 100
}

export function sectionSqft(items: Pick<FactoryOrderItem, 'width' | 'height' | 'qty'>[]): number {
  return Math.round(items.reduce((sum, i) => sum + (itemSqft(i) ?? 0), 0) * 100) / 100
}

const STATUS_TIMESTAMP: Partial<Record<FactoryOrderStatus, string>> = {
  sent: 'sent_at',
  in_production: 'in_production_at',
  ready: 'ready_at',
  delivered: 'delivered_at',
}

export function statusTimestampColumn(status: FactoryOrderStatus): string | undefined {
  return STATUS_TIMESTAMP[status]
}

/** Forward-only, one step at a time. */
export function canTransition(from: FactoryOrderStatus, to: FactoryOrderStatus): boolean {
  return FACTORY_STATUSES.indexOf(to) === FACTORY_STATUSES.indexOf(from) + 1
}

export function nextStatus(status: FactoryOrderStatus): FactoryOrderStatus | null {
  return FACTORY_STATUSES[FACTORY_STATUSES.indexOf(status) + 1] ?? null
}

export function sectionKey(section: string): FactorySection {
  return (FACTORY_SECTIONS as readonly string[]).includes(section) ? (section as FactorySection) : 'other'
}

export interface PrefillItem {
  section: FactorySection
  description: string
  qty: number
  sort_order: number
}

/**
 * Builds factory items from a costing's line_items.
 * Only description and qty are read — rate, amount and hsn_sac are never touched,
 * so client pricing cannot leak into a factory order. Civil work is not a factory job.
 */
export function mapCostingToFactoryItems(lineItems: LineItems): PrefillItem[] {
  const mapping: [keyof LineItems['sections'], FactorySection][] = [
    ['kitchen', 'cabinet'],
    ['accessories', 'accessories'],
    ['hardware', 'hardware'],
  ]
  const items: PrefillItem[] = []
  for (const [source, section] of mapping) {
    for (const line of lineItems.sections[source] ?? []) {
      items.push({
        section,
        description: String(line.description ?? ''),
        qty: Number(line.qty) || 1,
        sort_order: items.length,
      })
    }
  }
  return items
}

export function generateFactoryOrderNumber(prefix: string, year: number, seq: number): string {
  return `${prefix}-${year}-${String(seq).padStart(3, '0')}`
}
