import { useState, useEffect, useContext, createContext } from 'react'

const LocationContext = createContext<Location | undefined>(undefined)

export const ProvideLocation = LocationContext.Provider

const HISTORY_TRIGGERS = [
  'pushState',
  'replaceState',
  'back',
  'forward',
] as const

export function useProvideBrowserLocation(): Location | undefined {
  const [location, setLocation] = useState<Location>()

  useEffect(() => {
    // Track the old popstate so its reversible
    const originalOnPopstate = { current: window.onpopstate }

    window.onpopstate = function(
      this: WindowEventHandlers,
      ev: PopStateEvent
    ): void {
      originalOnPopstate.current && originalOnPopstate.current.call(window, ev)

      // After the pop state has been execute, set the location
      setLocation({ ...window.location })
    }

    // Track the old history trigger functions
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const originalHistoryTriggers = HISTORY_TRIGGERS.reduce(
      (result, trigger) => {
        const oldTrigger = (result[trigger] = window.history[trigger]) as any

        window.history[trigger] = function(
          ...args: [any, string, (string | null | undefined)]
        ) {
          oldTrigger.apply(window.history, args)
          setLocation(() => ({ ...window.location }))
        } as any // because args matching is meh

        return result
      },
      {} as Record<string, any>
    )
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Set initial location
    setLocation({ ...window.location })

    // Reverse all modifications when this effect is being removed
    return (): void => {
      window.onpopstate = originalOnPopstate.current
      HISTORY_TRIGGERS.forEach((trigger) => {
        window.history[trigger] = originalHistoryTriggers[trigger]
      })
    }
  }, [])

  return location
}

export function useLocation(): Location | undefined {
  return useContext(LocationContext)
}
