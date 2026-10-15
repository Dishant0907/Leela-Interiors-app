'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Factory } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CreateFactoryOrderButton({ costingId }: { costingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    const res = await fetch('/api/factory-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ costingId }),
    })
    const json = await res.json()
    // 201 = created; 400 = one already exists — navigate to it either way
    const id = json?.data?.id
    if (id) {
      router.push(`/factory-orders/${id}`)
      return
    }
    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCreate} disabled={loading}>
      <Factory className="h-4 w-4" />
      {loading ? 'Creating…' : 'Factory Order'}
    </Button>
  )
}
