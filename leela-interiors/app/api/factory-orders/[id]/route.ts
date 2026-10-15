import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { factoryOrderUpdateSchema } from '@/lib/validators/factory-order'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order } = await supabase.from('factory_orders').select('*').eq('id', id).single()
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })

  const { data: items } = await supabase
    .from('factory_order_items')
    .select('*')
    .eq('order_id', id)
    .order('sort_order')

  return Response.json({ data: { ...order, items: items ?? [] } })
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = factoryOrderUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request body' }, { status: 400 })
  const { items, ...header } = parsed.data

  const { data: updated, error } = await supabase
    .from('factory_orders')
    .update({ ...header, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })

  // Replace items wholesale, preserving the submitted order.
  const { error: deleteError } = await supabase.from('factory_order_items').delete().eq('order_id', id)
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 })

  if (items.length > 0) {
    const { error: insertError } = await supabase.from('factory_order_items').insert(
      items.map((item, index) => ({ ...item, order_id: id, user_id: user.id, sort_order: index })),
    )
    if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
  }

  return Response.json({ data: { id } })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('factory_orders').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
