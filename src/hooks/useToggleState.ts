import {
  useState,
  useCallback,
  MutableRefObject,
  useRef,
  useEffect,
  MouseEvent,
} from 'react'
/**
 * Listens for outside clicks tied to a specific element
 *
 * - used in conjunction with useToggleState
 *
 * @param onClick
 */
function useOutsideClick<T extends HTMLElement>(
  onClick: () => void
): MutableRefObject<T> {
  const ref = useRef<T>()

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent<T>): void => {
      if (ref && ref.current && ref.current.contains(e.target as Node)) {
        return
      }
      onClick()
    }
    //@ts-ignore
    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      //@ts-ignore
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [onClick])

  return ref as MutableRefObject<T>
}

/**
 * Returns a state and a toggler that allows setting the state
 *
 * - if the next state doesn't equal the current state, updates it
 * - if the next state equals the current state, sets it to undefined instead
 *
 * @param initial
 */
export function useToggleState<T extends HTMLElement = HTMLElement>(
  initial?: string
): [string | undefined, (next: string) => void, MutableRefObject<T>] {
  const [current, setCurrent] = useState(initial)
  const doToggle = useCallback(
    (next: string) => {
      setCurrent((prev) => (prev === next ? undefined : next))
    },
    [setCurrent]
  )

  const doUntoggle = useCallback(() => setCurrent(undefined), [setCurrent])
  const ref = useOutsideClick<T>(doUntoggle)

  return [current, doToggle, ref]
}
