import Link from 'next/link'
import { ArrowLeft, ChevronRight, FileText, Folder, Home, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatINR, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const UNDATED = 'Undated'
const NO_CLIENT = 'No client'

interface DocEntry {
  id: string
  kind: 'costing' | 'invoice'
  number: string
  date: string | null
  total: number
  status: string
  year: string
  month: string
  client: string
}

interface Crumb {
  label: string
  href: string
}

function buildHref(params: { year?: string; month?: string; client?: string }) {
  const qs = new URLSearchParams()
  if (params.year) qs.set('year', params.year)
  if (params.month) qs.set('month', params.month)
  if (params.client) qs.set('client', params.client)
  const s = qs.toString()
  return s ? `/documents?${s}` : '/documents'
}

function monthLabel(month: string) {
  return month === UNDATED ? UNDATED : MONTH_NAMES[Number(month) - 1] ?? month
}

function sortDesc(keys: string[]) {
  return keys.sort((a, b) => {
    if (a === UNDATED) return 1
    if (b === UNDATED) return -1
    return b.localeCompare(a)
  })
}

function sortClients(keys: string[]) {
  return keys.sort((a, b) => {
    if (a === NO_CLIENT) return 1
    if (b === NO_CLIENT) return -1
    return a.localeCompare(b)
  })
}

function groupCounts(docs: DocEntry[], key: (d: DocEntry) => string) {
  const counts = new Map<string, number>()
  for (const d of docs) counts.set(key(d), (counts.get(key(d)) ?? 0) + 1)
  return counts
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; client?: string }>
}) {
  const { year, month, client } = await searchParams
  const supabase = await createClient()

  const [{ data: costings }, { data: invoices }] = await Promise.all([
    supabase
      .from('costings')
      .select('id, costing_number, client_name, grand_total, status, costing_date'),
    supabase
      .from('invoices')
      .select('id, invoice_number, grand_total, status, invoice_date, costings(client_name)'),
  ])

  const all: DocEntry[] = []

  function push(
    base: Pick<DocEntry, 'id' | 'kind' | 'number' | 'total' | 'status'>,
    date: string | null,
    clientName: string | null,
  ) {
    all.push({
      ...base,
      date,
      year: date ? date.slice(0, 4) : UNDATED,
      month: date ? date.slice(5, 7) : UNDATED,
      client: clientName?.trim() || NO_CLIENT,
    })
  }

  for (const c of costings ?? []) {
    push(
      { id: c.id, kind: 'costing', number: c.costing_number, total: Number(c.grand_total), status: c.status },
      c.costing_date,
      c.client_name,
    )
  }
  for (const inv of invoices ?? []) {
    const clientName =
      (inv.costings as unknown as { client_name: string | null } | null)?.client_name ?? null
    push(
      { id: inv.id, kind: 'invoice', number: inv.invoice_number, total: Number(inv.grand_total), status: inv.status },
      inv.invoice_date,
      clientName,
    )
  }

  const crumbs: Crumb[] = [{ label: 'All Years', href: buildHref({}) }]
  if (year) crumbs.push({ label: year, href: buildHref({ year }) })
  if (year && month) crumbs.push({ label: monthLabel(month), href: buildHref({ year, month }) })
  if (year && month && client) crumbs.push({ label: client, href: buildHref({ year, month, client }) })

  const backHref = crumbs.length > 1 ? crumbs[crumbs.length - 2].href : null

  let folders: { name: string; label: string; count: number; href: string }[] = []
  let files: DocEntry[] = []

  if (!year) {
    const counts = groupCounts(all, (d) => d.year)
    folders = sortDesc([...counts.keys()]).map((y) => ({
      name: y,
      label: y,
      count: counts.get(y)!,
      href: buildHref({ year: y }),
    }))
  } else if (!month) {
    const inYear = all.filter((d) => d.year === year)
    const counts = groupCounts(inYear, (d) => d.month)
    folders = sortDesc([...counts.keys()]).map((m) => ({
      name: m,
      label: monthLabel(m),
      count: counts.get(m)!,
      href: buildHref({ year, month: m }),
    }))
  } else if (!client) {
    const inMonth = all.filter((d) => d.year === year && d.month === month)
    const counts = groupCounts(inMonth, (d) => d.client)
    folders = sortClients([...counts.keys()]).map((c) => ({
      name: c,
      label: c,
      count: counts.get(c)!,
      href: buildHref({ year, month, client: c }),
    }))
  } else {
    files = all
      .filter((d) => d.year === year && d.month === month && d.client === client)
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }

  const isEmpty = folders.length === 0 && files.length === 0

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-semibold text-text-primary mb-5">Documents</h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-base font-medium text-text-primary hover:bg-bg-surface"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Link>
        )}
        <nav
          aria-label="Folder path"
          className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-base"
        >
          <Home className="mr-1 h-5 w-5 text-text-muted" />
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1
            return (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-4 w-4 text-text-muted" />}
                {last ? (
                  <span className="font-semibold text-text-primary">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-text-primary hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </span>
            )
          })}
        </nav>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted text-lg">
            {year ? 'This folder is empty.' : 'No costings or invoices yet.'}
          </p>
        </div>
      ) : files.length > 0 ? (
        <ul className="space-y-3">
          {files.map((doc) => (
            <FileRow key={`${doc.kind}-${doc.id}`} doc={doc} />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {folders.map((f) => (
            <li key={f.name}>
              <Link
                href={f.href}
                className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-white p-6 text-center transition-colors hover:bg-bg-surface"
              >
                <Folder className="h-16 w-16 text-text-muted" strokeWidth={1.5} />
                <span className="text-xl font-semibold text-text-primary wrap-break-word">
                  {f.label}
                </span>
                <span className="text-base text-text-muted">
                  {f.count} {f.count === 1 ? 'file' : 'files'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FileRow({ doc }: { doc: DocEntry }) {
  const isCosting = doc.kind === 'costing'
  const Icon = isCosting ? FileText : Receipt
  return (
    <li>
      <Link
        href={isCosting ? `/costings/${doc.id}` : `/invoices/${doc.id}`}
        className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-border bg-white px-4 py-3 sm:px-5 sm:py-4 transition-colors hover:bg-bg-surface"
      >
        <Icon className="h-9 w-9 shrink-0 text-text-muted" strokeWidth={1.5} />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-text-primary">{doc.number}</p>
          <p className="text-base text-text-muted">
            <span className="font-medium text-text-primary">
              {isCosting ? 'Costing' : 'Invoice'}
            </span>
            {' · '}
            <span className="capitalize">{doc.status}</span>
          </p>
        </div>
        <p className="ml-auto text-base text-text-muted">
          {doc.date ? formatDate(doc.date) : '—'}
        </p>
        <p className="sm:w-36 text-right text-lg font-semibold text-text-primary">
          {formatINR(doc.total)}
        </p>
      </Link>
    </li>
  )
}
