import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canTransition, statusTimestampColumn } from '@/lib/factory-order'
import { factoryStatusSchema } from '@/lib/validators/factory-order'
import type { FactoryOrderStatus } from '@/types/factory-order'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = factoryStatusSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid status' }, { status: 400 })
  const next = parsed.data.status

  const { data: order } = await supabase.from('factory_orders').select('status').eq('id', id).single()
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })

  const current = order.status as FactoryOrderStatus
  if (!canTransition(current, next)) {
    return Response.json({ error: `Cannot move from ${current} to ${next}` }, { status: 400 })
  }

  const now = new Date().toISOString()
  const timestampColumn = statusTimestampColumn(next)
  const { error } = await supabase
    .from('factory_orders')
    .update({ status: next, updated_at: now, ...(timestampColumn ? { [timestampColumn]: now } : {}) })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data: { id, status: next } })
}
