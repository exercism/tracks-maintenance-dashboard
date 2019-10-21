import { useReducer, useEffect } from 'react'
import {
  useProblemSpecificationBranch,
  NormalisedBranch,
} from '../hooks/useProblemSpecificationBranch'

type Version = string | undefined
type RemoteCanonicalVersion = {
  done: boolean
  version: Version
  url: string | undefined
}

const CACHE = {} as Record<ExerciseIdentifier, Version>

function readCache(
  slug: ExerciseIdentifier,
  branch: NormalisedBranch
): Version {
  return CACHE[`${slug}-${branch}`]
}

function writeCache(
  slug: ExerciseIdentifier,
  branch: NormalisedBranch,
  version: Version
): void {
  CACHE[`${slug}-${branch}`] = version
}

type FetchAction =
  | { type: 'version'; version: Version }
  | { type: 'error' }
  | { type: 'skip'; version: Version }

type FetchState = {
  version: Version
  loading: boolean
}

const initialState: FetchState = {
  loading: true,
  version: undefined,
}

function fetchReducer(
  state: Readonly<FetchState>,
  action: FetchAction
): Readonly<FetchState> {
  switch (action.type) {
    case 'version': {
      return {
        ...state,
        loading: false,
        version: action.version,
      }
    }
    case 'error': {
      return { ...state, loading: false }
    }
    case 'skip': {
      return { ...state, loading: false, version: action.version }
    }
  }
}

/**
 * Finds the canonical version (the current version of the canonical data)
 *
 * @param slug the exercise slug
 */
export function useRemoteCanonicalVersion(
  slug: ExerciseIdentifier
): RemoteCanonicalVersion {
  const problemSpecBranch = useProblemSpecificationBranch()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const url = `https://raw.githubusercontent.com/exercism/problem-specifications/${problemSpecBranch}/exercises/${slug}/canonical-data.json`

  const { loading: currentLoading } = state
  const currentVersion = readCache(slug, problemSpecBranch)

  useEffect(() => {
    if (!url) {
      return
    }

    if (currentVersion) {
      if (currentLoading) {
        writeCache(slug, problemSpecBranch, currentVersion)
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

          writeCache(slug, problemSpecBranch, version)
          dispatch({ type: 'version', version })
          return
        }

        const textResult = await result.text()
        if (!active) {
          return
        }

        const match = textResult.match(/version: ?([0-9]+\.[0-9]+\.[0-9]+)/)
        const version = match && match[1]
        if (!version) {
          throw new Error('No version found')
        }

        writeCache(slug, problemSpecBranch, version)
        dispatch({ type: 'version', version })
      })
      .catch((err) => {
        active && dispatch({ type: 'error' })
      })

    return (): void => {
      active = false
    }
  }, [url, slug, problemSpecBranch, currentLoading, currentVersion])

  return {
    done: !currentLoading,
    version: currentVersion,
    url,
  }
}
