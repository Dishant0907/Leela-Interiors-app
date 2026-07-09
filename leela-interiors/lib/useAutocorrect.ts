'use client'

import { useCallback, useRef, useState } from 'react'
import { autocorrect, type Correction } from './autocorrect'

export function useAutocorrect(setValue: (v: string) => void) {
  const [lastCorrections, setLastCorrections] = useState<Correction[]>([])
  // Keep setValue in a ref so the blur handler never goes stale
  const setValueRef = useRef(setValue)
  setValueRef.current = setValue

  const onBlurWithCorrect = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.currentTarget.value
      if (!raw.trim()) return
      const { result, corrections } = autocorrect(raw)
      if (corrections.length > 0) {
        setValueRef.current(result)
        setLastCorrections(corrections)
        setTimeout(() => setLastCorrections([]), 4000)
      }
    },
    [], // stable — reads setValue via ref
  )

  return { onBlurWithCorrect, lastCorrections }
}
