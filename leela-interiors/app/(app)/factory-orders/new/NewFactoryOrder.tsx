'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/** Creates a blank factory order and redirects to its editor. */
export function NewFactoryOrder() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    fetch('/api/factory-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.id) router.replace(`/factory-orders/${json.data.id}`)
        else setError(json?.error ?? 'Could not create order')
      })
      .catch(() => setError('Could not create order'))
  }, [router])

  return <p className="p-6 text-sm text-text-muted">{error ?? 'Creating factory order…'}</p>
}
