import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

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
    .from('business_profile')
    .select('business_name, gstin, address, state_code, pan, bank_account_no, bank_ifsc, bank_name, terms_conditions')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data: data ?? null })
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

  const body = await request.json() as {
    business_name?: unknown
    gstin?: unknown
    address?: unknown
    state_code?: unknown
    pan?: unknown
    bank_account_no?: unknown
    bank_ifsc?: unknown
    bank_name?: unknown
    terms_conditions?: unknown
  }

  if (!body.business_name || typeof body.business_name !== 'string' || !body.business_name.trim()) {
    return Response.json({ error: 'Business name is required' }, { status: 400 })
  }

  if (!body.gstin || typeof body.gstin !== 'string' || !GSTIN_RE.test(body.gstin)) {
    return Response.json({ error: 'Invalid GSTIN format' }, { status: 400 })
  }

  if (!body.address || typeof body.address !== 'string' || !body.address.trim()) {
    return Response.json({ error: 'Address is required' }, { status: 400 })
  }

  if (!body.state_code || typeof body.state_code !== 'string' || !body.state_code.trim()) {
    return Response.json({ error: 'State code is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('business_profile')
    .upsert(
      {
        user_id: user.id,
        business_name: body.business_name.trim(),
        gstin: body.gstin,
        address: body.address.trim(),
        state_code: body.state_code.trim(),
        pan: typeof body.pan === 'string' ? body.pan.trim() || null : null,
        bank_account_no: typeof body.bank_account_no === 'string' ? body.bank_account_no.trim() || null : null,
        bank_ifsc: typeof body.bank_ifsc === 'string' ? body.bank_ifsc.trim() || null : null,
        bank_name: typeof body.bank_name === 'string' ? body.bank_name.trim() || null : null,
        terms_conditions: typeof body.terms_conditions === 'string' ? body.terms_conditions.trim() : '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
