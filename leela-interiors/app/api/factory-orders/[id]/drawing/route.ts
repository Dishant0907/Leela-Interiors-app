import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'factory-drawings'
const MAX_BYTES = 20 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order } = await supabase.from('factory_orders').select('drawing_path').eq('id', id).single()
  if (!order?.drawing_path) return Response.json({ error: 'No drawing attached' }, { status: 404 })

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(order.drawing_path, 60)
  if (error || !data) return Response.json({ error: error?.message ?? 'Could not open drawing' }, { status: 500 })
  return Response.redirect(data.signedUrl, 302)
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'file required' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Only PDF, PNG or JPG files are allowed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) return Response.json({ error: 'File must be 20 MB or smaller' }, { status: 400 })

  const { data: order } = await supabase.from('factory_orders').select('drawing_path').eq('id', id).single()
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_')
  const path = `${user.id}/${id}/${Date.now()}-${safeName}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 })

  const { error } = await supabase
    .from('factory_orders')
    .update({ drawing_path: path, drawing_name: file.name, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (order.drawing_path) await supabase.storage.from(BUCKET).remove([order.drawing_path])
  return Response.json({ data: { drawing_name: file.name } }, { status: 201 })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order } = await supabase.from('factory_orders').select('drawing_path').eq('id', id).single()
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase
    .from('factory_orders')
    .update({ drawing_path: null, drawing_name: null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (order.drawing_path) await supabase.storage.from(BUCKET).remove([order.drawing_path])
  return new Response(null, { status: 204 })
}
