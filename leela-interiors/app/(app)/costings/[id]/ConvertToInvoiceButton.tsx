'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ConvertToInvoiceButton({ costingId }: { costingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleConvert() {
    setLoading(true)
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ costingId }),
    })
    const json = await res.json()
    if (res.ok || res.status === 400) {
      // 201 = new invoice created; 400 = invoice already exists — in both cases navigate to it
      const id = json?.data?.id
      if (id) {
        router.push(`/invoices/${id}`)
        return
      }
    }
    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleConvert} disabled={loading}>
      <FileText className="h-4 w-4" />
      {loading ? 'Creating…' : 'Convert to Invoice'}
    </Button>
  )
}
