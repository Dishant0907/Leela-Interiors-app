import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTotals } from '@/lib/costing'
import type { CostingFormState } from '@/types/costing'
import type { LineItems } from '@/types/supabase'

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
    .from('costings')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.from('costings').delete().eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}

export async function GET(
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

  const { data: costing, error } = await supabase
    .from('costings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !costing) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const lineItems = costing.line_items as LineItems

  const formState: CostingFormState = {
    clientName: costing.client_name ?? '',
    clientPhone: costing.client_phone ?? '',
    clientAddress: costing.client_address ?? '',
    clientReference: costing.client_reference ?? '',
    clientGstin: costing.client_gstin ?? undefined,
    shutterTop: costing.shutter_top ?? '',
    shutterBase: costing.shutter_base ?? '',
    cabinetColor: costing.cabinet_color ?? '',
    sections: lineItems.sections,
    freight: Number(costing.freight),
    gstRate: Number(costing.gst_rate),
    transactionType: (costing.transaction_type ?? 'intra') as 'intra' | 'inter',
    notes: costing.notes ?? '',
  }

  return Response.json({ data: formState })
}

export async function PUT(
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

  // Separate 404 (not found) from 403 (wrong owner)
  const { data: costingRow } = await supabase
    .from('costings')
    .select('id, user_id, client_id')
    .eq('id', id)
    .single()

  if (!costingRow) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (costingRow.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json()) as CostingFormState

  if (
    body.transactionType !== undefined &&
    body.transactionType !== 'intra' &&
    body.transactionType !== 'inter'
  ) {
    return Response.json({ error: "transaction_type must be 'intra' or 'inter'" }, { status: 400 })
  }

  const totals = calculateTotals(body)

  const lineItems = {
    sections: {
      kitchen: body.sections.kitchen,
      accessories: body.sections.accessories,
      hardware: body.sections.hardware,
      civil: body.sections.civil,
    },
  }

  const { error: updateError } = await supabase
    .from('costings')
    .update({
      client_name: body.clientName || '',
      client_phone: body.clientPhone || null,
      client_address: body.clientAddress || null,
      client_reference: body.clientReference || null,
      client_gstin: body.clientGstin || null,
      shutter_top: body.shutterTop || null,
      shutter_base: body.shutterBase || null,
      cabinet_color: body.cabinetColor || null,
      line_items: lineItems,
      kitchen_total: totals.kitchenTotal,
      accessories_total: totals.accessoriesTotal,
      hardware_total: totals.hardwareTotal,
      civil_total: totals.civilTotal,
      freight: body.freight,
      gst_rate: body.gstRate,
      gst_amount: totals.gstAmount,
      transaction_type: body.transactionType ?? 'intra',
      cgst_rate: totals.cgstRate,
      sgst_rate: totals.sgstRate,
      igst_rate: totals.igstRate,
      cgst_amount: totals.cgstAmount,
      sgst_amount: totals.sgstAmount,
      igst_amount: totals.igstAmount,
      grand_total: totals.grandTotal,
      notes: body.notes || null,
    })
    .eq('id', id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  const { data: costing } = await supabase
    .from('costings')
    .select('*')
    .eq('id', id)
    .single()

  return Response.json({ costing })
}
