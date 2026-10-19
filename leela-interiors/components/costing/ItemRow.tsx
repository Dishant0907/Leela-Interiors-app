'use client'

import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/format'
import { useAutocorrect } from '@/lib/useAutocorrect'
import { UNITS, UNIT_LABELS, DEFAULT_UNIT } from '@/lib/constants'

export type FormItem = {
  id: string
  description: string
  hsn_sac: string
  unit: string
  qty: string
  rate: string
  amount: number
}

export type MasterItemSuggestion = {
  id: string
  name: string
  default_rate: number
  section: string
  hsn_sac?: string | null
  unit?: string | null
}

interface ItemRowProps {
  item: FormItem
  index: number
  onChange: (field: 'description' | 'qty' | 'rate' | 'hsn_sac' | 'unit', value: string) => void
  onRemove: () => void
  suggestions?: MasterItemSuggestion[]
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] font-medium text-text-muted sm:hidden">{children}</span>
}

export function ItemRow({ item, index, onChange, onRemove, suggestions = [] }: ItemRowProps) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const descAC = useAutocorrect((v) => onChange('description', v))

  const filtered = item.description.trim()
    ? suggestions.filter(s => s.name.toLowerCase().includes(item.description.toLowerCase()))
    : suggestions

  function handleFocus() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (suggestions.length > 0) setOpen(true)
  }

  function handleBlur() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  function selectSuggestion(s: MasterItemSuggestion) {
    onChange('description', s.name)
    onChange('rate', String(s.default_rate))
    if (s.hsn_sac) onChange('hsn_sac', s.hsn_sac)
    onChange('unit', s.unit || DEFAULT_UNIT)
    setOpen(false)
  }

  return (
    <div className="grid grid-cols-2 gap-2 items-end rounded-lg border border-border p-3 sm:grid-cols-[28px_1fr_80px_76px_60px_92px_92px_32px] sm:items-center sm:rounded-none sm:border-0 sm:p-0">
      <span className="col-span-2 text-xs font-medium text-text-muted tabular-nums sm:col-span-1 sm:text-right">
        <span className="sm:hidden">Item </span>{index + 1}
      </span>

      {/* Description with autocomplete */}
      <div className="relative col-span-2 sm:col-span-1">
        <MobileLabel>Description</MobileLabel>
        <Input
          className="h-10 sm:h-8"
          placeholder="Item description"
          value={item.description}
          onChange={e => onChange('description', e.target.value)}
          onFocus={handleFocus}
          onBlur={e => { handleBlur(); descAC.onBlurWithCorrect(e) }}
          autoComplete="off"
          spellCheck
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-md text-sm">
            {filtered.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className="w-full flex items-center justify-between px-3 py-3 sm:py-2 hover:bg-accent/10 text-left"
                >
                  <span className="text-text-primary truncate">{s.name}</span>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {s.hsn_sac && <span className="text-text-muted text-xs">{s.hsn_sac}</span>}
                    <span className="text-text-muted tabular-nums">{formatINR(s.default_rate)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* HSN/SAC */}
      <div>
        <MobileLabel>HSN/SAC</MobileLabel>
        <Input
          placeholder="HSN/SAC"
          value={item.hsn_sac}
          onChange={e => onChange('hsn_sac', e.target.value)}
          spellCheck={false}
          maxLength={8}
          className="h-10 text-center font-mono text-xs sm:h-8"
        />
      </div>

      {/* Unit */}
      <div>
        <MobileLabel>Unit</MobileLabel>
        <select
          value={item.unit || DEFAULT_UNIT}
          onChange={e => onChange('unit', e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-transparent px-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors sm:h-8 sm:text-xs"
        >
          {UNITS.map(u => (
            <option key={u} value={u}>{UNIT_LABELS[u]}</option>
          ))}
        </select>
      </div>

      <div>
        <MobileLabel>Qty</MobileLabel>
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={item.qty}
          onChange={e => onChange('qty', e.target.value)}
          className="h-10 text-right sm:h-8"
        />
      </div>
      <div>
        <MobileLabel>Rate (₹)</MobileLabel>
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={item.rate}
          onChange={e => onChange('rate', e.target.value)}
          className="h-10 text-right sm:h-8"
        />
      </div>
      <div>
        <MobileLabel>Amount (₹)</MobileLabel>
        <div className="h-10 rounded-lg border border-input bg-muted/50 flex items-center justify-end px-2.5 text-sm text-text-muted tabular-nums sm:h-8">
          {item.amount > 0 ? formatINR(item.amount) : '—'}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Remove row"
        className="h-10 w-10 justify-self-end text-text-muted hover:text-destructive sm:h-8 sm:w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
