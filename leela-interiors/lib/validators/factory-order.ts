import { z } from 'zod'
import { FACTORY_SECTIONS } from '@/lib/constants'

const dimension = z.number().nonnegative().nullable()

const metaSchema = z.object({
  exposed_sides: z.string().optional(),
  grain: z.string().optional(),
  side: z.string().optional(),
  shelf_type: z.string().optional(),
  shelf_qty: z.number().nonnegative().optional(),
  shutter_type: z.string().optional(),
})

// z.object strips unknown keys, so price-like fields (rate, amount, price...) never survive parsing.
export const factoryItemSchema = z.object({
  section: z.enum(FACTORY_SECTIONS),
  description: z.string(),
  width: dimension,
  height: dimension,
  depth: dimension,
  qty: z.number().nonnegative(),
  material: z.string(),
  finish: z.string(),
  hardware: z.string(),
  remarks: z.string(),
  meta: metaSchema,
})

export const factoryOrderUpdateSchema = z.object({
  client_name: z.string(),
  box_colour: z.string(),
  shutter_colour: z.string(),
  front_edge: z.string(),
  notes: z.string(),
  order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  required_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  site_address: z.string(),
  contact_person: z.string(),
  contact_phone: z.string(),
  drawing_ref: z.string(),
  drawing_revision: z.string(),
  items: z.array(factoryItemSchema),
})

export const factoryOrderCreateSchema = z.object({
  costingId: z.string().uuid().optional(),
})

export const factoryStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'in_production', 'ready', 'delivered']),
})
