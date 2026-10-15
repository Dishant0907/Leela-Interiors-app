import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { FactoryStatusBadge } from '@/components/factory-order/FactoryStatusBadge'
import type { FactoryOrderStatus } from '@/types/factory-order'

export const dynamic = 'force-dynamic'

const TH = 'text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider'

export default async function FactoryOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('factory_orders')
    .select('id, order_number, client_name, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Factory Orders</h1>
        <Link href="/factory-orders/new" className={buttonVariants({ size: 'sm' })}>
          New Factory Order
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted text-sm">No factory orders yet.</p>
          <p className="text-text-muted text-xs mt-1">
            Use &ldquo;Factory Order&rdquo; on a costing to create one with items prefilled.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border">
              <tr>
                <th className={TH}>Number</th>
                <th className={TH}>Client</th>
                <th className={TH}>Created</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-bg-surface/60 transition-colors cursor-pointer">
                  <td className="p-0">
                    <Link href={`/factory-orders/${o.id}`} className="block px-4 py-3 font-medium text-text-primary hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="p-0 text-text-primary">
                    <Link href={`/factory-orders/${o.id}`} className="block px-4 py-3">
                      {o.client_name || <span className="text-text-muted italic">—</span>}
                    </Link>
                  </td>
                  <td className="p-0 text-text-muted">
                    <Link href={`/factory-orders/${o.id}`} className="block px-4 py-3">
                      {formatDate(o.created_at)}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/factory-orders/${o.id}`} className="block px-4 py-3">
                      <FactoryStatusBadge status={o.status as FactoryOrderStatus} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
