import { useReducer, useEffect } from 'react'
import { useProblemSpecificationBranch } from './useLegacyProblemSpecificationBranch'

type Branch = string
type TopicsList = ReadonlyArray<string>
type RemoteTopicsList = {
  done: boolean
  list: TopicsList | undefined
  url: string | undefined
}

const CACHE = {} as Record<Branch, TopicsList>

function readCache(branch: Branch): TopicsList | undefined {
  return CACHE[branch]
}

function writeCache(branch: Branch, list: TopicsList): void {
  CACHE[branch] = list
}

type FetchAction =
  | { type: 'list'; list: TopicsList }
  | { type: 'error' }
  | { type: 'skip'; list: TopicsList }

type FetchState = { list: TopicsList | undefined; loading: boolean }

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

/**
 * Fetches the remotely known topics list
 */
export function useRemoteTopics(): RemoteTopicsList {
  const problemSpecBranch = useProblemSpecificationBranch()
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const contentsUrl = `https://raw.githubusercontent.com/exercism/problem-specifications/${problemSpecBranch}/TOPICS.txt`

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

        const topics = await result.text()
        const items = topics
          .split('\n')
          .map((topic) => topic.trim())
          .filter((item, index, self) => {
            return (
              item &&
              item[0] !== '-' &&
              (!self[index + 1] || self[index + 1][0] !== '-')
            )
          })

        if (!items) {
          throw new Error('Expected the topics file')
        }

        return items
      })
      .then((items) => {
        if (!active || !items) {
          return undefined
        }

        writeCache(problemSpecBranch, items)
        dispatch({ type: 'list', list: items })
      })
      .catch((err) => {
        active && dispatch({ type: 'error' })
      })

    return (): void => {
      active = false
    }
  }, [contentsUrl, problemSpecBranch, currentLoading, currentList])

  return {
    done: !currentLoading,
    list: currentList,
    url: contentsUrl,
  }
}
