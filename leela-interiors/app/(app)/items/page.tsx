import { createClient } from '@/lib/supabase/server'
import { ItemsManager } from './ItemsManager'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('item_master')
    .select('id, name, section, default_rate, hsn_sac, unit, active')
    .order('name')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Item Master</h1>
      <ItemsManager initialItems={items ?? []} />
    </div>
  )
}
