import { createClient } from '@/lib/supabase/server'
import { formatDateCompact, toFilenameSegment } from '@/lib/format'
import type { FactoryItemMeta, FactoryOrderExportData, FactoryOrderItem, FactorySection } from '@/types/factory-order'

/** Loads an order for export. Explicit column lists keep the payload free of anything price-related. */
export async function loadFactoryOrderExport(id: string): Promise<FactoryOrderExportData | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: order } = await supabase
    .from('factory_orders')
    .select(
      'order_number, client_name, box_colour, shutter_colour, front_edge, notes, order_date, required_date, site_address, contact_person, contact_phone, drawing_ref, drawing_revision',
    )
    .eq('id', id)
    .single()
  if (!order) return null

  const { data: profile } = await supabase.from('business_profile').select('business_name, address').maybeSingle()

  const { data: rows } = await supabase
    .from('factory_order_items')
    .select('id, section, description, width, height, depth, qty, material, finish, hardware, remarks, sort_order, meta')
    .eq('order_id', id)
    .order('sort_order')

  const items: FactoryOrderItem[] = (rows ?? []).map((r) => ({
    id: r.id,
    section: r.section as FactorySection,
    description: r.description,
    width: r.width === null ? null : Number(r.width),
    height: r.height === null ? null : Number(r.height),
    depth: r.depth === null ? null : Number(r.depth),
    qty: Number(r.qty),
    material: r.material,
    finish: r.finish,
    hardware: r.hardware,
    remarks: r.remarks,
    sort_order: r.sort_order,
    meta: (r.meta ?? {}) as FactoryItemMeta,
  }))

  return {
    company: { name: profile?.business_name ?? 'Leela Interiors', address: profile?.address ?? '' },
    order,
    items,
  }
}

export function factoryOrderFilename(order: Pick<FactoryOrderExportData['order'], 'order_number' | 'client_name' | 'order_date'>): string {
  return [
    order.order_number.replace(/-/g, ''),
    toFilenameSegment(order.client_name),
    formatDateCompact(order.order_date),
  ]
    .filter(Boolean)
    .join('-')
}
