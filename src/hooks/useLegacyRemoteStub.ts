import { useReducer, useEffect } from 'react'
import { useTrackData } from './useLegacyTrackData'

type Stub = number | undefined
type RemoteStub = {
  done: boolean
  stub: Stub
  path: string | undefined
  url: string | undefined
}

export const MINIMUM_STUB_LENGTH = 1
const CACHE = {} as Record<TrackIdentifier, Record<ExerciseIdentifier, Stub>>

function readCache(trackId: TrackIdentifier, slug: ExerciseIdentifier): Stub {
  return (CACHE[trackId] || {})[slug]
}

function writeCache(
  trackId: TrackIdentifier,
  slug: ExerciseIdentifier,
  stub: Stub
): void {
  CACHE[trackId] = CACHE[trackId] || {}
  CACHE[trackId][slug] = stub
}

type FetchAction =
  | { type: 'stub'; stub: Stub }
  | { type: 'error' }
  | { type: 'skip'; stub: Stub }

type FetchState = { stub: Stub; loading: boolean }

const initialState: FetchState = { loading: true, stub: undefined }

function fetchReducer(state: Readonly<FetchState>, action: FetchAction): Readonly<FetchState> {
  switch (action.type) {
    case 'stub': {
      return { ...state, loading: false, stub: action.stub }
    }
    case 'error': {
      return { ...state, loading: false }
    }
    case 'skip': {
      return { ...state, loading: false, stub: action.stub }
    }
  }
}

/**
 * Fetches the remote exercise stub
 *
 * @param trackId track identifier (slug)
 * @param slug exercise slug
 */
export function useRemoteStub(
  trackId: TrackIdentifier,
  slug: ExerciseIdentifier
): RemoteStub {
  const trackData = useTrackData(trackId)
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const stubPattern = trackData['stub_file']
  const path = stubPattern
    ? stubPattern
        .replace(/{versioning}/gi, trackData.versioning || '{}')
        .replace(/{test}|{test_?file}/gi, trackData['test_file'] || '{}')
        .replace(/{slug}|{exercise-slug}/g, slug)
        .replace(/{slug_}|{exercise_slug}/g, slug.replace(/-/g, '_'))
        .replace(
          /{Slug}|{ExerciseSlug}/g,
          slug
            .split(/-/g)
            .map((p) => p[0].toLocaleUpperCase() + p.slice(1))
            .join('')
        )
        .replace(/{exerciseslug}/g, slug.replace(/-/g, ''))
        .replace(
          /{Exerciseslug}/g,
          slug[0].toLocaleUpperCase() + slug.replace(/-/g, '').substring(1)
        )
    : '<nothing>'

  const url = stubPattern
    ? `https://raw.githubusercontent.com/exercism/${trackId}/master/${path}`
    : undefined

  const { loading: currentLoading } = state
  const currentStub = readCache(trackId, slug)

  useEffect(() => {
    if (!url) {
      return
    }

    // If we already have a stub, mark it as "don't fetch"
    if (currentStub) {
      if (currentLoading) {
        writeCache(trackId, slug, currentStub)
        dispatch({ type: 'skip', stub: currentStub })
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

        const textResult = await result.text()

        if (!active) {
          return
        }

        const stub = textResult.length // Null byte
        if (!stub || textResult.length < MINIMUM_STUB_LENGTH) {
          throw new Error('No stub found')
        }
        writeCache(trackId, slug, stub)
        dispatch({ type: 'stub', stub })
      })
      .catch((err) => {
        active && dispatch({ type: 'error' })
      })

    return (): void => {
      active = false
    }
  }, [url, trackId, slug, path, currentLoading, currentStub])

  return {
    done: !currentLoading,
    stub: currentStub,
    path,
    url,
  }
}
