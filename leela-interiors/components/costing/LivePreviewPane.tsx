'use client'

import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Desktop (lg+): sticky side pane. Below lg: hidden until the floating
// "Preview" button opens it as a full-screen overlay.
export function LivePreviewPane({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 h-11 rounded-full px-4 shadow-lg lg:hidden print:hidden"
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>

      <div
        className={
          open
            ? 'fixed inset-0 z-60 block overflow-y-auto bg-gray-100 lg:static lg:z-auto lg:w-2/5 lg:border-l lg:border-border'
            : 'hidden lg:block lg:w-2/5 lg:border-l lg:border-border lg:bg-gray-100 lg:overflow-y-auto'
        }
      >
        <div className="p-4 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Live Preview</p>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-text-primary lg:hidden"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-x-auto rounded shadow-sm">
            <div className="min-w-140 lg:min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}
