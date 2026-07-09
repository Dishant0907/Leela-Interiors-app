import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClientEditForm } from './ClientEditForm'
import { DeleteClientButton } from './DeleteClientButton'
import { formatINR, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !client) notFound()

  const [{ data: costings }, { data: invoices }] = await Promise.all([
    supabase
      .from('costings')
      .select('id, costing_number, grand_total, status, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('id, invoice_number, grand_total, status, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/clients" className="text-xs text-text-muted hover:underline">
            ← Clients
          </Link>
          <h1 className="text-2xl font-semibold text-text-primary mt-1">{client.name}</h1>
        </div>
        <DeleteClientButton clientId={client.id} />
      </div>

      <ClientEditForm client={client} />

      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary mb-3">Costings</h2>
        {!costings || costings.length === 0 ? (
          <p className="text-sm text-text-muted">No costings linked.</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Number
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {costings.map((c) => (
                  <tr key={c.id} className="hover:bg-bg-surface/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/costings/${c.id}`}
                        className="font-medium text-text-primary hover:underline"
                      >
                        {c.costing_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">
                      {formatINR(Number(c.grand_total))}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {c.created_at ? formatDate(c.created_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <CostingStatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary mb-3">Invoices</h2>
        {!invoices || invoices.length === 0 ? (
          <p className="text-sm text-text-muted">No invoices linked.</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Number
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-bg-surface/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-text-primary hover:underline"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">
                      {formatINR(Number(inv.grand_total))}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {inv.created_at ? formatDate(inv.created_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function CostingStatusBadge({ status }: { status: string }) {
  const styles =
    status === 'saved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  )
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles =
    status === 'paid'
      ? 'bg-green-100 text-green-800'
      : status === 'partial'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-yellow-100 text-yellow-800'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  )
}
