'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatINR, formatDate } from '@/lib/format'

type PaymentStage = 'advance' | 'pre_delivery' | 'completion'

interface Payment {
  id: string
  stage: string
  amount: number
  paid_at: string
  notes: string | null
}

interface StageConfig {
  key: PaymentStage
  label: string
  pct: number
}

const STAGES: StageConfig[] = [
  { key: 'advance', label: 'Advance (60%)', pct: 0.6 },
  { key: 'pre_delivery', label: 'Pre-Delivery (30%)', pct: 0.3 },
  { key: 'completion', label: 'Completion (10%)', pct: 0.1 },
]

interface StageFormState {
  amount: string
  paidAt: string
  notes: string
  saving: boolean
  error: string | null
}

function emptyForm(): StageFormState {
  return {
    amount: '',
    paidAt: new Date().toISOString().slice(0, 10),
    notes: '',
    saving: false,
    error: null,
  }
}

interface Props {
  invoice: { id: string; grand_total: number }
  existingPayments: Payment[]
}

export function PaymentStages({ invoice, existingPayments }: Props) {
  const router = useRouter()
  const [forms, setForms] = useState<Record<PaymentStage, StageFormState>>({
    advance: emptyForm(),
    pre_delivery: emptyForm(),
    completion: emptyForm(),
  })

  const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0)
  const outstanding = invoice.grand_total - totalPaid

  let status: 'Pending' | 'Partial' | 'Paid'
  if (totalPaid >= invoice.grand_total) {
    status = 'Paid'
  } else if (totalPaid > 0) {
    status = 'Partial'
  } else {
    status = 'Pending'
  }

  const statusStyle: Record<typeof status, string> = {
    Pending: 'bg-yellow-500/10 text-yellow-500',
    Partial: 'bg-blue-500/10 text-blue-500',
    Paid: 'bg-green-500/10 text-green-500',
  }

  function paidForStage(stage: PaymentStage): Payment | undefined {
    return existingPayments.find((p) => p.stage === stage)
  }

  function updateForm(stage: PaymentStage, patch: Partial<StageFormState>) {
    setForms((prev) => ({ ...prev, [stage]: { ...prev[stage], ...patch } }))
  }

  async function save(stage: PaymentStage) {
    const form = forms[stage]
    const amount = parseFloat(form.amount)
    if (!form.paidAt || isNaN(amount) || amount <= 0) {
      updateForm(stage, { error: 'Enter a valid amount and date.' })
      return
    }
    updateForm(stage, { saving: true, error: null })

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice.id,
        stage,
        amount,
        paidAt: form.paidAt,
        notes: form.notes.trim() || null,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      updateForm(stage, { saving: false, error: json.error ?? 'Save failed.' })
      return
    }

    updateForm(stage, emptyForm())
    router.refresh()
  }

  return (
    <div className="mt-8 print:hidden">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Payment Tracking</h2>

      <div className="space-y-4 mb-6">
        {STAGES.map(({ key, label, pct }) => {
          const expected = invoice.grand_total * pct
          const recorded = paidForStage(key)
          const form = forms[key]

          return (
            <div key={key} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-text-primary">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-muted">Expected: {formatINR(expected)}</span>
                  {recorded && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                      Paid
                    </span>
                  )}
                </div>
              </div>

              {recorded ? (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted text-xs mb-0.5">Amount Paid</p>
                    <p className="text-text-primary font-medium">{formatINR(recorded.amount)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-0.5">Date</p>
                    <p className="text-text-primary">
                      {formatDate(recorded.paid_at)}
                    </p>
                  </div>
                  {recorded.notes && (
                    <div>
                      <p className="text-text-muted text-xs mb-0.5">Notes</p>
                      <p className="text-text-primary">{recorded.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={String(Math.round(expected))}
                      value={form.amount}
                      onChange={(e) => updateForm(key, { amount: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Date</label>
                    <input
                      type="date"
                      value={form.paidAt}
                      onChange={(e) => updateForm(key, { paidAt: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. cheque no."
                      value={form.notes}
                      onChange={(e) => updateForm(key, { notes: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <button
                      onClick={() => save(key)}
                      disabled={form.saving}
                      className="px-4 py-1.5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {form.saving ? 'Saving…' : 'Record Payment'}
                    </button>
                    {form.error && <p className="text-sm text-red-500">{form.error}</p>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">Total Received</p>
            <p className="text-lg font-semibold text-text-primary">{formatINR(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">Outstanding</p>
            <p className={`text-lg font-semibold ${outstanding <= 0 ? 'text-green-500' : 'text-text-primary'}`}>
              {formatINR(Math.max(0, outstanding))}
            </p>
          </div>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusStyle[status]}`}>
          {status}
        </span>
      </div>
    </div>
  )
}
