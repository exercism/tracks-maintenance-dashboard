import { useReducer, useEffect } from 'react'
import { useTrackData } from './useTrackData'

type Slug = string
type Version = string | undefined
type RemoteVersion = {
  done: boolean
  version: Version
  path: string | undefined
  url: string | undefined
}

const CACHE = {} as Record<TrackIdentifier, Record<Slug, Version>>

function readCache(trackId: TrackIdentifier, slug: Slug) {
  return (CACHE[trackId] || {})[slug]
}

function writeCache(trackId: TrackIdentifier, slug: Slug, version: Version) {
  CACHE[trackId] = CACHE[trackId] || {}
  CACHE[trackId][slug] = version
}

type FetchAction =
  | { type: 'version'; version: Version }
  | { type: 'error' }
  | { type: 'skip'; version: Version }

type FetchState = { version: Version; loading: boolean }

const initialState: FetchState = { loading: true, version: undefined }

function fetchReducer(state: FetchState, action: FetchAction) {
  switch (action.type) {
    case 'version': {
      return { ...state, loading: false, version: action.version }
    }
    case 'error': {
      return { ...state, loading: false }
    }
    case 'skip': {
      return { ...state, loading: false, version: action.version }
    }
  }
}

export function useRemoteVersion(
  trackId: TrackIdentifier,
  slug: Slug
): RemoteVersion {
  const trackData = useTrackData(trackId)
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const versioning = trackData.versioning
  const path = versioning
    ? versioning
        .replace(/{slug}|{exercise-slug}/g, slug)
        .replace(/{slug_}|{exercise_slug}/g, slug.replace(/-/g, '_'))
        .replace(
          /{Slug}|{ExerciseSlug}/g,
          slug
            .split(/-/g)
            .map((p) => p[0].toLocaleUpperCase() + p.slice(1))
            .join('')
        )
    : '<nothing>'

  const url = versioning
    ? `https://raw.githubusercontent.com/exercism/${trackId}/master/${path}`
    : undefined

  const { loading: currentLoading } = state
  const currentVersion = readCache(trackId, slug)

  useEffect(() => {
    if (!url) {
      return
    }

    // If we already have a version, mark it as "don't fetch"
    if (currentVersion) {
      if (currentLoading) {
        writeCache(trackId, slug, currentVersion)
        dispatch({ type: 'skip', version: currentVersion })
      }
      return
    }

    let active = true

    fetch(url)
      .then(async (result) => {
        if (!active) {
          return
        }

        if (!result.ok) {
          throw new Error(result.statusText)
        }

        if (result.url.endsWith('.json')) {
          const jsonResult = await result.json()

          if (!active) {
            return
          }

          // TODO: search in other keys
          const version = jsonResult['version']
          if (!version) {
            throw new Error('No version found')
          }
          writeCache(trackId, slug, version)
          dispatch({ type: 'version', version })
          return
        }

        if (result.url.endsWith('version')) {
          const textResult = await result.text()
          if (!active) {
            return
          }

          const version = textResult.trim()
          if (!version) {
            throw new Error('No version found')
          }
          writeCache(trackId, slug, version)
          dispatch({ type: 'version', version })
          return
        }

        const textResult = await result.text()

        if (!active) {
          return
        }

        const match = textResult.match(
          /(?:V|v|vsn)(?:ersion:?)?(?:\s*?| | = "|: "|, ")([0-9]+\.[0-9]+\.[0-9]+)/
        )
        const version = match && match[1]
        if (!version) {
          throw new Error('No version found')
        }
        writeCache(trackId, slug, version)
        dispatch({ type: 'version', version })
      })
      .catch((err) => {
        active && dispatch({ type: 'error' })
      })

    return () => {
      active = false
    }
  }, [url, trackId, slug, path, currentLoading, currentVersion])

  return {
    done: !currentLoading,
    version: currentVersion,
    path,
    url,
  }
}
