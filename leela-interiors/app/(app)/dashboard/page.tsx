import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatINR, formatDate } from '@/lib/format'
import { DashboardSearch } from './DashboardSearch'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: costingsThisMonth },
    { data: invoicesThisMonth },
    { data: unpaidInvoices },
    { data: recentCostings },
    searchResult,
  ] = await Promise.all([
    supabase
      .from('costings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth),
    supabase
      .from('invoices')
      .select('grand_total')
      .gte('created_at', startOfMonth),
    supabase
      .from('invoices')
      .select('id, grand_total')
      .neq('status', 'paid'),
    supabase
      .from('costings')
      .select('id, costing_number, client_name, grand_total, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    query
      ? supabase
          .from('costings')
          .select('id, costing_number, client_name, grand_total, created_at')
          .or(`costing_number.ilike.%${query}%,client_name.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null as null }),
  ])

  const totalInvoicedThisMonth = (invoicesThisMonth ?? []).reduce(
    (sum, inv) => sum + Number(inv.grand_total),
    0
  )

  const unpaidIds = (unpaidInvoices ?? []).map((inv) => inv.id)
  const unpaidGrandTotal = (unpaidInvoices ?? []).reduce(
    (sum, inv) => sum + Number(inv.grand_total),
    0
  )

  let paymentsTotal = 0
  if (unpaidIds.length > 0) {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .in('invoice_id', unpaidIds)
    paymentsTotal = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
  }

  const outstandingAmount = unpaidGrandTotal - paymentsTotal

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="Costings This Month"
          value={String(costingsThisMonth ?? 0)}
        />
        <SummaryCard
          label="Invoiced This Month"
          value={formatINR(totalInvoicedThisMonth)}
        />
        <SummaryCard
          label="Outstanding"
          value={formatINR(outstandingAmount)}
        />
      </div>

      {/* Search */}
      <DashboardSearch
        initialQuery={query}
        initialResults={searchResult.data ?? null}
      />

      {/* Recent Costings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">Recent Costings</h2>
          <Link
            href="/costings"
            className="text-sm text-accent hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        {!recentCostings || recentCostings.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-muted">No costings yet.</p>
          </div>
        ) : (
          <RecentCostingsTable costings={recentCostings} />
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}

type CostingRow = {
  id: string
  costing_number: string | null
  client_name: string | null
  grand_total: number | string | null
  created_at: string | null
}

function RecentCostingsTable({ costings }: { costings: CostingRow[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bg-surface border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Costing No.
            </th>
            <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Client
            </th>
            <th className="text-right px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Grand Total
            </th>
            <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {costings.map((c) => (
            <tr key={c.id} className="hover:bg-bg-surface/60 transition-colors">
              <td className="px-4 py-3 font-medium text-text-primary">
                {c.costing_number ?? '—'}
              </td>
              <td className="px-4 py-3 text-text-primary">
                {c.client_name ?? <span className="text-text-muted italic">—</span>}
              </td>
              <td className="px-4 py-3 text-right font-medium text-text-primary">
                {formatINR(Number(c.grand_total ?? 0))}
              </td>
              <td className="px-4 py-3 text-text-muted">
                {c.created_at ? formatDate(c.created_at) : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/costings/${c.id}`}
                  className="text-accent hover:underline text-sm font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
