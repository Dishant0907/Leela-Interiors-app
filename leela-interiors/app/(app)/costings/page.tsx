import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { formatINR, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CostingsPage() {
  const supabase = await createClient()

  const { data: costings } = await supabase
    .from('costings')
    .select('id, costing_number, client_name, grand_total, status, costing_date')
    .order('costing_date', { ascending: false })

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Costings</h1>
        <Link href="/costings/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <Plus className="h-4 w-4" />
          New Costing
        </Link>
      </div>

      {!costings || costings.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted text-sm">No costings yet.</p>
          <Link
            href="/costings/new"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}
          >
            Create your first costing
          </Link>
        </div>
      ) : (
        <>
        {/* Mobile: card list */}
        <ul className="space-y-3 md:hidden">
          {costings.map((c) => (
            <li key={c.id}>
              <Link
                href={`/costings/${c.id}`}
                className="block rounded-xl border border-border bg-bg-surface p-4 active:bg-bg-base"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text-primary">{c.costing_number}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 truncate text-sm text-text-primary">
                  {c.client_name || <span className="text-text-muted italic">—</span>}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-text-muted">{c.costing_date ? formatDate(c.costing_date) : '—'}</span>
                  <span className="font-medium text-text-primary">{formatINR(Number(c.grand_total))}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop: table */}
        <div className="hidden rounded-xl border border-border md:block">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border [&_th:first-child]:rounded-tl-xl [&_th:last-child]:rounded-tr-xl">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Number
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
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {costings.map((c) => (
                <tr
                  key={c.id}
                  className="relative cursor-pointer transition-all duration-200 ease-out hover:z-10 hover:scale-[1.02] hover:bg-bg-surface hover:shadow-lg"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/costings/${c.id}`}
                      className="font-medium text-text-primary hover:underline after:absolute after:inset-0 after:content-['']"
                    >
                      {c.costing_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-primary">
                    {c.client_name || <span className="text-text-muted italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">
                    {formatINR(Number(c.grand_total))}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {c.costing_date ? formatDate(c.costing_date) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'saved'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  )
}
