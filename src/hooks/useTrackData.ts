import { useMemo, useReducer, useEffect } from 'react'

import TRACKS from '../data/tracks.json'
import { useRemoteConfig } from './useRemoteConfig'

type ExerciseConfiguration = Version3.ExerciseConfiguration

/**
 * Fetches the local track data (like the versioning mapper)
 *
 * @param trackId The Track Identifier (slug)
 */
export function useTrackData(trackId: TrackIdentifier): TrackData {
  return useMemo(
    () => TRACKS.find((trackData) => trackData.slug === trackId) as TrackData,
    [trackId]
  )
}

interface TrackAsideData {
  done: boolean
  checklist: {
    hasBlurb: boolean
    hasVersion3: boolean
    hasOnlineEditor: boolean
    exerciseConceptCount: number
    exercisePracticeCount: number
    exercisePracticeWithConceptCount: number
  }
  data: {
    analyzer: boolean | undefined
    testRunner: boolean | undefined
    representer: boolean | undefined
  }
}

const CACHE = {} as Record<TrackIdentifier, TrackAsideData['data']>

function readCache(trackId: TrackIdentifier): TrackAsideData['data']
function readCache(
  trackId: TrackIdentifier,
  key: keyof TrackAsideData['data']
): boolean | undefined
function readCache(
  trackId: TrackIdentifier,
  key?: keyof TrackAsideData['data']
): TrackAsideData['data'] | boolean | undefined {
  const data = CACHE[trackId] || { analyzer: undefined, testRunner: undefined }
  return key === undefined ? data : data[key]
}

function writeCache(
  trackId: TrackIdentifier,
  key: keyof TrackAsideData['data'],
  value: boolean
): void {
  CACHE[trackId] = readCache(trackId)
  CACHE[trackId][key] = value
}

type FetchAction =
  | { type: 'exists'; key: keyof TrackAsideData['data']; exists: boolean }
  | { type: 'done'; data?: Record<keyof TrackAsideData['data'], boolean> }
  | { type: 'error' }
  | { type: 'skip'; data: Record<keyof TrackAsideData['data'], boolean> }

type FetchState = { data: TrackAsideData['data']; loading: boolean }

const initialState: FetchState = {
  loading: true,
  data: {
    analyzer: undefined,
    testRunner: undefined,
    representer: undefined,
  },
}

function fetchReducer(
  state: Readonly<FetchState>,
  action: FetchAction
): Readonly<FetchState> {
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

const NO_EXERCISES: Readonly<{
  concept: ReadonlyArray<ExerciseConfiguration>
  practice: ReadonlyArray<ExerciseConfiguration>
}> = { concept: [], practice: [] }

/**
 * Fetches and serves the aside data.
 * - data holds various checks regarding related (like related repo availability)
 * - checklist holds various checks regarding self (like is it set-up correctly)
 *
 * @param trackId The Track Identifier (slug)
 */
export function useTrackAsideData(trackId: TrackIdentifier): TrackAsideData {
  const { done: remoteTrackDone, config: remoteTrackData } = useRemoteConfig(
    trackId
  )
  const [state, dispatch] = useReducer(fetchReducer, initialState)

  const { loading: currentLoading } = state
  const currentData = readCache(trackId)

  useEffect(() => {
    // If we already have a version, mark it as "don't fetch"
    if (
      currentData.analyzer !== undefined &&
      currentData.testRunner !== undefined &&
      currentData.representer !== undefined
    ) {
      if (currentLoading) {
        writeCache(trackId, 'analyzer', currentData.analyzer)
        writeCache(trackId, 'testRunner', currentData.testRunner)
        writeCache(trackId, 'representer', currentData.representer)

        dispatch({
          type: 'skip',
          data: currentData as Record<keyof TrackAsideData['data'], boolean>,
        })
      }
      return
    }

    let active = true

    const fetchAnalyzer =
      currentData.analyzer === undefined
        ? fetch(
            `https://raw.githubusercontent.com/exercism/${trackId}-analyzer/master/Dockerfile`,
            { method: 'HEAD' }
          ).then(
            (result) => result.ok,
            () => false
          )
        : Promise.resolve(currentData.analyzer)

    const fetchTestRunner =
      currentData.testRunner === undefined
        ? fetch(
            `https://raw.githubusercontent.com/exercism/${trackId}-test-runner/master/Dockerfile`,
            { method: 'HEAD' }
          ).then(
            (result) => result.ok,
            () => false
          )
        : Promise.resolve(currentData.testRunner)

    const fetchRepresenter =
      currentData.representer === undefined
        ? fetch(
            `https://raw.githubusercontent.com/exercism/${trackId}-representer/master/Dockerfile`,
            { method: 'HEAD' }
          ).then(
            (result) => result.ok,
            () => false
          )
        : Promise.resolve(currentData.representer)
    ;(async (): Promise<void> => {
      const nextAnalyzer = await fetchAnalyzer
      const nextTestRunner = await fetchTestRunner
      const nextRepresenter = await fetchRepresenter

      if (!active) {
        return
      }

      writeCache(trackId, 'analyzer', nextAnalyzer)
      writeCache(trackId, 'testRunner', nextTestRunner)
      writeCache(trackId, 'representer', nextRepresenter)

      dispatch({
        type: 'done',
        data: {
          analyzer: nextAnalyzer,
          testRunner: nextTestRunner,
          representer: nextRepresenter,
        },
      })
    })()

    return (): void => {
      active = false
    }
  }, [trackId, currentLoading, currentData])

  const remoteExercises = {
    ...NO_EXERCISES,
    ...((remoteTrackDone && remoteTrackData && remoteTrackData.exercises) ||
      NO_EXERCISES),
  }

  const hasBlurb = !!(remoteTrackData && remoteTrackData.blurb)
  const hasVersion3 = !!(
    remoteTrackData &&
    remoteTrackData.version &&
    Number(remoteTrackData.version) >= 3
  )
  const hasOnlineEditor = !!(
    remoteTrackData &&
    remoteTrackData['online_editor'] &&
    Object.keys(remoteTrackData['online_editor']).length >= 2
  )

  const remoteFlags = useMemo(
    () => ({
      hasBlurb,
      hasVersion3,
      hasOnlineEditor,
      exerciseConceptCount: remoteExercises.concept.filter(
        (exercise) => exercise.slug && exercise.concepts.length > 0
      ).length,
      exercisePracticeCount: remoteExercises.practice.filter(
        (exercise) => exercise.slug
      ).length,
      exercisePracticeWithConceptCount: remoteExercises.practice.filter(
        (exercise) => exercise.slug && exercise.prerequisites.length > 0
      ).length,
    }),
    [hasBlurb, hasVersion3, hasOnlineEditor, remoteExercises]
  )

  return {
    done: !currentLoading && remoteTrackDone,
    data: currentData,
    checklist: remoteFlags,
  }
}
