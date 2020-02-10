import { useReducer, useEffect } from 'react'

const CACHE: Record<string, boolean | undefined> = {}

type FetchAction =
  | { type: 'result'; key: string; result: boolean }
  | { type: 'error' }

type FetchState = { result: undefined | boolean; loading: boolean }

const initialState: FetchState = {
  loading: true,
  result: undefined,
}

function fetchReducer(
  state: Readonly<FetchState>,
  action: FetchAction
): Readonly<FetchState> {
  switch (action.type) {
    case 'result': {
      return { ...state, result: action.result, loading: false }
    }
    case 'error': {
      return { ...state, loading: false }
    }
  }
}

const DEFAULT_BRANCH = 'master'

export function useRawGithubFileExists({
  repository,
  branch,
  path,
}: {
  repository: string
  path: string
  branch?: string
}): {
  url: string
  rawUrl: string
  done: boolean
  result: boolean | undefined
} {
  const key = `${repository}/${branch || DEFAULT_BRANCH}:${path}`
  const [state, dispatch] = useReducer(fetchReducer, {
    ...initialState,
    result: CACHE[key],
  })

  const url = `https://github.com/exercism/${repository}/blob/${branch ||
    DEFAULT_BRANCH}/${path}`
  const rawUrl = `https://raw.githubusercontent.com/exercism/${repository}/${branch ||
    DEFAULT_BRANCH}/${path}`

  useEffect(() => {
    if (state.result !== undefined) {
      return
    }

    let active = true

    fetch(rawUrl, { method: 'HEAD' })
      .then(
        (result) => result.ok,
        () => false
      )
      .then((result) => {
        if (active) {
          dispatch({ type: 'result', result, key })
        }
      })
      .catch(() => {
        if (active) {
          dispatch({ type: 'error' })
        }
      })

    return (): void => {
      active = false
    }
  }, [key, rawUrl, state])

  return {
    url,
    rawUrl,
    done: !state.loading,
    result: state.result,
  }
}

export function useRawGithubFileDoesNotContain({
  refute,
  ...opts
}: {
  repository: string
  path: string
  branch?: string
  refute: string
}): {
  url: string
  rawUrl: string
  done: boolean
  result: boolean | undefined
} {
  return useRawGithubFileMatches({
    ...opts,
    cacheKey: `!${refute}`,
    matcher: (content) => content.indexOf(refute) === -1,
  })
}

export function useRawGithubFileMatches({
  repository,
  branch,
  path,
  matcher,
  cacheKey,
}: {
  repository: string
  path: string
  branch?: string
  matcher: (content: string) => boolean
  cacheKey: string
}): {
  url: string
  rawUrl: string
  done: boolean
  result: boolean | undefined
} {
  const key = `${repository}/${branch || DEFAULT_BRANCH}:${path}~${cacheKey}`
  const [state, dispatch] = useReducer(fetchReducer, {
    ...initialState,
    result: CACHE[key],
  })

  const url = `https://github.com/exercism/${repository}/blob/${branch ||
    DEFAULT_BRANCH}/${path}`
  const rawUrl = `https://raw.githubusercontent.com/exercism/${repository}/${branch ||
    DEFAULT_BRANCH}/${path}`

  useEffect(() => {
    if (state.result !== undefined) {
      return
    }

    let active = true

    fetch(rawUrl, { method: 'GET' })
      .then(
        (result) => result.text().then(matcher),
        () => false
      )
      .then((result) => {
        if (active) {
          dispatch({ type: 'result', result, key })
        }
      })
      .catch(() => {
        if (active) {
          dispatch({ type: 'error' })
        }
      })

    return (): void => {
      active = false
    }
  }, [key, rawUrl, state, matcher])

  return {
    url,
    rawUrl,
    done: !state.loading,
    result: state.result,
  }
}
