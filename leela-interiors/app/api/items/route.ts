import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECTIONS, UNITS, DEFAULT_UNIT } from '@/lib/constants'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('item_master')
    .select('id, name, section, default_rate, hsn_sac, unit')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('name')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { section, name, default_rate, hsn_sac, unit } = body as {
    section: unknown
    name: unknown
    default_rate: unknown
    hsn_sac?: unknown
    unit?: unknown
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  if (!section || typeof section !== 'string' || !(SECTIONS as readonly string[]).includes(section)) {
    return Response.json({ error: 'Invalid section' }, { status: 400 })
  }

  const rate = typeof default_rate === 'number' ? default_rate : parseFloat(String(default_rate))
  if (isNaN(rate) || rate < 0) {
    return Response.json({ error: 'Invalid rate' }, { status: 400 })
  }

  const hsnSacValue = typeof hsn_sac === 'string' && hsn_sac.trim() ? hsn_sac.trim() : null

  const unitValue =
    typeof unit === 'string' && (UNITS as readonly string[]).includes(unit) ? unit : DEFAULT_UNIT

  const { data, error } = await supabase
    .from('item_master')
    .insert({
      name: name.trim(),
      section,
      default_rate: rate,
      hsn_sac: hsnSacValue,
      unit: unitValue,
      user_id: user.id,
      active: true,
    })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data: { id: data.id } }, { status: 201 })
}
