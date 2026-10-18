'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()

  // Dashboard is the home screen — nowhere to go back to
  if (pathname === '/dashboard') return null

  function handleBack() {
    if (window.history.length > 1) router.back()
    else router.push('/dashboard')
  }

  return (
    <div className="px-4 pt-3 print:hidden">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#1C1C1E] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#3A3A3C] transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
        Back
      </button>
    </div>
  )
}
