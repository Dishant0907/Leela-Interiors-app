import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FactoryOrderEditor } from '@/components/factory-order/FactoryOrderEditor'
import { RelatedDocuments } from '@/components/shared/RelatedDocuments'
import { FactoryStatusBadge } from '@/components/factory-order/FactoryStatusBadge'
import { factoryOrderFilename } from '@/lib/factory-order-data'
import type { FactoryItemMeta, FactoryOrder, FactoryOrderItem } from '@/types/factory-order'

export const dynamic = 'force-dynamic'

export default async function FactoryOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase.from('factory_orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const { data: rows } = await supabase
    .from('factory_order_items')
    .select('id, section, description, width, height, depth, qty, material, finish, hardware, remarks, sort_order, meta')
    .eq('order_id', id)
    .order('sort_order')

  const items: FactoryOrderItem[] = (rows ?? []).map((r) => ({
    ...r,
    width: r.width === null ? null : Number(r.width),
    height: r.height === null ? null : Number(r.height),
    depth: r.depth === null ? null : Number(r.depth),
    qty: Number(r.qty),
    meta: (r.meta ?? {}) as FactoryItemMeta,
  }))

  const typedOrder = order as FactoryOrder

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/factory-orders" className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Factory Orders
        </Link>
        <div className="flex items-center gap-3">
          {typedOrder.costing_id && (
            <Link href={`/costings/${typedOrder.costing_id}`} className="text-sm text-text-muted hover:underline">
              View costing
            </Link>
          )}
          <FactoryStatusBadge status={typedOrder.status} />
          <h1 className="text-2xl font-semibold text-text-primary">{typedOrder.order_number}</h1>
        </div>
      </div>
      <RelatedDocuments costingId={typedOrder.costing_id} current="factory-order" />
      <FactoryOrderEditor
        key={typedOrder.updated_at}
        order={typedOrder}
        initialItems={items}
        exportName={factoryOrderFilename(typedOrder)}
      />
    </div>
  )
}
