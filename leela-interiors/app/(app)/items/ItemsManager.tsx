'use client'

import { useState } from 'react'
import { Plus, Check, X, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SECTIONS, SECTION_LABELS, UNITS, UNIT_LABELS, DEFAULT_UNIT } from '@/lib/constants'
import { formatINR } from '@/lib/format'

type MasterItem = {
  id: string
  name: string
  section: string
  default_rate: number
  hsn_sac: string | null
  unit: string
  active: boolean
}

type EditState = { name: string; rate: string; hsn_sac: string; unit: string }

export function ItemsManager({ initialItems }: { initialItems: MasterItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', rate: '', hsn_sac: '', unit: DEFAULT_UNIT })
  const [editError, setEditError] = useState<string | null>(null)

  const [addingSection, setAddingSection] = useState<string | null>(null)
  const [addName, setAddName] = useState('')
  const [addRate, setAddRate] = useState('')
  const [addHsnSac, setAddHsnSac] = useState('')
  const [addUnit, setAddUnit] = useState<string>(DEFAULT_UNIT)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSaving, setAddSaving] = useState(false)

  const grouped = SECTIONS.reduce<Record<string, MasterItem[]>>((acc, s) => {
    acc[s] = items.filter(i => i.section === s)
    return acc
  }, {} as Record<string, MasterItem[]>)

  function openAdd(section: string) {
    setAddingSection(section)
    setAddName('')
    setAddRate('')
    setAddHsnSac('')
    setAddUnit(DEFAULT_UNIT)
    setAddError(null)
    setEditingId(null)
  }

  function cancelAdd() {
    setAddingSection(null)
    setAddError(null)
  }

  function startEdit(item: MasterItem) {
    setEditingId(item.id)
    setEditState({ name: item.name, rate: String(item.default_rate), hsn_sac: item.hsn_sac ?? '', unit: item.unit || DEFAULT_UNIT })
    setEditError(null)
    setAddingSection(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function saveEdit(id: string) {
    setEditError(null)
    if (!editState.name.trim()) {
      setEditError('Name is required')
      return
    }
    const rate = parseFloat(editState.rate)
    if (isNaN(rate) || rate < 0) {
      setEditError('Invalid rate')
      return
    }
    const hsnSacEdit = editState.hsn_sac.trim()
    if (hsnSacEdit && !/^\d{4,8}$/.test(hsnSacEdit)) {
      setEditError('Must be 4–8 digits')
      return
    }

    const res = await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editState.name.trim(),
        default_rate: rate,
        hsn_sac: editState.hsn_sac.trim() || null,
        unit: editState.unit,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      setEditError(json.error ?? 'Save failed')
      return
    }

    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, name: editState.name.trim(), default_rate: rate, hsn_sac: editState.hsn_sac.trim() || null, unit: editState.unit } : i))
    )
    setEditingId(null)
  }

  async function toggleActive(item: MasterItem) {
    const newActive = !item.active
    setItems(prev => prev.map(i => (i.id === item.id ? { ...i, active: newActive } : i)))

    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newActive }),
    })

    if (!res.ok) {
      setItems(prev => prev.map(i => (i.id === item.id ? { ...i, active: item.active } : i)))
    }
  }

  async function handleAdd() {
    if (!addingSection) return
    setAddError(null)
    if (!addName.trim()) {
      setAddError('Name is required')
      return
    }
    const rate = parseFloat(addRate)
    if (isNaN(rate) || rate < 0) {
      setAddError('Invalid rate')
      return
    }

    const hsnSacAdd = addHsnSac.trim()
    if (hsnSacAdd && !/^\d{4,8}$/.test(hsnSacAdd)) {
      setAddError('Must be 4–8 digits')
      return
    }

    setAddSaving(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: addingSection,
          name: addName.trim(),
          default_rate: rate,
          hsn_sac: addHsnSac.trim() || null,
          unit: addUnit,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setAddError(json.error ?? 'Failed to add item')
        return
      }

      setItems(prev => [
        ...prev,
        { id: json.data.id, name: addName.trim(), section: addingSection, default_rate: rate, hsn_sac: addHsnSac.trim() || null, unit: addUnit, active: true },
      ])
      setAddingSection(null)
    } finally {
      setAddSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {SECTIONS.map(section => (
        <div key={section} className="rounded-xl bg-bg-surface border border-border overflow-hidden">
          {/* Section header with Add Item button */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {SECTION_LABELS[section]}
            </h2>
            {addingSection !== section && (
              <Button size="sm" variant="outline" onClick={() => openAdd(section)}>
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            )}
          </div>

          {/* Inline add form row */}
          {addingSection === section && (
            <div className="border-b border-border">
              <div className="grid grid-cols-[1fr_90px_80px_130px_96px] gap-3 px-5 py-3 items-center bg-accent/5">
                <Input
                  placeholder="Item name"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  autoFocus
                  spellCheck
                />
                <Input
                  placeholder="HSN/SAC (optional)"
                  value={addHsnSac}
                  onChange={e => setAddHsnSac(e.target.value)}
                  maxLength={8}
                  spellCheck={false}
                  className="text-center font-mono text-xs"
                />
                <select
                  value={addUnit}
                  onChange={e => setAddUnit(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Rate (₹)"
                  value={addRate}
                  onChange={e => setAddRate(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  className="text-right"
                />
                <div className="flex gap-1 justify-end">
                  <Button size="sm" onClick={handleAdd} disabled={addSaving}>
                    {addSaving ? '…' : <><Check className="h-3.5 w-3.5" /> Confirm</>}
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={cancelAdd}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {addError && (
                <p className="px-5 pb-2 text-sm text-destructive">{addError}</p>
              )}
            </div>
          )}

          {grouped[section].length === 0 ? (
            <p className="px-5 py-4 text-sm text-text-muted">No items yet.</p>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[1fr_90px_80px_130px_80px_96px] gap-4 px-5 py-2 text-xs font-medium text-text-muted">
                <span>Name</span>
                <span className="text-center">HSN/SAC</span>
                <span className="text-center">Unit</span>
                <span className="text-right">Default Rate</span>
                <span className="text-center">Active</span>
                <span />
              </div>

              {grouped[section].map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_90px_80px_130px_80px_96px] gap-4 px-5 py-3 items-center"
                >
                  {editingId === item.id ? (
                    <>
                      <Input
                        value={editState.name}
                        onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
                        className="h-8"
                        autoFocus
                        spellCheck
                      />
                      <Input
                        value={editState.hsn_sac}
                        onChange={e => setEditState(s => ({ ...s, hsn_sac: e.target.value }))}
                        className="h-8 text-center font-mono text-xs"
                        maxLength={8}
                        placeholder="HSN/SAC"
                        spellCheck={false}
                      />
                      <select
                        value={editState.unit}
                        onChange={e => setEditState(s => ({ ...s, unit: e.target.value }))}
                        className="h-8 rounded-lg border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
                      >
                        {UNITS.map(u => (
                          <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={editState.rate}
                        onChange={e => setEditState(s => ({ ...s, rate: e.target.value }))}
                        className="h-8 text-right"
                        onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                      />
                      <span />
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => saveEdit(item.id)}
                          title="Save"
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-sm ${
                          !item.active ? 'text-text-muted line-through' : 'text-text-primary'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-text-muted font-mono text-center">
                        {item.hsn_sac || '—'}
                      </span>
                      <span className="text-xs text-text-muted text-center">
                        {UNIT_LABELS[item.unit as keyof typeof UNIT_LABELS] ?? item.unit}
                      </span>
                      <span className="text-sm text-text-primary tabular-nums text-right">
                        {formatINR(item.default_rate)}
                      </span>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            item.active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title={item.active ? 'Deactivate' : 'Activate'}
                          aria-label={item.active ? 'Deactivate item' : 'Activate item'}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              item.active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => startEdit(item)}
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {editingId && editError && grouped[section].some(i => i.id === editingId) && (
                <div className="px-5 py-2">
                  <p className="text-sm text-destructive">{editError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
