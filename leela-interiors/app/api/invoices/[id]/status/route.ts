import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('grand_total')
    .eq('id', id)
    .single()

  if (invoiceError || !invoice) {
    return Response.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', id)

  if (paymentsError) {
    return Response.json({ error: paymentsError.message }, { status: 500 })
  }

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
  const grandTotal = Number(invoice.grand_total)

  let status: string
  if (totalPaid === 0) {
    status = 'pending'
  } else if (totalPaid >= grandTotal) {
    status = 'paid'
  } else {
    status = 'partial'
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ status })
}
