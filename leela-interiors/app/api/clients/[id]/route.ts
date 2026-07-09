import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
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

  const { data: existing, error: fetchError } = await supabase
    .from('clients')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('clients').delete().eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}

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
  const { name, phone, address, reference } = body as {
    name: unknown
    phone: unknown
    address: unknown
    reference: unknown
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('clients')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('clients')
    .update({
      name: name.trim(),
      phone: typeof phone === 'string' ? phone || null : null,
      address: typeof address === 'string' ? address || null : null,
      reference: typeof reference === 'string' ? reference || null : null,
    })
    .eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data: { id } })
}
