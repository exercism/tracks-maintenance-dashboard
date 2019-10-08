import {
  useState,
  useCallback,
  MutableRefObject,
  useRef,
  useEffect,
} from 'react'

/**
 * Listens for outside clicks tied to a specific element
 *
 * - used in conjunction with useToggleState
 *
 * @param onClick
 */
function useOutsideClick<T extends Element = Element>(
  onClick: () => void,
  containerClass?: string
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const handleOutsideClick = (e: Event): void => {
      if (e.target && e.target instanceof Node) {
        // Click happened inside the container ref
        if (ref && ref.current && ref.current.contains(e.target)) {
          return
        }

        // Click happened on the container element
        if (containerClass && e.target instanceof HTMLElement) {
          if (e.target.classList.contains(containerClass)) {
            return
          }
          if (e.target.closest(`.${containerClass}`) !== null) {
            return
          }
        }
      }

      onClick()
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [onClick, containerClass])

  return ref
}

/**
 * Returns a state and a toggler that allows setting the state
 *
 * - if the next state doesn't equal the current state, updates it
 * - if the next state equals the current state, sets it to undefined instead
 *
 * @param initial
 */
export function useToggleState<T extends Element = Element>(
  initial?: string,
  containerClass?: string
): [string | undefined, (next: string) => void, MutableRefObject<T | null>] {
  const [current, setCurrent] = useState(initial)
  const doToggle = useCallback(
    (next: string) => {
      setCurrent((prev) => (prev === next ? undefined : next))
    },
    [setCurrent]
  )

  const doUntoggle = useCallback(() => setCurrent(undefined), [setCurrent])
  const ref = useOutsideClick<T>(doUntoggle, containerClass)

  return [current, doToggle, ref]
}
