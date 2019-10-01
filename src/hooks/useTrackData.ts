import { useMemo, useReducer, useEffect } from 'react'

import TRACKS from '../data/tracks.json'

export function useTrackData(trackId: TrackIdentifier): TrackData {
  return useMemo(
    () => TRACKS.find((trackData) => trackData.slug === trackId) as TrackData,
    [trackId]
  )
}

interface TrackAsideData {
  done: boolean;
  data: {
    analyzer: boolean | undefined
    testRunner: boolean | undefined
  }
}

const CACHE = {} as Record<TrackIdentifier, TrackAsideData['data']>

function readCache(trackId: TrackIdentifier): TrackAsideData['data']
function readCache(trackId: TrackIdentifier, key: keyof TrackAsideData['data']): boolean | undefined
function readCache(trackId: TrackIdentifier, key?: keyof TrackAsideData['data']): TrackAsideData['data'] | boolean | undefined {
  const data = (CACHE[trackId] || { analyzer: undefined, testRunner: undefined })
  return key === undefined ? data : data[key]
}

function writeCache(trackId: TrackIdentifier, key: keyof TrackAsideData['data'], value: boolean) {
  CACHE[trackId] = readCache(trackId)
  CACHE[trackId][key] = value
}

type FetchAction =
  | { type: 'exists'; key: keyof TrackAsideData['data']; exists: boolean }
  | { type: 'done'; data?: Record<keyof TrackAsideData['data'], boolean> }
  | { type: 'error' }
  | { type: 'skip'; data: Record<keyof TrackAsideData['data'], boolean> }

type FetchState = { data: TrackAsideData['data']; loading: boolean }

const initialState: FetchState = { loading: true, data: { analyzer: undefined, testRunner: undefined } }

function fetchReducer(state: FetchState, action: FetchAction) {
  switch (action.type) {
    case 'exists': {
      return { ...state, data: { ...state.data, [action.key]: action.exists } }
    }
    case 'error': {
      return { ...state, loading: false }
    }
    case 'done': {
      return { ...state, loading: false, data: action.data || state.data }
    }
    case 'skip': {
      return { ...state, loading: false, data: state.data }
    }
  }
}

export function useTrackAsideData(trackId: TrackIdentifier): TrackAsideData {
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const { loading: currentLoading } = state
  const currentData = readCache(trackId)

  useEffect(() => {
    // If we already have a version, mark it as "don't fetch"
    if (currentData.analyzer !== undefined && currentData.testRunner !== undefined) {
      if (currentLoading) {
        writeCache(trackId, 'analyzer', currentData.analyzer)
        writeCache(trackId, 'testRunner', currentData.testRunner)

        dispatch({ type: 'skip', data: currentData as Record<keyof TrackAsideData['data'], boolean> })
      }
      return
    }

    let active = true

    const fetchAnalyzer = currentData.analyzer === undefined 
      ? fetch(`https://raw.githubusercontent.com/exercism/${trackId}-analyzer/master/README.md`, { method: 'HEAD' }).then((result) => result.ok, () => false)
      : Promise.resolve(currentData.analyzer)

    const fetchTestRunner = currentData.testRunner === undefined 
      ? fetch(`https://raw.githubusercontent.com/exercism/${trackId}-test-runner/master/README.md`, { method: 'HEAD' }).then((result) => result.ok, () => false)
      : Promise.resolve(currentData.testRunner)

    ;(async () => {
      const nextAnalyzer = await fetchAnalyzer
      const nextTestRunner = await fetchTestRunner

      if (!active) {
        return
      }

      writeCache(trackId, 'analyzer', nextAnalyzer)
      writeCache(trackId, 'testRunner', nextTestRunner)

      dispatch({ type: 'done', data: { analyzer: nextAnalyzer, testRunner: nextTestRunner } })
    })()

    return () => {
      active = false
    }
  }, [trackId, currentLoading, currentData])

  return {
    done: !currentLoading,
    data: currentData
  }
}