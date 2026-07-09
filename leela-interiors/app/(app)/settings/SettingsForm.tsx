'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

type Profile = {
  business_name: string
  gstin: string
  address: string
  state_code: string
  pan: string
  bank_account_no: string
  bank_ifsc: string
  bank_name: string
  terms_conditions: string
}

const DEFAULT_TERMS =
  `E.& O.E.\n1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.\n3. Subject to 'Haryana' Jurisdiction only.`

const EMPTY: Profile = {
  business_name: '',
  gstin: '',
  address: '',
  state_code: '',
  pan: '',
  bank_account_no: '',
  bank_ifsc: '',
  bank_name: '',
  terms_conditions: DEFAULT_TERMS,
}

export function SettingsForm({ initial }: { initial: Profile | null }) {
  const [form, setForm] = useState<Profile>(initial ?? EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-derive state_code and pan from GSTIN
  useEffect(() => {
    const g = form.gstin.trim()
    if (g.length >= 2) {
      const sc = g.slice(0, 2)
      setForm(prev => ({ ...prev, state_code: sc }))
    }
    if (g.length >= 12) {
      const pan = g.slice(2, 12)
      setForm(prev => ({ ...prev, pan }))
    }
  }, [form.gstin])

  function set(field: keyof Profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved(false)
      setError(null)
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!GSTIN_RE.test(form.gstin.trim())) {
      setError('GSTIN must be a valid 15-character GST number')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/business-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name.trim(),
          gstin: form.gstin.trim(),
          address: form.address.trim(),
          state_code: form.state_code.trim(),
          pan: form.pan.trim() || null,
          bank_account_no: form.bank_account_no.trim() || null,
          bank_ifsc: form.bank_ifsc.trim() || null,
          bank_name: form.bank_name.trim() || null,
          terms_conditions: form.terms_conditions.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Save failed')
      }
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-5">
      <Field label="Business Name" htmlFor="business_name">
        <Input
          id="business_name"
          value={form.business_name}
          onChange={set('business_name')}
          placeholder="Leela Interiors"
          required
        />
      </Field>

      <Field label="GSTIN" htmlFor="gstin">
        <Input
          id="gstin"
          value={form.gstin}
          onChange={set('gstin')}
          placeholder="09AABCU9603R1ZV"
          maxLength={15}
          required
          spellCheck={false}
          className="font-mono tracking-wider"
        />
        <p className="text-xs text-text-muted mt-1">
          15-character GST number — state code and PAN will be auto-filled
        </p>
      </Field>

      <Field label="Address" htmlFor="address">
        <textarea
          id="address"
          value={form.address}
          onChange={set('address')}
          placeholder="Shop/Office address"
          required
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y min-h-20 transition-colors"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="State Code (2-digit)" htmlFor="state_code">
          <Input
            id="state_code"
            value={form.state_code}
            onChange={set('state_code')}
            placeholder="09"
            maxLength={2}
            required
            spellCheck={false}
          />
        </Field>

        <Field label="PAN" htmlFor="pan">
          <Input
            id="pan"
            value={form.pan}
            onChange={set('pan')}
            placeholder="AABCU9603R"
            maxLength={10}
            spellCheck={false}
            className="font-mono tracking-wider"
          />
        </Field>
      </div>

      <div className="pt-4 border-t border-border">
        <h2 className="text-sm font-semibold text-text-primary mb-1">Bank Details</h2>
        <p className="text-xs text-text-muted mb-4">Shown on every printed invoice.</p>
      </div>

      <Field label="Bank Name" htmlFor="bank_name">
        <Input
          id="bank_name"
          value={form.bank_name}
          onChange={set('bank_name')}
          placeholder="Bank of Baroda"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Bank A/c No." htmlFor="bank_account_no">
          <Input
            id="bank_account_no"
            value={form.bank_account_no}
            onChange={set('bank_account_no')}
            placeholder="82780500000709"
            spellCheck={false}
            className="font-mono tracking-wider"
          />
        </Field>

        <Field label="IFSC Code" htmlFor="bank_ifsc">
          <Input
            id="bank_ifsc"
            value={form.bank_ifsc}
            onChange={set('bank_ifsc')}
            placeholder="BARB0VJMANE"
            spellCheck={false}
            className="font-mono tracking-wider uppercase"
          />
        </Field>
      </div>

      <div className="pt-4 border-t border-border">
        <h2 className="text-sm font-semibold text-text-primary mb-1">Terms &amp; Conditions</h2>
        <p className="text-xs text-text-muted mb-4">Printed on every invoice, one line per point.</p>
      </div>

      <Field label="Terms & Conditions" htmlFor="terms_conditions">
        <textarea
          id="terms_conditions"
          value={form.terms_conditions}
          onChange={set('terms_conditions')}
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y font-mono transition-colors"
        />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved successfully</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
