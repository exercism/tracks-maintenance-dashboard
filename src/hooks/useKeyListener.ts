import { useEffect } from 'react'

type Key = KeyboardEvent['key']
type Keys = readonly Key[]

export function useKeyPressListener(keys: Key | Keys, onPress?: () => void) {
  useEffect(() => {
    function onKeyPress(this: Document, ev: KeyboardEvent) {
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

    return () => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [keys, onPress])
}
