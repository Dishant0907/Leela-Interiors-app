'use client'

import { useReducer, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ItemSection } from './ItemSection'
import { TotalsStrip } from './TotalsStrip'
import { type FormItem, type MasterItemSuggestion } from './ItemRow'
import { calculateTotals } from '@/lib/costing'
import { GST_RATE, SECTIONS, DEFAULT_UNIT } from '@/lib/constants'
import type { Section, CostingFormState, LineItem, TransactionType } from '@/types/costing'
import { useAutocorrect } from '@/lib/useAutocorrect'

// ── Local form state (qty/rate as strings for controlled inputs) ───────────────

type ClientSuggestion = {
  id: string
  name: string
  phone: string | null
  address: string | null
  reference: string | null
}

type FormState = {
  clientId: string
  clientName: string
  clientPhone: string
  clientAddress: string
  clientReference: string
  clientGstin: string
  shutterTop: string
  shutterBase: string
  cabinetColor: string
  sections: Record<Section, FormItem[]>
  freight: string
  gstRate: string
  transactionType: TransactionType
  notes: string
}

type StringField =
  | 'clientName' | 'clientPhone' | 'clientAddress' | 'clientReference' | 'clientGstin'
  | 'shutterTop' | 'shutterBase' | 'cabinetColor'
  | 'freight' | 'gstRate' | 'notes'

type Action =
  | { type: 'SET_FIELD'; field: StringField; value: string }
  | { type: 'SET_TRANSACTION_TYPE'; value: TransactionType }
  | { type: 'SET_CLIENT'; client: ClientSuggestion }
  | { type: 'CLEAR_CLIENT_ID' }
  | { type: 'ADD_ROW'; section: Section }
  | { type: 'REMOVE_ROW'; section: Section; id: string }
  | { type: 'UPDATE_ROW'; section: Section; id: string; field: 'description' | 'qty' | 'rate' | 'hsn_sac' | 'unit'; value: string }

function makeItem(): FormItem {
  return { id: crypto.randomUUID(), description: '', hsn_sac: '', unit: DEFAULT_UNIT, qty: '', rate: '', amount: 0 }
}

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_TRANSACTION_TYPE':
      return { ...state, transactionType: action.value }
    case 'SET_CLIENT':
      return {
        ...state,
        clientId: action.client.id,
        clientName: action.client.name,
        clientPhone: action.client.phone ?? '',
        clientAddress: action.client.address ?? '',
        clientReference: action.client.reference ?? '',
      }
    case 'CLEAR_CLIENT_ID':
      return { ...state, clientId: '' }
    case 'ADD_ROW':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: [...state.sections[action.section], makeItem()],
        },
      }
    case 'REMOVE_ROW':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: state.sections[action.section].filter(r => r.id !== action.id),
        },
      }
    case 'UPDATE_ROW':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: state.sections[action.section].map(r => {
            if (r.id !== action.id) return r
            const updated = { ...r, [action.field]: action.value }
            if (action.field === 'qty' || action.field === 'rate') {
              const qty = parseFloat(action.field === 'qty' ? action.value : r.qty) || 0
              const rate = parseFloat(action.field === 'rate' ? action.value : r.rate) || 0
              updated.amount = Math.round(qty * rate * 100) / 100
            }
            return updated
          }),
        },
      }
  }
}

const INITIAL: FormState = {
  clientId: '',
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  clientReference: '',
  clientGstin: '',
  shutterTop: '',
  shutterBase: '',
  cabinetColor: '',
  sections: { kitchen: [], accessories: [], hardware: [], civil: [] },
  freight: '',
  gstRate: String(GST_RATE),
  transactionType: 'intra',
  notes: '',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fromApiState(state: CostingFormState): FormState {
  const toFormItem = (i: LineItem): FormItem => ({
    id: i.id,
    description: i.description,
    hsn_sac: i.hsn_sac ?? '',
    unit: i.unit || DEFAULT_UNIT,
    qty: i.qty === 0 ? '' : String(i.qty),
    rate: i.rate === 0 ? '' : String(i.rate),
    amount: i.amount,
  })
  return {
    clientId: state.clientId ?? '',
    clientName: state.clientName,
    clientPhone: state.clientPhone,
    clientAddress: state.clientAddress,
    clientReference: state.clientReference,
    clientGstin: state.clientGstin ?? '',
    shutterTop: state.shutterTop,
    shutterBase: state.shutterBase,
    cabinetColor: state.cabinetColor,
    sections: {
      kitchen: state.sections.kitchen.map(toFormItem),
      accessories: state.sections.accessories.map(toFormItem),
      hardware: state.sections.hardware.map(toFormItem),
      civil: state.sections.civil.map(toFormItem),
    },
    freight: state.freight === 0 ? '' : String(state.freight),
    gstRate: String(state.gstRate),
    transactionType: state.transactionType ?? 'intra',
    notes: state.notes,
  }
}

function toLineItem(item: FormItem): LineItem {
  return {
    id: item.id,
    description: item.description,
    hsn_sac: item.hsn_sac || undefined,
    unit: item.unit || DEFAULT_UNIT,
    qty: parseFloat(item.qty) || 0,
    rate: parseFloat(item.rate) || 0,
    amount: item.amount,
  }
}

function toApiState(state: FormState): CostingFormState {
  return {
    clientId: state.clientId || undefined,
    clientName: state.clientName,
    clientPhone: state.clientPhone,
    clientAddress: state.clientAddress,
    clientReference: state.clientReference,
    clientGstin: state.clientGstin || undefined,
    shutterTop: state.shutterTop,
    shutterBase: state.shutterBase,
    cabinetColor: state.cabinetColor,
    sections: {
      kitchen: state.sections.kitchen.map(toLineItem),
      accessories: state.sections.accessories.map(toLineItem),
      hardware: state.sections.hardware.map(toLineItem),
      civil: state.sections.civil.map(toLineItem),
    },
    freight: parseFloat(state.freight) || 0,
    gstRate: parseFloat(state.gstRate) || GST_RATE,
    transactionType: state.transactionType,
    notes: state.notes,
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface CostingFormProps {
  onUpdate?: (state: CostingFormState) => void
  initialState?: CostingFormState
  costingId?: string
}

export function CostingForm({ onUpdate, initialState, costingId }: CostingFormProps = {}) {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState ? fromApiState(initialState) : INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [masterItems, setMasterItems] = useState<MasterItemSuggestion[]>([])
  const fetchedRef = useRef(false)

  const setField = useCallback((field: StringField) => (v: string) =>
    dispatch({ type: 'SET_FIELD', field, value: v }), [])

  const addressAC = useAutocorrect(setField('clientAddress'))
  const referenceAC = useAutocorrect(setField('clientReference'))
  const shutterTopAC = useAutocorrect(setField('shutterTop'))
  const shutterBaseAC = useAutocorrect(setField('shutterBase'))
  const cabinetColorAC = useAutocorrect(setField('cabinetColor'))
  const notesAC = useAutocorrect(setField('notes'))

  const allCorrections = [
    ...addressAC.lastCorrections,
    ...referenceAC.lastCorrections,
    ...shutterTopAC.lastCorrections,
    ...shutterBaseAC.lastCorrections,
    ...cabinetColorAC.lastCorrections,
    ...notesAC.lastCorrections,
  ]

  // Client autocomplete
  const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const clientSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clientWrapperRef = useRef<HTMLDivElement>(null)

  const searchClients = useCallback((q: string) => {
    if (clientSearchTimeout.current) clearTimeout(clientSearchTimeout.current)
    if (!q.trim()) { setClientSuggestions([]); setShowSuggestions(false); return }
    clientSearchTimeout.current = setTimeout(() => {
      fetch(`/api/clients?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(json => {
          if (Array.isArray(json.data)) {
            setClientSuggestions(json.data)
            setShowSuggestions(json.data.length > 0)
          }
        })
        .catch(() => {})
    }, 200)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (clientWrapperRef.current && !clientWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetch('/api/items')
      .then(r => r.json())
      .then(json => { if (Array.isArray(json.data)) setMasterItems(json.data) })
      .catch(() => {})
  }, [])

  const apiState = toApiState(state)
  const totals = calculateTotals(apiState)

  // Lift current state to parent for live preview
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onUpdate && onUpdate(toApiState(state))
  // onUpdate is a stable setState setter from parent — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const isEdit = Boolean(costingId)
      const res = await fetch(isEdit ? `/api/costings/${costingId}` : '/api/costings', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiState),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Save failed')
      }
      router.push(`/costings/${isEdit ? costingId : json.data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{costingId ? 'Edit Costing' : 'New Costing'}</h1>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive">{error}</span>}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Autocorrect notice */}
      {allCorrections.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <span>✏️ Auto-corrected:</span>
          {allCorrections.map((c, i) => (
            <span key={i} className="font-medium">&ldquo;{c.original}&rdquo; → &ldquo;{c.corrected}&rdquo;</span>
          ))}
        </div>
      )}

      {/* Client details */}
      <section className="rounded-xl bg-bg-surface border border-border p-5 space-y-4">
        <SectionHeading>Client Details</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" htmlFor="clientName">
            <div ref={clientWrapperRef} className="relative">
              <Input
                id="clientName"
                placeholder="Client name"
                value={state.clientName}
                autoComplete="off"
                spellCheck
                onChange={e => {
                  dispatch({ type: 'SET_FIELD', field: 'clientName', value: e.target.value })
                  dispatch({ type: 'CLEAR_CLIENT_ID' })
                  searchClients(e.target.value)
                }}
                onFocus={() => { if (clientSuggestions.length > 0) setShowSuggestions(true) }}
              />
              {showSuggestions && (
                <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-white shadow-md text-sm overflow-hidden">
                  {clientSuggestions.map(c => (
                    <li
                      key={c.id}
                      className="px-3 py-2 cursor-pointer hover:bg-bg-surface transition-colors"
                      onMouseDown={e => {
                        e.preventDefault()
                        dispatch({ type: 'SET_CLIENT', client: c })
                        setShowSuggestions(false)
                        setClientSuggestions([])
                      }}
                    >
                      <span className="font-medium text-text-primary">{c.name}</span>
                      {c.phone && <span className="ml-2 text-text-muted">{c.phone}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>
          <Field label="Phone" htmlFor="clientPhone">
            <Input
              id="clientPhone"
              placeholder="+91 98765 43210"
              value={state.clientPhone}
              spellCheck={false}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'clientPhone', value: e.target.value })}
            />
          </Field>
          <Field label="Address" htmlFor="clientAddress">
            <Input
              id="clientAddress"
              placeholder="Full address"
              value={state.clientAddress}
              spellCheck
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'clientAddress', value: e.target.value })}
              onBlur={addressAC.onBlurWithCorrect}
            />
          </Field>
          <Field label="Reference" htmlFor="clientReference">
            <Input
              id="clientReference"
              placeholder="How did they find you?"
              value={state.clientReference}
              spellCheck
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'clientReference', value: e.target.value })}
              onBlur={referenceAC.onBlurWithCorrect}
            />
          </Field>
          <Field label="Client GSTIN (optional — B2B)" htmlFor="clientGstin">
            <Input
              id="clientGstin"
              placeholder="27AAAPL2345C1Z5"
              value={state.clientGstin}
              spellCheck={false}
              maxLength={15}
              className="font-mono tracking-wider"
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'clientGstin', value: e.target.value.toUpperCase() })}
            />
          </Field>
        </div>
      </section>

      {/* Colour specification */}
      <section className="rounded-xl bg-bg-surface border border-border p-5 space-y-4">
        <SectionHeading>Colour Specification</SectionHeading>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Top Shutter" htmlFor="shutterTop">
            <Input
              id="shutterTop"
              placeholder="e.g. Ivory"
              value={state.shutterTop}
              spellCheck
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'shutterTop', value: e.target.value })}
              onBlur={shutterTopAC.onBlurWithCorrect}
            />
          </Field>
          <Field label="Base Shutter" htmlFor="shutterBase">
            <Input
              id="shutterBase"
              placeholder="e.g. White"
              value={state.shutterBase}
              spellCheck
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'shutterBase', value: e.target.value })}
              onBlur={shutterBaseAC.onBlurWithCorrect}
            />
          </Field>
          <Field label="Cabinet" htmlFor="cabinetColor">
            <Input
              id="cabinetColor"
              placeholder="e.g. Sand"
              value={state.cabinetColor}
              spellCheck
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'cabinetColor', value: e.target.value })}
              onBlur={cabinetColorAC.onBlurWithCorrect}
            />
          </Field>
        </div>
      </section>

      {/* Item sections */}
      {SECTIONS.map(section => (
        <ItemSection
          key={section}
          section={section}
          items={state.sections[section]}
          masterItems={masterItems.filter(i => i.section === section)}
          onAdd={() => dispatch({ type: 'ADD_ROW', section })}
          onRemove={id => dispatch({ type: 'REMOVE_ROW', section, id })}
          onChange={(id, field, value) => dispatch({ type: 'UPDATE_ROW', section, id, field, value })}
        />
      ))}

      {/* Additional charges */}
      <section className="rounded-xl bg-bg-surface border border-border p-5 space-y-4">
        <SectionHeading>Additional Charges &amp; GST</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Freight & Fitting (₹)" htmlFor="freight">
            <Input
              id="freight"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={state.freight}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'freight', value: e.target.value })}
            />
          </Field>
          <Field label="GST Rate — on Kitchen Work only (%)" htmlFor="gstRate">
            <Input
              id="gstRate"
              type="number"
              min="0"
              max="100"
              step="any"
              placeholder="18"
              value={state.gstRate}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'gstRate', value: e.target.value })}
            />
          </Field>
        </div>

        {/* Transaction type toggle */}
        <div>
          <p className="text-xs font-medium text-text-muted mb-2">Transaction Type</p>
          <div className="flex gap-3">
            {(['intra', 'inter'] as TransactionType[]).map(type => (
              <label
                key={type}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                  state.transactionType === type
                    ? 'border-ring bg-ring/10 text-text-primary font-medium'
                    : 'border-border text-text-muted hover:bg-accent/5'
                }`}
              >
                <input
                  type="radio"
                  name="transactionType"
                  value={type}
                  checked={state.transactionType === type}
                  onChange={() => dispatch({ type: 'SET_TRANSACTION_TYPE', value: type })}
                  className="sr-only"
                />
                {type === 'intra' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Notes / Terms */}
      <section className="rounded-xl bg-bg-surface border border-border p-5 space-y-3">
        <SectionHeading>Notes / Terms</SectionHeading>
        <textarea
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y min-h-40 transition-colors"
          value={state.notes}
          spellCheck
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
          onBlur={notesAC.onBlurWithCorrect}
        />
      </section>

      {/* Totals summary */}
      <TotalsStrip totals={totals} gstRate={apiState.gstRate} freight={apiState.freight} transactionType={apiState.transactionType} />

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Costing'}
        </Button>
      </div>
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
      {children}
    </h2>
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
