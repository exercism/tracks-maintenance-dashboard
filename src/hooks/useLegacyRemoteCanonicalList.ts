import { useReducer, useEffect } from 'react'
import { useProblemSpecificationBranch } from './useLegacyProblemSpecificationBranch'

type Branch = string
type CanonicalList = ReadonlyArray<ExerciseIdentifier>

type CanonicalLookupValue = Readonly<{
  slug: ExerciseIdentifier
  deprecated: boolean
  description: boolean
  meta: boolean
  tests: boolean
}>

type CanonicalLookup = Record<ExerciseIdentifier, CanonicalLookupValue>

type RemoteCanonicalList = {
  done: boolean
  list: CanonicalList | undefined
  data: CanonicalLookup | undefined
  url: string | undefined
}

const CACHE = {} as Record<Branch, CanonicalLookup>

function readCache(branch: Branch): CanonicalLookup | undefined {
  return CACHE[branch]
}

function writeCache(branch: Branch, data: CanonicalLookup): void {
  CACHE[branch] = data
}

type FetchAction =
  | { type: 'list'; list: CanonicalList; data: CanonicalLookup }
  | { type: 'error' }
  | { type: 'skip'; list: CanonicalList; data: CanonicalLookup }

type FetchState = { list: CanonicalList | undefined; loading: boolean }

const initialState: FetchState = { loading: true, list: undefined }

function fetchReducer(
  state: Readonly<FetchState>,
  action: FetchAction
): Readonly<FetchState> {
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

type ProblemSpecBranch = ReturnType<typeof useProblemSpecificationBranch>
function ensureV2Branch(branch: ProblemSpecBranch): Exclude<ProblemSpecBranch, 'v3'> {
  if (branch === 'v3') {
    return 'master'
  }

  return branch
}

/**
 * Fetches the canonical list of known exercises
 *
 * @note uses an API call to fetch the contents and an API call to fetch the tree
 */
export function useRemoteCanonicalList(): RemoteCanonicalList {
  const problemSpecBranch = ensureV2Branch(useProblemSpecificationBranch())
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const contentsUrl = `https://api.github.com/repos/exercism/problem-specifications/contents?ref=${problemSpecBranch}`

  const { loading: currentLoading } = state
  const currentData = readCache(problemSpecBranch)

  useEffect(() => {
    if (!contentsUrl) {
      return
    }

    // If we already have a config, mark it as "don't fetch"
    if (currentData) {
      if (currentLoading) {
        writeCache(problemSpecBranch, currentData)
        dispatch({
          type: 'skip',
          list: Object.keys(currentData),
          data: currentData,
        })
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

        // Fetch the tree, but recursively
        return fetch(
          `${item['git_url']}${
            item['git_url'].indexOf('?') === -1 ? '?' : '&'
          }recursive=1`
        )
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

        const lookup = items.reduce(
          (result, item) => {
            const [slug, prop] = item.split('/')
            if (!result[slug]) {
              result[slug] = {
                slug,
                deprecated: false,
                description: false,
                tests: false,
                meta: false,
              }
            }

            switch (prop) {
              case 'metadata.yml': {
                result[slug].meta = true
                break
              }
              case 'description.md': {
                result[slug].description = true
                break
              }
              case 'canonical-data.yml': {
                result[slug].tests = true
                break
              }
              case '.deprecated': {
                result[slug].deprecated = true
                break
              }
            }

            return result
          },
          {} as Record<
            ExerciseIdentifier,
            {
              slug: ExerciseIdentifier
              deprecated: boolean
              description: boolean
              tests: boolean
              meta: boolean
            }
          >
        )

        writeCache(problemSpecBranch, lookup)
        dispatch({ type: 'list', list: Object.keys(lookup), data: lookup })
      })
      .catch((err) => {
        active && dispatch({ type: 'error' })
      })

    return (): void => {
      active = false
    }
  }, [contentsUrl, problemSpecBranch, currentLoading, currentData])

  return {
    done: !currentLoading,
    list: Object.keys(currentData || []),
    data: currentData,
    url: contentsUrl,
  }
}
