import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceNumber, getNextSequence, UNIQUE_VIOLATION } from '@/lib/costing'
import { INVOICE_PREFIX } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { costingId } = await request.json()
  if (!costingId) {
    return Response.json({ error: 'costingId required' }, { status: 400 })
  }

  // Fetch the costing
  const { data: costing, error: costingError } = await supabase
    .from('costings')
    .select('*')
    .eq('id', costingId)
    .single()

  if (costingError || !costing) {
    return Response.json({ error: 'Costing not found' }, { status: 404 })
  }

  // A costing can only have one invoice — one invoice per costing only
  const { data: existing } = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('costing_id', costingId)
    .maybeSingle()

  if (existing) {
    return Response.json(
      { error: 'Invoice already exists', data: { id: existing.id, invoice_number: existing.invoice_number } },
      { status: 400 },
    )
  }

  // Generate invoice number INV-YYYY-NNN
  const year = new Date().getFullYear()

  // Retry with the next sequence number if a concurrent request already took it.
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const seq = await getNextSequence(supabase, 'invoices', 'invoice_number', INVOICE_PREFIX, year)
    const invoiceNumber = generateInvoiceNumber(year, seq)

    // Copy snapshot from costing — do not recalculate
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        costing_id: costingId,
        invoice_number: invoiceNumber,
        invoice_date: costing.costing_date,
        status: 'pending',
        client_id: costing.client_id,
        client_gstin: costing.client_gstin,
        line_items: costing.line_items,
        kitchen_total: costing.kitchen_total,
        accessories_total: costing.accessories_total,
        hardware_total: costing.hardware_total,
        civil_total: costing.civil_total,
        freight: costing.freight,
        gst_rate: costing.gst_rate,
        gst_amount: costing.gst_amount,
        transaction_type: costing.transaction_type,
        cgst_rate: costing.cgst_rate,
        sgst_rate: costing.sgst_rate,
        igst_rate: costing.igst_rate,
        cgst_amount: costing.cgst_amount,
        sgst_amount: costing.sgst_amount,
        igst_amount: costing.igst_amount,
        grand_total: costing.grand_total,
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION && attempt < maxAttempts) {
        continue
      }
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({ data: { id: invoice.id, invoice_number: invoiceNumber } }, { status: 201 })
  }

  return Response.json({ error: 'Could not generate a unique invoice number' }, { status: 500 })
}
