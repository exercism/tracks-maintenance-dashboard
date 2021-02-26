import { useEffect, useReducer } from 'react'
import type { Legacy, TrackIdentifier } from '../types'

type TrackConfiguration = Legacy.TrackConfiguration

type Slug = string
type RemoteConfiguration = {
  done: boolean
  config: TrackConfiguration | undefined
  url: string | undefined
}

const CACHE = {} as Record<TrackIdentifier, TrackConfiguration>

function readCache(trackId: TrackIdentifier): TrackConfiguration | undefined {
  return CACHE[trackId]
}

function writeCache(
  trackId: TrackIdentifier,
  config: TrackConfiguration
): void {
  CACHE[trackId] = config
}

type FetchAction =
  | { type: 'config'; config: TrackConfiguration }
  | { type: 'error' }
  | { type: 'skip'; config: TrackConfiguration }

type FetchState = { config: TrackConfiguration | undefined; loading: boolean }

const initialState: FetchState = { loading: true, config: undefined }

function fetchReducer(
  state: Readonly<FetchState>,
  action: FetchAction
): Readonly<FetchState> {
  switch (action.type) {
    case 'config': {
      return { ...state, loading: false, config: action.config }
    }
    case 'error': {
      return { ...state, loading: false }
    }
    case 'skip': {
      return { ...state, loading: false, config: action.config }
    }
  }
}

/**
 * Fetches the config.json for the track
 *
 * @param trackId the Track Identifier (slug)
 */
export function useRemoteConfig(trackId: TrackIdentifier): RemoteConfiguration {
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const url = `https://raw.githubusercontent.com/exercism/${trackId}/main/config.json`

  const { loading: currentLoading } = state
  const currentConfig = readCache(trackId)

  useEffect(() => {
    if (!url) {
      return
    }

    // If we already have a config, mark it as "don't fetch"
    if (currentConfig) {
      if (currentLoading) {
        writeCache(trackId, currentConfig)
        dispatch({ type: 'skip', config: currentConfig })
      }
      return
    }

    let active = true

    fetch(url)
      .then((result) => {
        if (!active) {
          return
        }

        if (!result.ok) {
          throw new Error(result.statusText)
        }

        if (result.url.endsWith('.json')) {
          return result.json().then((config: TrackConfiguration) => {
            writeCache(trackId, config)
            dispatch({ type: 'config', config })
          })
        }

        throw new Error("Don't know how to parse this config")
      })
      .catch((err) => {
        dispatch({ type: 'error' })
      })

    return (): void => {
      active = false
    }
  }, [url, trackId, currentLoading, currentConfig])

  return {
    done: !currentLoading,
    config: currentConfig,
    url,
  }
}
