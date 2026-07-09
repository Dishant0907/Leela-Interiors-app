import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q') ?? ''

  let query = supabase
    .from('clients')
    .select('id, name, phone, address, reference')
    .eq('user_id', user.id)
    .order('name')
    .limit(10)

  if (q.trim()) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data })
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
  const { name, phone, address, reference } = body as {
    name: unknown
    phone: unknown
    address: unknown
    reference: unknown
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: name.trim(),
      phone: typeof phone === 'string' ? phone || null : null,
      address: typeof address === 'string' ? address || null : null,
      reference: typeof reference === 'string' ? reference || null : null,
    })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data }, { status: 201 })
}
