import Link from 'next/link'
import { Calculator, Factory, Receipt, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Current = 'costing' | 'invoice' | 'factory-order'

// Cross-links the costing, invoice(s) and factory order(s) that belong to one job.
export async function RelatedDocuments({
  costingId,
  current,
}: {
  costingId: string | null
  current: Current
}) {
  if (!costingId) return null
  const supabase = await createClient()

  const [{ data: costing }, { data: invoices }, { data: orders }] = await Promise.all([
    supabase.from('costings').select('id, costing_number').eq('id', costingId).maybeSingle(),
    supabase.from('invoices').select('id, invoice_number').eq('costing_id', costingId).order('created_at'),
    supabase.from('factory_orders').select('id, order_number').eq('costing_id', costingId).order('created_at'),
  ])

  const groups: { label: string; icon: LucideIcon; href: string; text: string; self: boolean }[] = []
  if (costing) {
    groups.push({
      label: 'Costing',
      icon: Calculator,
      href: `/costings/${costing.id}`,
      text: costing.costing_number,
      self: current === 'costing',
    })
  }
  for (const i of invoices ?? []) {
    groups.push({
      label: 'Invoice',
      icon: Receipt,
      href: `/invoices/${i.id}`,
      text: i.invoice_number,
      self: current === 'invoice',
    })
  }
  for (const o of orders ?? []) {
    groups.push({
      label: 'Factory Order',
      icon: Factory,
      href: `/factory-orders/${o.id}`,
      text: o.order_number,
      self: current === 'factory-order',
    })
  }

  if (groups.length < 2) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm print:hidden">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Related</span>
      {groups.map((g) => {
        const Icon = g.icon
        const body = (
          <>
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className={g.self ? 'text-slate-300' : 'text-text-muted'}>{g.label}</span>
            <span className="font-semibold">{g.text}</span>
          </>
        )
        return g.self ? (
          <span
            key={g.href}
            aria-current="page"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-white shadow-sm ring-1 ring-slate-900"
          >
            {body}
          </span>
        ) : (
          <Link
            key={g.href}
            href={g.href}
            className="inline-flex items-center gap-2 rounded-full bg-bg-surface px-3.5 py-1.5 text-text-primary shadow-sm ring-1 ring-border transition hover:bg-slate-100 hover:ring-slate-400"
          >
            {body}
          </Link>
        )
      })}
    </div>
  )
}
