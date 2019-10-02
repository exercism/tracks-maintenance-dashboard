import { useState, useCallback } from 'react'

/**
 * Returns a state and a toggler that allows setting the state
 *
 * - if the next state doesn't equal the current state, updates it
 * - if the next state equals the current state, sets it to undefined instead
 *
 * @param initial
 */
export function useToggleState(initial?: string): [string | undefined, (next: string) => void] {
  const [current, setCurrent] = useState(initial)
  const doToggle = useCallback((next: string) => {
    setCurrent((prev) => prev === next ? undefined : next)
  }, [setCurrent])

  return [current, doToggle]
}
