export type FactoryOrderStatus = 'draft' | 'sent' | 'in_production' | 'ready' | 'delivered'
export type FactorySection = 'cabinet' | 'shutter' | 'accessories' | 'hardware' | 'other'

export interface FactoryItemMeta {
  exposed_sides?: string
  grain?: string
  side?: string
  shelf_type?: string
  shelf_qty?: number
  shutter_type?: string
}

export interface FactoryOrderItem {
  id: string
  section: FactorySection
  description: string
  width: number | null
  height: number | null
  depth: number | null
  qty: number
  material: string
  finish: string
  hardware: string
  remarks: string
  sort_order: number
  meta: FactoryItemMeta
}

export interface FactoryOrder {
  id: string
  costing_id: string | null
  order_number: string
  client_name: string
  box_colour: string
  shutter_colour: string
  front_edge: string
  order_date: string
  required_date: string | null
  site_address: string
  contact_person: string
  contact_phone: string
  drawing_ref: string
  drawing_revision: string
  drawing_path: string | null
  drawing_name: string | null
  status: FactoryOrderStatus
  sent_at: string | null
  in_production_at: string | null
  ready_at: string | null
  delivered_at: string | null
  notes: string
  created_at: string
  updated_at: string
}

/** Shared by the Excel and PDF exporters. Contains no price fields by design. */
export interface FactoryOrderExportData {
  company: { name: string; address: string }
  order: Pick<
    FactoryOrder,
    | 'order_number'
    | 'client_name'
    | 'box_colour'
    | 'shutter_colour'
    | 'front_edge'
    | 'notes'
    | 'order_date'
    | 'required_date'
    | 'site_address'
    | 'contact_person'
    | 'contact_phone'
    | 'drawing_ref'
    | 'drawing_revision'
  >
  items: FactoryOrderItem[]
}
