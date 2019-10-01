import { useState, useCallback } from 'react'

export function useToggleState(initial?: string): [string | undefined, (next: string) => void] {
  const [current, setCurrent] = useState(initial)
  const doToggle = useCallback((next: string) => {
    setCurrent((prev) => prev === next ? undefined : next)
  }, [setCurrent])

  return [current, doToggle]
}
