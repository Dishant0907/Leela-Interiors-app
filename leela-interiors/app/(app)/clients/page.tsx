import { createClient } from '@/lib/supabase/server'
import { ClientSearch } from './ClientSearch'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const supabase = await createClient()

  const [{ data: clients }, { data: costingData }] = await Promise.all([
    supabase.from('clients').select('id, name, phone, address, created_at').order('name'),
    supabase.from('costings').select('client_id').not('client_id', 'is', null),
  ])

  const countMap: Record<string, number> = {}
  for (const c of costingData ?? []) {
    if (c.client_id) countMap[c.client_id] = (countMap[c.client_id] ?? 0) + 1
  }

  const clientsWithCount = (clients ?? []).map((c) => ({
    ...c,
    costingCount: countMap[c.id] ?? 0,
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Clients</h1>
      <ClientSearch clients={clientsWithCount} />
    </div>
  )
}
