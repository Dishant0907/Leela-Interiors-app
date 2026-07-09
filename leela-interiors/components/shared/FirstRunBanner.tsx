'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface FirstRunBannerProps {
  show: boolean
}

export function FirstRunBanner({ show }: FirstRunBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setVisible(false)
      return
    }
    if (sessionStorage.getItem('bannerDismissed') !== 'true') {
      setVisible(true)
    }
  }, [show])

  if (!visible) return null

  function dismiss() {
    sessionStorage.setItem('bannerDismissed', 'true')
    setVisible(false)
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden mb-4">
      <p>
        <strong>Your business profile is incomplete.</strong>{' '}
        Invoices and costings won't show your GSTIN or business name until you fill in Settings.
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/settings"
          className="whitespace-nowrap font-medium underline underline-offset-2 hover:text-amber-700"
        >
          Go to Settings →
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-amber-700 hover:text-amber-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
