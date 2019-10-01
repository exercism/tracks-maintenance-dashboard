import { useReducer, useEffect } from 'react'
import { useProblemSpecificationBranch } from './useProblemSpecificationBranch'

type Branch = string
type CanonicalList = ReadonlyArray<string>
type RemoteCanonicalList = {
  done: boolean
  list: CanonicalList | undefined
  url: string | undefined
}

const CACHE = {} as Record<Branch, CanonicalList>

function readCache(branch: Branch): CanonicalList | undefined {
  return CACHE[branch]
}

function writeCache(branch: Branch, list: CanonicalList) {
  CACHE[branch] = list
}

type FetchAction =
  | { type: 'list'; list: CanonicalList }
  | { type: 'error' }
  | { type: 'skip'; list: CanonicalList }

type FetchState = { list: CanonicalList | undefined; loading: boolean }

const initialState: FetchState = { loading: true, list: undefined }

function fetchReducer(state: FetchState, action: FetchAction) {
  switch (action.type) {
    case 'list': {
      return { ...state, loading: false, list: action.list }
    }
    case 'error': {
      return { ...state, loading: false }
    }
    case 'skip': {
      return { ...state, loading: false, list: action.list }
    }
  }
}

export function useRemoteCanonicalList(): RemoteCanonicalList {
  const problemSpecBranch = useProblemSpecificationBranch()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const contentsUrl = `https://api.github.com/repos/exercism/problem-specifications/contents?ref=${problemSpecBranch}`

  const { loading: currentLoading } = state
  const currentList = readCache(problemSpecBranch)

  useEffect(() => {
    if (!contentsUrl) {
      return
    }

    // If we already have a config, mark it as "don't fetch"
    if (currentList) {
      if (currentLoading) {
        writeCache(problemSpecBranch, currentList)
        dispatch({ type: 'skip', list: currentList })
      }
      return
    }

    let active = true

    fetch(contentsUrl)
      .then(async (result) => {
        if (!active) {
          return undefined
        }

        if (!result.ok) {
          throw new Error(result.statusText)
        }

        const items = (await result.json()) as ReadonlyArray<{
          path: string
          git_url: string
        }>
        const item = items.find((item) => item['path'] === 'exercises')

        if (!item) {
          throw new Error('Expected an entry "exercises"')
        }

        return fetch(item['git_url'])
      })
      .then(async (result) => {
        if (!active || !result) {
          return undefined
        }

        if (!result.ok) {
          throw new Error(result.statusText)
        }

        const root = await result.json()

        return (root['tree'] || []).map(
          (leaf: { path: string }) => leaf['path']
        ) as string[]
      })
      .then(async (items) => {
        if (!active || !items) {
          return undefined
        }

        const sparseItems = await Promise.all(items.map((item) =>
          fetch(`https://raw.githubusercontent.com/exercism/problem-specifications/master/exercises/${item}/.deprecated`)
            .then((result) => result.ok, () => false)
            .then((deprecated) => deprecated ? null : item)
        ))

        const validItems = sparseItems.filter(Boolean) as string[]

        writeCache(problemSpecBranch, validItems)
        dispatch({ type: 'list', list: validItems })
      })
      .catch((err) => {
        dispatch({ type: 'error' })
      })

    return () => {
      active = false
    }
  }, [contentsUrl, problemSpecBranch, currentLoading, currentList])

  return {
    done: !currentLoading,
    list: currentList,
    url: contentsUrl,
  }
}
