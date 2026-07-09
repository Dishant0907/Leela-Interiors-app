import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('business_profile')
    .select('business_name, gstin, address, state_code, pan, bank_account_no, bank_ifsc, bank_name, terms_conditions')
    .maybeSingle()

  const initial = profile
    ? {
        business_name: profile.business_name,
        gstin: profile.gstin,
        address: profile.address,
        state_code: profile.state_code,
        pan: profile.pan ?? '',
        bank_account_no: profile.bank_account_no ?? '',
        bank_ifsc: profile.bank_ifsc ?? '',
        bank_name: profile.bank_name ?? '',
        terms_conditions: profile.terms_conditions ?? '',
      }
    : null

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Business Settings</h1>
      <p className="text-sm text-text-muted mb-6">
        This information appears on all costings and invoices for GST compliance.
      </p>
      <SettingsForm initial={initial} />
    </div>
  )
}
