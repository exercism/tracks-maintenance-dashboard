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
  containerClass?: string | readonly string[],
  ignoreClass?: string | readonly string[]
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const handleOutsideClick = (e: Event): void => {
      if (e.target && e.target instanceof Node) {
        // Click happened inside the container ref
        if (ref && ref.current && ref.current.contains(e.target)) {
          return
        }

        // Click happened on the container element, or on an ignored element
        if (e.target instanceof HTMLElement) {
          const classList = e.target.classList
          const containers =
            typeof containerClass === 'string'
              ? [containerClass]
              : containerClass || []
          const ignores =
            typeof ignoreClass === 'string' ? [ignoreClass] : ignoreClass || []
          const needles = containers.concat(ignores)

          if (needles.some((needle) => classList.contains(needle))) {
            return
          }

          if (
            e.target.closest(
              needles.map((needle) => `.${needle}`).join(', ')
            ) !== null
          ) {
            return
          }
        }
      }

      onClick()
    }

    document.addEventListener('mouseup', handleOutsideClick)
    document.addEventListener('touchend', handleOutsideClick)

    return (): void => {
      document.removeEventListener('mouseup', handleOutsideClick)
      document.removeEventListener('touchend', handleOutsideClick)
    }
  }, [onClick, containerClass, ignoreClass])

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
  containerClass?: string | readonly string[],
  ignoreClass?: string | readonly string[]
): [string | undefined, (next?: string) => void, MutableRefObject<T | null>] {
  const [current, setCurrent] = useState(initial)
  const doToggle = useCallback(
    (next?: string) => {
      setCurrent((prev) => (prev === next ? undefined : next))
    },
    [setCurrent]
  )

  const doUntoggle = useCallback(() => setCurrent(undefined), [setCurrent])
  const ref = useOutsideClick<T>(doUntoggle, containerClass, ignoreClass)

  return [current, doToggle, ref]
}
