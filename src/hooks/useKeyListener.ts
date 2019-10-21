import { useEffect } from 'react'

type Key = KeyboardEvent['key']
type Keys = readonly Key[]

export function useKeyPressListener(
  keys: Key | Keys,
  onPress?: () => void
): void {
  useEffect(() => {
    function onKeyPress(this: Document, ev: KeyboardEvent): void {
      if (!onPress) {
        return
      }

      if (typeof keys === 'string') {
        if (ev.key === keys) {
          onPress()
        }
        return
      }

      if (keys.some((key) => key === ev.key)) {
        onPress()
      }
    }

    document.addEventListener('keyup', onKeyPress)

    return (): void => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [keys, onPress])
}
