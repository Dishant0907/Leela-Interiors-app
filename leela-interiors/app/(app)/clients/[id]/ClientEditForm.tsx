'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAutocorrect } from '@/lib/useAutocorrect'

type Client = {
  id: string
  name: string
  phone: string | null
  address: string | null
  reference: string | null
}

const inputCls =
  'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent'

export function ClientEditForm({ client }: { client: Client }) {
  const [name, setName] = useState(client.name)
  const [phone, setPhone] = useState(client.phone ?? '')
  const [address, setAddress] = useState(client.address ?? '')
  const [reference, setReference] = useState(client.reference ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameAC = useAutocorrect(setName)
  const addressAC = useAutocorrect(setAddress)
  const referenceAC = useAutocorrect(setReference)

  const allCorrections = [
    ...nameAC.lastCorrections,
    ...addressAC.lastCorrections,
    ...referenceAC.lastCorrections,
  ]

  function markDirty() {
    setSaved(false)
    setError(null)
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        reference: reference.trim() || null,
      }),
    })

    setSaving(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError((body as { error?: string }).error ?? 'Failed to save')
    } else {
      setSaved(true)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 space-y-4">
      {allCorrections.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <span>✏️ Auto-corrected:</span>
          {allCorrections.map((c, i) => (
            <span key={i} className="font-medium">
              &ldquo;{c.original}&rdquo; → &ldquo;{c.corrected}&rdquo;
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); markDirty() }}
            onBlur={nameAC.onBlurWithCorrect}
            className={inputCls}
            spellCheck
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => { setPhone(e.target.value); markDirty() }}
            className={inputCls}
            spellCheck={false}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-text-muted mb-1">Address</label>
          <input
            value={address}
            onChange={(e) => { setAddress(e.target.value); markDirty() }}
            onBlur={addressAC.onBlurWithCorrect}
            className={inputCls}
            spellCheck
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Reference</label>
          <input
            value={reference}
            onChange={(e) => { setReference(e.target.value); markDirty() }}
            onBlur={referenceAC.onBlurWithCorrect}
            className={inputCls}
            spellCheck
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        {saved && <span className="text-xs text-green-600">Saved</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
}
