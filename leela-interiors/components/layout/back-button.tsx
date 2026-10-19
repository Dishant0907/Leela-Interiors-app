'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

function useGoBack() {
  const router = useRouter()
  return function goBack() {
    if (window.history.length > 1) router.back()
    else router.push('/dashboard')
  }
}

// Desktop: pill under the page edge. Mobile uses MobileBackIcon in the top bar.
export function BackButton() {
  const pathname = usePathname()
  const goBack = useGoBack()

  // Dashboard is the home screen — nowhere to go back to
  if (pathname === '/dashboard') return null

  return (
    <div className="hidden px-4 pt-3 md:block print:hidden">
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#1C1C1E] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#3A3A3C] transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
        Back
      </button>
    </div>
  )
}

export function MobileBackIcon() {
  const pathname = usePathname()
  const goBack = useGoBack()

  if (pathname === '/dashboard') return null

  return (
    <button
      onClick={goBack}
      className="flex h-11 w-11 items-center justify-center rounded-md text-text-sidebar active:bg-accent-hover"
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
    </button>
  )
}
