import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const { invoiceId, stage, amount, paidAt, notes } = body

  if (!invoiceId || !stage || !amount || !paidAt) {
    return Response.json({ error: 'invoiceId, stage, amount, paidAt required' }, { status: 400 })
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, grand_total')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (invoiceError || !invoice) {
    return Response.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      invoice_id: invoiceId,
      stage,
      amount: Number(amount),
      paid_at: paidAt,
      notes: notes ?? null,
    })
    .select('id')
    .single()

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)

  const totalPaid = (allPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
  const grandTotal = Number(invoice.grand_total)

  let status: string
  if (totalPaid >= grandTotal) {
    status = 'paid'
  } else if (totalPaid > 0) {
    status = 'partial'
  } else {
    status = 'pending'
  }

  await supabase.from('invoices').update({ status }).eq('id', invoiceId)

  return Response.json({ data: { id: payment.id } }, { status: 201 })
}
