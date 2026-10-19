'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FACTORY_SECTIONS, FACTORY_SECTION_LABELS, FACTORY_STATUSES, FACTORY_STATUS_LABELS } from '@/lib/constants'
import { itemSqft, nextStatus, sectionSqft, SQFT_SECTIONS } from '@/lib/factory-order'
import type { FactoryItemMeta, FactoryOrder, FactoryOrderItem, FactorySection } from '@/types/factory-order'

interface Props {
  order: FactoryOrder
  initialItems: FactoryOrderItem[]
  exportName: string
}

interface ExtraField {
  key: keyof FactoryItemMeta
  label: string
  numeric?: boolean
  width: string
}

const EXTRAS: Record<FactorySection, ExtraField[]> = {
  cabinet: [
    { key: 'exposed_sides', label: 'Exposed Sides', width: 'w-36' },
    { key: 'grain', label: 'H/V', width: 'w-14' },
    { key: 'side', label: 'L/R/B', width: 'w-14' },
    { key: 'shelf_type', label: 'GL/BRD', width: 'w-16' },
    { key: 'shelf_qty', label: 'Shelf Qty', numeric: true, width: 'w-16' },
  ],
  shutter: [{ key: 'shutter_type', label: 'Type', width: 'w-24' }],
  accessories: [],
  hardware: [],
  other: [],
}

const CELL = 'h-7 px-1.5 text-sm'
const TH = 'px-1.5 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted whitespace-nowrap'

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-[11px] font-medium text-text-muted">
      {label}
      {children}
    </label>
  )
}

function newItem(section: FactorySection): FactoryOrderItem {
  return {
    id: crypto.randomUUID(),
    section,
    description: '',
    width: null,
    height: null,
    depth: null,
    qty: 1,
    material: '',
    finish: '',
    hardware: '',
    remarks: '',
    sort_order: 0,
    meta: {},
  }
}

function toNumber(value: string): number | null {
  if (value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function FactoryOrderEditor({ order, initialItems, exportName }: Props) {
  const router = useRouter()
  const [header, setHeader] = useState({
    client_name: order.client_name,
    box_colour: order.box_colour,
    shutter_colour: order.shutter_colour,
    front_edge: order.front_edge,
    notes: order.notes,
    order_date: order.order_date,
    required_date: order.required_date ?? '',
    site_address: order.site_address,
    contact_person: order.contact_person,
    contact_phone: order.contact_phone,
    drawing_ref: order.drawing_ref,
    drawing_revision: order.drawing_revision,
  })
  const [drawingName, setDrawingName] = useState(order.drawing_name)
  const [uploading, setUploading] = useState(false)
  const [items, setItems] = useState<FactoryOrderItem[]>(initialItems)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const next = nextStatus(order.status)

  function updateItem(id: string, patch: Partial<FactoryOrderItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function updateMeta(id: string, patch: Partial<FactoryItemMeta>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, meta: { ...i.meta, ...patch } } : i)))
  }

  function move(id: string, delta: -1 | 1) {
    setItems((prev) => {
      const section = prev.find((i) => i.id === id)?.section
      const sameSection = prev.filter((i) => i.section === section)
      const pos = sameSection.findIndex((i) => i.id === id)
      const target = sameSection[pos + delta]
      if (!target) return prev
      const a = prev.findIndex((i) => i.id === id)
      const b = prev.findIndex((i) => i.id === target.id)
      const copy = [...prev]
      ;[copy[a], copy[b]] = [copy[b], copy[a]]
      return copy
    })
  }

  async function save(): Promise<boolean> {
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/factory-orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...header,
        required_date: header.required_date || null,
        items: items.map((item) => ({
          section: item.section,
          description: item.description,
          width: item.width,
          height: item.height,
          depth: item.depth,
          qty: item.qty,
          material: item.material,
          finish: item.finish,
          hardware: item.hardware,
          remarks: item.remarks,
          meta: item.meta,
        })),
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      setMessage(json?.error ?? 'Save failed')
      return false
    }
    setMessage('Saved')
    router.refresh()
    return true
  }

  async function advance() {
    if (!next) return
    setAdvancing(true)
    if (await save()) {
      const res = await fetch(`/api/factory-orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) router.refresh()
      else setMessage((await res.json().catch(() => null))?.error ?? 'Status change failed')
    }
    setAdvancing(false)
  }

  async function uploadDrawing(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage(null)
    const body = new FormData()
    body.append('file', file)
    const res = await fetch(`/api/factory-orders/${order.id}/drawing`, { method: 'POST', body })
    const json = await res.json().catch(() => null)
    setUploading(false)
    e.target.value = ''
    if (res.ok) setDrawingName(json?.data?.drawing_name ?? file.name)
    else setMessage(json?.error ?? 'Upload failed')
  }

  async function removeDrawing() {
    const res = await fetch(`/api/factory-orders/${order.id}/drawing`, { method: 'DELETE' })
    if (res.ok) setDrawingName(null)
  }

  async function remove() {
    if (!confirm('Delete this factory order?')) return
    const res = await fetch(`/api/factory-orders/${order.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/factory-orders')
  }

  return (
    <div className="space-y-6">
      {/* Status stepper */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {FACTORY_STATUSES.map((s, idx) => {
          const reached = idx <= FACTORY_STATUSES.indexOf(order.status)
          return (
            <span
              key={s}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                reached ? 'bg-text-primary text-white' : 'bg-bg-surface text-text-muted border border-border'
              }`}
            >
              {FACTORY_STATUS_LABELS[s]}
            </span>
          )
        })}
        {next && (
          <Button size="sm" variant="outline" onClick={advance} disabled={advancing || saving}>
            Save &amp; mark {FACTORY_STATUS_LABELS[next]}
          </Button>
        )}
      </div>

      {/* Header fields */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-white p-4 md:grid-cols-4">
        {(
          [
            ['client_name', 'Client name'],
            ['box_colour', 'Box colour'],
            ['shutter_colour', 'Shutter colour'],
            ['front_edge', 'Front edge'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="space-y-1 text-xs font-medium text-text-muted">
            {label}
            <Input value={header[key]} onChange={(e) => setHeader({ ...header, [key]: e.target.value })} />
          </label>
        ))}
        <label className="space-y-1 text-xs font-medium text-text-muted">
          Order date
          <Input type="date" value={header.order_date} onChange={(e) => setHeader({ ...header, order_date: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-muted">
          Required delivery date
          <Input type="date" value={header.required_date} onChange={(e) => setHeader({ ...header, required_date: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-muted">
          Contact person
          <Input value={header.contact_person} onChange={(e) => setHeader({ ...header, contact_person: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-muted">
          Contact phone
          <Input value={header.contact_phone} onChange={(e) => setHeader({ ...header, contact_phone: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-muted md:col-span-4">
          Site / delivery address
          <Input value={header.site_address} onChange={(e) => setHeader({ ...header, site_address: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-muted">
          Drawing no.
          <Input value={header.drawing_ref} onChange={(e) => setHeader({ ...header, drawing_ref: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-medium text-text-muted">
          Drawing revision
          <Input value={header.drawing_revision} onChange={(e) => setHeader({ ...header, drawing_revision: e.target.value })} />
        </label>
        <div className="space-y-1 text-xs font-medium text-text-muted md:col-span-2">
          Drawing file (PDF / PNG / JPG, max 20 MB)
          <div className="flex flex-wrap items-center gap-2">
            {drawingName && (
              <>
                <a href={`/api/factory-orders/${order.id}/drawing`} target="_blank" rel="noreferrer" className="text-sm text-text-primary underline">
                  {drawingName}
                </a>
                <button type="button" onClick={removeDrawing} className="text-xs text-text-muted hover:text-text-primary">
                  Remove
                </button>
              </>
            )}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              disabled={uploading}
              onChange={uploadDrawing}
              className="text-sm"
            />
          </div>
        </div>
        <label className="space-y-1 text-xs font-medium text-text-muted md:col-span-4">
          Notes
          <Input value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} />
        </label>
      </div>

      {/* Items per section */}
      {FACTORY_SECTIONS.map((section) => {
        const sectionItems = items.filter((i) => i.section === section)
        const extras = EXTRAS[section]
        const showSqft = SQFT_SECTIONS.includes(section)
        return (
          <div key={section} className="rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h2 className="text-sm font-semibold text-text-primary">
                {FACTORY_SECTION_LABELS[section]}
                {showSqft && sectionItems.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-text-muted">Total {sectionSqft(sectionItems)} sqft</span>
                )}
              </h2>
              <Button size="sm" variant="outline" onClick={() => setItems((p) => [...p, newItem(section)])}>
                <Plus className="h-3.5 w-3.5" /> Add row
              </Button>
            </div>
            {sectionItems.length > 0 && (
              <>
              {/* Mobile: one card per item */}
              <div className="space-y-3 p-3 md:hidden">
                {sectionItems.map((item, idx) => (
                  <div key={item.id} className="space-y-3 rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-muted">Item {idx + 1}</span>
                      <div className="flex items-center">
                        <button type="button" aria-label="Move up" className="flex h-10 w-10 items-center justify-center text-text-muted" onClick={() => move(item.id, -1)}>
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Move down" className="flex h-10 w-10 items-center justify-center text-text-muted" onClick={() => move(item.id, 1)}>
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Delete row" className="flex h-10 w-10 items-center justify-center text-text-muted" onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <MField label="Description">
                      <Input value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
                    </MField>
                    <div className="grid grid-cols-4 gap-2">
                      {(['width', 'depth', 'height'] as const).map((dim) => (
                        <MField key={dim} label={dim === 'width' ? 'W' : dim === 'depth' ? 'D' : 'H'}>
                          <Input
                            inputMode="decimal"
                            value={item[dim] ?? ''}
                            onChange={(e) => updateItem(item.id, { [dim]: toNumber(e.target.value) })}
                          />
                        </MField>
                      ))}
                      <MField label="Qty">
                        <Input
                          inputMode="decimal"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, { qty: toNumber(e.target.value) ?? 0 })}
                        />
                      </MField>
                    </div>
                    {showSqft && (
                      <p className="text-xs text-text-muted">Sqft: <span className="text-sm text-text-primary">{itemSqft(item) ?? '—'}</span></p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {(['material', 'finish', 'hardware'] as const).map((f) => (
                        <MField key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
                          <Input value={item[f]} onChange={(e) => updateItem(item.id, { [f]: e.target.value })} />
                        </MField>
                      ))}
                      {extras.map((x) => (
                        <MField key={x.key} label={x.label}>
                          <Input
                            value={item.meta[x.key] ?? ''}
                            onChange={(e) =>
                              updateMeta(item.id, {
                                [x.key]: x.numeric ? (toNumber(e.target.value) ?? undefined) : e.target.value,
                              })
                            }
                          />
                        </MField>
                      ))}
                    </div>
                    <MField label="Remarks">
                      <Input value={item.remarks} onChange={(e) => updateItem(item.id, { remarks: e.target.value })} />
                    </MField>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className={TH}>#</th>
                      <th className={TH}>Description</th>
                      <th className={TH}>W</th>
                      <th className={TH}>D</th>
                      <th className={TH}>H</th>
                      <th className={TH}>Qty</th>
                      {showSqft && <th className={TH}>Sqft</th>}
                      <th className={TH}>Material</th>
                      <th className={TH}>Finish</th>
                      <th className={TH}>Hardware</th>
                      {extras.map((x) => (
                        <th key={x.key} className={TH}>{x.label}</th>
                      ))}
                      <th className={TH}>Remarks</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {sectionItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="px-1.5 text-xs text-text-muted">{idx + 1}</td>
                        <td className="p-1">
                          <Input className={`${CELL} min-w-64`} value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
                        </td>
                        {(['width', 'depth', 'height'] as const).map((dim) => (
                          <td key={dim} className="p-1">
                            <Input
                              className={`${CELL} w-16`}
                              inputMode="decimal"
                              value={item[dim] ?? ''}
                              onChange={(e) => updateItem(item.id, { [dim]: toNumber(e.target.value) })}
                            />
                          </td>
                        ))}
                        <td className="p-1">
                          <Input
                            className={`${CELL} w-14`}
                            inputMode="decimal"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, { qty: toNumber(e.target.value) ?? 0 })}
                          />
                        </td>
                        {showSqft && (
                          <td className="whitespace-nowrap px-1.5 text-sm text-text-primary">{itemSqft(item) ?? ''}</td>
                        )}
                        {(['material', 'finish', 'hardware'] as const).map((f) => (
                          <td key={f} className="p-1">
                            <Input className={`${CELL} w-28`} value={item[f]} onChange={(e) => updateItem(item.id, { [f]: e.target.value })} />
                          </td>
                        ))}
                        {extras.map((x) => (
                          <td key={x.key} className="p-1">
                            <Input
                              className={`${CELL} ${x.width}`}
                              value={item.meta[x.key] ?? ''}
                              onChange={(e) =>
                                updateMeta(item.id, {
                                  [x.key]: x.numeric ? (toNumber(e.target.value) ?? undefined) : e.target.value,
                                })
                              }
                            />
                          </td>
                        ))}
                        <td className="p-1">
                          <Input className={`${CELL} w-40`} value={item.remarks} onChange={(e) => updateItem(item.id, { remarks: e.target.value })} />
                        </td>
                        <td className="whitespace-nowrap p-1">
                          <button type="button" aria-label="Move up" className="p-1 text-text-muted hover:text-text-primary" onClick={() => move(item.id, -1)}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" aria-label="Move down" className="p-1 text-text-muted hover:text-text-primary" onClick={() => move(item.id, 1)}>
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" aria-label="Delete row" className="p-1 text-text-muted hover:text-text-primary" onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )
      })}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        <a href={`/api/factory-orders/${order.id}/export/xlsx`} download={`${exportName}.xlsx`}>
          <Button variant="outline" type="button">Download Excel</Button>
        </a>
        <a href={`/api/factory-orders/${order.id}/export/pdf`} download={`${exportName}.pdf`}>
          <Button variant="outline" type="button">Download PDF</Button>
        </a>
        <Button variant="outline" onClick={remove}>Delete</Button>
        {message && <span className="text-sm text-text-muted">{message}</span>}
      </div>
    </div>
  )
}
