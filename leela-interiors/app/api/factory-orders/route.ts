import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNextSequence, UNIQUE_VIOLATION } from '@/lib/costing'
import { FACTORY_ORDER_PREFIX } from '@/lib/constants'
import { generateFactoryOrderNumber, mapCostingToFactoryItems } from '@/lib/factory-order'
import { factoryOrderCreateSchema } from '@/lib/validators/factory-order'
import type { LineItems } from '@/types/supabase'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('factory_orders')
    .select('id, order_number, client_name, status, created_at')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = factoryOrderCreateSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return Response.json({ error: 'Invalid request body' }, { status: 400 })
  const { costingId } = parsed.data

  let clientName = ''
  let boxColour = ''
  let shutterColour = ''
  let siteAddress = ''
  let contactPhone = ''
  let prefill: ReturnType<typeof mapCostingToFactoryItems> = []

  if (costingId) {
    // Select only the non-price columns we need.
    const { data: costing } = await supabase
      .from('costings')
      .select('client_name, client_phone, client_address, cabinet_color, shutter_top, line_items')
      .eq('id', costingId)
      .single()
    if (!costing) return Response.json({ error: 'Costing not found' }, { status: 404 })

    const { data: existing } = await supabase
      .from('factory_orders')
      .select('id, order_number')
      .eq('costing_id', costingId)
      .maybeSingle()
    if (existing) {
      return Response.json({ error: 'Factory order already exists', data: existing }, { status: 400 })
    }

    clientName = costing.client_name ?? ''
    boxColour = costing.cabinet_color ?? ''
    shutterColour = costing.shutter_top ?? ''
    siteAddress = costing.client_address ?? ''
    contactPhone = costing.client_phone ?? ''
    prefill = mapCostingToFactoryItems(costing.line_items as LineItems)
  }

  const year = new Date().getFullYear()
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const seq = await getNextSequence(supabase, 'factory_orders', 'order_number', FACTORY_ORDER_PREFIX, year)
    const orderNumber = generateFactoryOrderNumber(FACTORY_ORDER_PREFIX, year, seq)

    const { data: order, error } = await supabase
      .from('factory_orders')
      .insert({
        user_id: user.id,
        costing_id: costingId ?? null,
        order_number: orderNumber,
        client_name: clientName,
        box_colour: boxColour,
        shutter_colour: shutterColour,
        site_address: siteAddress,
        contact_phone: contactPhone,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === UNIQUE_VIOLATION && attempt < maxAttempts) continue
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (prefill.length > 0) {
      const { error: itemsError } = await supabase.from('factory_order_items').insert(
        prefill.map((item) => ({ ...item, order_id: order.id, user_id: user.id })),
      )
      if (itemsError) {
        await supabase.from('factory_orders').delete().eq('id', order.id)
        return Response.json({ error: itemsError.message }, { status: 500 })
      }
    }

    return Response.json({ data: { id: order.id, order_number: orderNumber } }, { status: 201 })
  }

  return Response.json({ error: 'Could not generate a unique order number' }, { status: 500 })
}
