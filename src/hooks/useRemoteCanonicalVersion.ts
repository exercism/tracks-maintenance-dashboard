import { useReducer, useEffect } from 'react'
import { useProblemSpecificationBranch } from '../hooks/useProblemSpecificationBranch'

type Slug = string
type Version = string | undefined
type Branch = string
type RemoteCanonicalVersion = {
  done: boolean
  version: Version
  url: string | undefined
}

const CACHE = {} as Record<Slug, Version>

function readCache(slug: Slug, problemSpecBranch: Branch) {
  return CACHE[`${slug}-${problemSpecBranch}`]
}

function writeCache(slug: Slug, problemSpecBranch: Branch, version: Version) {
  CACHE[`${slug}-${problemSpecBranch}`] = version
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

function fetchReducer(state: FetchState, action: FetchAction) {
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

export function useRemoteCanonicalVersion(slug: Slug): RemoteCanonicalVersion {
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

    return () => {
      active = false
    }
  }, [url, slug, problemSpecBranch, currentLoading, currentVersion])

  return {
    done: !currentLoading,
    version: currentVersion,
    url,
  }
}
