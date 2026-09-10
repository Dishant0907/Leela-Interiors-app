'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton({ documentTitle }: { documentTitle?: string }) {
  const handlePrint = () => {
    if (!documentTitle) {
      window.print()
      return
    }

    // Browsers default the "Save as PDF" filename to document.title, so swap
    // it in for the duration of the print dialog and restore it after.
    const originalTitle = document.title
    document.title = documentTitle

    const restoreTitle = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', restoreTitle)
    }
    window.addEventListener('afterprint', restoreTitle)

    window.print()
  }

  return (
    <Button onClick={handlePrint} variant="outline" size="sm">
      <Printer className="h-4 w-4" />
      Print / Export PDF
    </Button>
  )
}
