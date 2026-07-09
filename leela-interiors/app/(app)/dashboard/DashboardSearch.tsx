'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { formatINR, formatDate } from '@/lib/format'

type CostingRow = {
  id: string
  costing_number: string | null
  client_name: string | null
  grand_total: number | string | null
  created_at: string | null
}

type Props = {
  initialQuery: string
  initialResults: CostingRow[] | null
}

export function DashboardSearch({ initialQuery, initialResults }: Props) {
  const [value, setValue] = useState(initialQuery)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      router.push(`/dashboard?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/dashboard')
    }
  }

  // Show results only when there's an active server-side query and the input is non-empty
  const showResults = !!initialQuery && value.length > 0

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <input
            value={value}
            onChange={handleChange}
            placeholder="Search by client name or costing number…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Search
        </button>
      </form>

      {showResults && (
        <div className="mt-4">
          <p className="text-sm text-text-muted mb-3">
            Results for &ldquo;{initialQuery}&rdquo;
          </p>
          {!initialResults || initialResults.length === 0 ? (
            <p className="text-sm text-text-muted">No results found.</p>
          ) : (
            <SearchResultsTable costings={initialResults} />
          )}
        </div>
      )}
    </div>
  )
}

function SearchResultsTable({ costings }: { costings: CostingRow[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bg-surface border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Costing No.
            </th>
            <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Client
            </th>
            <th className="text-right px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Grand Total
            </th>
            <th className="text-left px-4 py-3 font-medium text-text-muted text-xs uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {costings.map((c) => (
            <tr key={c.id} className="hover:bg-bg-surface/60 transition-colors">
              <td className="px-4 py-3 font-medium text-text-primary">
                {c.costing_number ?? '—'}
              </td>
              <td className="px-4 py-3 text-text-primary">
                {c.client_name ?? <span className="text-text-muted italic">—</span>}
              </td>
              <td className="px-4 py-3 text-right font-medium text-text-primary">
                {formatINR(Number(c.grand_total ?? 0))}
              </td>
              <td className="px-4 py-3 text-text-muted">
                {c.created_at ? formatDate(c.created_at) : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/costings/${c.id}`}
                  className="text-accent hover:underline text-sm font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
