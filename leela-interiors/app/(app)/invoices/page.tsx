import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatINR, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, grand_total, status, created_at, costings(client_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Invoices</h1>
      </div>

      {!invoices || invoices.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted text-sm">No invoices yet.</p>
          <p className="text-text-muted text-xs mt-1">
            Use &ldquo;Convert to Invoice&rdquo; on a costing to create one.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Number
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Client
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
              {invoices.map((inv) => {
                const clientName =
                  (inv.costings as unknown as { client_name: string | null } | null)?.client_name ?? null
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-bg-surface/60 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-text-primary hover:underline"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      <Link href={`/invoices/${inv.id}`} className="block">
                        {clientName || <span className="text-text-muted italic">—</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">
                      <Link href={`/invoices/${inv.id}`} className="block">
                        {formatINR(Number(inv.grand_total))}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      <Link href={`/invoices/${inv.id}`} className="block">
                        {inv.created_at ? formatDate(inv.created_at) : '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/invoices/${inv.id}`} className="block">
                        <StatusBadge status={inv.status} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'paid'
      ? 'bg-status-paid/10 text-status-paid'
      : status === 'partial'
        ? 'bg-status-partial/10 text-status-partial'
        : 'bg-status-pending/10 text-status-pending'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  )
}
