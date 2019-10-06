
import { useState, useEffect, useContext, createContext } from 'react'

const LocationContext = createContext<Location | undefined>(undefined)

export const ProvideLocation = LocationContext.Provider

const HISTORY_TRIGGERS = [
  'pushState',
  'replaceState',
  'back',
  'forward'
] as const

export function useProvideBrowserLocation() {
  const [location, setLocation] = useState<Location>()

  useEffect(() => {
    // Track the old popstate so its reversible
    const originalOnPopstate = { current: window.onpopstate }

    window.onpopstate = function (this: WindowEventHandlers, ev: PopStateEvent) {
      originalOnPopstate.current && originalOnPopstate.current.call(window, ev)

      // After the pop state has been execute, set the location
      setLocation({ ...window.location })
    }

    // Track the old history trigger functions
    const originalHistoryTriggers = HISTORY_TRIGGERS.reduce((result, trigger) => {
      const oldTrigger = result[trigger] = window.history[trigger]

      window.history[trigger] = function (...args: [any, string, (string | null | undefined)]) {
        oldTrigger.apply(window.history, args)
        setLocation(() => ({ ...window.location }))
      } as any // because args matching is meh

      return result
    }, {} as Record<string, any> )

    // Set initial location
    setLocation({ ...window.location })

    // Reverse all modifications when this effect is being removed
    return () => {
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
