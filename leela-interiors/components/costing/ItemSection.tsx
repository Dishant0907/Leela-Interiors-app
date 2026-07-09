'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ItemRow, type FormItem, type MasterItemSuggestion } from './ItemRow'
import { SECTION_LABELS } from '@/lib/constants'
import type { Section } from '@/types/costing'

interface ItemSectionProps {
  section: Section
  items: FormItem[]
  masterItems?: MasterItemSuggestion[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: 'description' | 'qty' | 'rate' | 'hsn_sac' | 'unit', value: string) => void
}

export function ItemSection({ section, items, masterItems = [], onAdd, onRemove, onChange }: ItemSectionProps) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border p-5 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {SECTION_LABELS[section]}
      </h2>

      {items.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[28px_1fr_80px_76px_60px_92px_92px_32px] gap-2 px-1">
            <span />
            <span className="text-xs text-text-muted font-medium">Description</span>
            <span className="text-xs text-text-muted font-medium text-center">HSN/SAC</span>
            <span className="text-xs text-text-muted font-medium text-center">Unit</span>
            <span className="text-xs text-text-muted font-medium text-right">Qty</span>
            <span className="text-xs text-text-muted font-medium text-right">Rate (₹)</span>
            <span className="text-xs text-text-muted font-medium text-right">Amount (₹)</span>
            <span />
          </div>
          {items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              index={i}
              suggestions={masterItems}
              onChange={(field, value) => onChange(item.id, field, value)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        Add Row
      </Button>
    </section>
  )
}
