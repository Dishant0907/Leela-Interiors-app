import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UNITS } from '@/lib/constants'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const update: Record<string, unknown> = {}

  if ('name' in body) {
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    update.name = body.name.trim()
  }

  if ('default_rate' in body) {
    const rate = parseFloat(String(body.default_rate))
    if (isNaN(rate) || rate < 0) {
      return Response.json({ error: 'Invalid rate' }, { status: 400 })
    }
    update.default_rate = rate
  }

  if ('active' in body) {
    update.active = Boolean(body.active)
  }

  if ('hsn_sac' in body) {
    update.hsn_sac = typeof body.hsn_sac === 'string' && body.hsn_sac.trim() ? body.hsn_sac.trim() : null
  }

  if ('unit' in body) {
    if (typeof body.unit !== 'string' || !(UNITS as readonly string[]).includes(body.unit)) {
      return Response.json({ error: 'Invalid unit' }, { status: 400 })
    }
    update.unit = body.unit
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('item_master')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
