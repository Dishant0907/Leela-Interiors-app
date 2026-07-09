'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'

type Client = {
  id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string | null
  costingCount: number
}

const inputCls =
  'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent'

export function ClientSearch({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)

  // New client form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone ?? '').includes(q),
      )
    : clients

  function openModal() {
    setName('')
    setPhone('')
    setAddress('')
    setReference('')
    setError(null)
    setShowModal(true)
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)

    const res = await fetch('/api/clients', {
      method: 'POST',
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
      setError((body as { error?: string }).error ?? 'Failed to create client')
      return
    }

    const { data } = await res.json()
    setShowModal(false)
    router.push(`/clients/${data.id}`)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <Button size="sm" onClick={openModal} className="shrink-0 flex items-center gap-1.5">
          <Plus size={14} />
          New Client
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted text-sm">No clients found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Address
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Costings
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-bg-surface/60 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/clients/${c.id}`}
                      className="font-medium text-text-primary hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    <Link href={`/clients/${c.id}`} className="block">
                      {c.phone ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    <Link href={`/clients/${c.id}`} className="block">
                      {c.address ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/clients/${c.id}`} className="block text-text-primary">
                      {c.costingCount}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    <Link href={`/clients/${c.id}`} className="block">
                      {c.created_at ? formatDate(c.created_at) : '—'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Client Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-text-primary">New Client</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                  placeholder="Client name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, State"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Reference</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="How did they find us?"
                  className={inputCls}
                />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating…' : 'Create Client'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
