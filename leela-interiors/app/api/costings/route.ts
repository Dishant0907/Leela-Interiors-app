import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTotals, generateCostingNumber, getNextSequence, UNIQUE_VIOLATION } from '@/lib/costing'
import type { CostingFormState } from '@/types/costing'
import { COSTING_PREFIX } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as CostingFormState
  const totals = calculateTotals(body)

  const year = new Date().getFullYear()

  // Resolve client: use explicit clientId if provided, else match by name or create
  let clientId: string | null = null
  if (body.clientId) {
    clientId = body.clientId
  } else if (body.clientName) {
    const { data: matchedClients } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', body.clientName)
      .limit(1)

    if (matchedClients && matchedClients.length > 0) {
      clientId = matchedClients[0].id
    } else {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: body.clientName,
          phone: body.clientPhone || null,
          address: body.clientAddress || null,
          reference: body.clientReference || null,
        })
        .select('id')
        .single()
      if (newClient) clientId = newClient.id
    }
  }

  const lineItems = {
    sections: {
      kitchen: body.sections.kitchen,
      accessories: body.sections.accessories,
      hardware: body.sections.hardware,
      civil: body.sections.civil,
    },
  }

  // Retry with the next sequence number if a concurrent save already took it.
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const seq = await getNextSequence(supabase, 'costings', 'costing_number', COSTING_PREFIX, year)
    const costingNumber = generateCostingNumber(year, seq)

    const { data: costing, error: insertError } = await supabase
      .from('costings')
      .insert({
        user_id: user.id,
        client_id: clientId,
        costing_number: costingNumber,
        status: 'saved',
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
      .select('id, costing_number')
      .single()

    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION && attempt < maxAttempts) {
        continue
      }
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({ data: { id: costing.id, costing_number: costing.costing_number } }, { status: 201 })
  }

  return Response.json({ error: 'Could not generate a unique costing number' }, { status: 500 })
}
