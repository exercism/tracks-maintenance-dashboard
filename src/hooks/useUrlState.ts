import { useState, useCallback, useEffect } from 'react'

import TRACKS from '../data/tracks.json'

const DEFAULT_BRANCH: Branch = 'master'
const DETAULT_VIEW: View = 'versions'

type SupportedState = {
  trackId: TrackIdentifier | null | undefined;
  branch: Branch;
  view: View | undefined;
  exercise: ExerciseIdentifier | undefined;
}

type sanitizeUrlState<K extends keyof SupportedState> = (input: string) => SupportedState[K]
type UseUrlState<K extends keyof SupportedState> = [SupportedState[K], (value: SupportedState[K]) => void]

/**
 * Returns a state and updater that fetches and pushes state from and to the URL
 *
 * - It returns the current (initial) value from the url
 * - It changes the url via setOptionsInUrl
 * - It refreshes with a previous (popped) value, when the back/forward button is pressed
 *
 * @param key the state key
 * @param sanitize how to sanititze values
 */
export function useUrlState<K extends keyof SupportedState>(key: K, sanitize: sanitizeUrlState<K>): UseUrlState<K> {
  const [,setRefreshCount] = useState(0)
  const doScheduleRefresh = useCallback(() => setRefreshCount((prev) => prev + 1), [])
  const doUpdateValue = useCallback((value: SupportedState[K]) => {
    setOptionsInUrl({ [key]: value })
    doScheduleRefresh()
  }, [key, doScheduleRefresh])

  const value = getOptionFromUrl(key, sanitize)

  // Router
  useEffect(() => {
    const originalHandler = window.onpopstate
    window.onpopstate = function(event: PopStateEvent) {
      const nextValue = getOptionFromUrl(key, sanitize)
      if (nextValue !== value) {
        doScheduleRefresh()
      }

      originalHandler && originalHandler.call(this, event)
    }

    return () => {
      window.onpopstate = originalHandler
    }
  }, [key, sanitize, value, doScheduleRefresh])

  return [value, doUpdateValue]
}

/**
 * Convenience method to get the track id from the url
 */
export function useTrack() {
  return useUrlState('trackId', sanitizeTrack)
}

/**
 * Convenience method to get the problem spec branch from the url
 */
export function useBranch() {
  return useUrlState('branch', sanitizeBranch)
}

/**
 * Convenience method to get the current view from the url
 */
export function useView() {
  return useUrlState('view', sanitizeView)
}

export function useExercise() {
  return useUrlState('exercise', sanititzeExercise)
}

function sanitizeTrack(anyTrack: string): TrackIdentifier | undefined {
  const track = TRACKS.find((track) => track['slug'] === anyTrack)
  return track ? anyTrack as TrackIdentifier : undefined
}

function sanitizeBranch(anyBranch: string): Branch {
  const branches: Branch[] = ['master', 'track-anatomy']
  return branches.find((branch) => branch === anyBranch) || DEFAULT_BRANCH
}

function sanitizeView(anyView: string): View | undefined {
  const views: View[] = ['unimplemented', 'topics', 'details', 'versions']
  return views.find((views) => views === anyView) || DETAULT_VIEW
}

function sanititzeExercise(anyExercise: string): ExerciseIdentifier | undefined {
  return anyExercise ? anyExercise.trim().replace(/( |_)/g, '-') : undefined
}

function getOptionFromUrl<K extends keyof SupportedState>(key: K, sanitize: sanitizeUrlState<K>): SupportedState[K] {
  const { trackId: urlTrackId, branch: urlBranch, view: urlView, exercise: urlExercise } = getOptionsFromUrl()

  switch(key) {
    case 'trackId': {
      return sanitize(urlTrackId)
    }
    case 'branch': {
      return sanitize(urlBranch)
    }
    case 'view': {
      return sanitize(urlView)
    }
    case 'exercise': {
      return sanitize(urlExercise)
    }
    default: {
      throw new Error(`${key} not handled in option parsing`)
    }
  }
}

function getOptionsFromUrl(): Record<string, string> {
  const [, urlTrackId, urlBranch, urlView, urlExercise] = decodeURIComponent(window.location.pathname || '').split('/')
  return {
    trackId: urlTrackId,
    branch: urlBranch || DEFAULT_BRANCH,
    view: urlView,
    exercise: urlExercise
  }
}

export function setOptionsInUrl({
  trackId: nextTrackId,
  branch: nextBranch,
  view: nextView,
  exercise: nextExercise
}: Partial<SupportedState>) {
  // unset track
  if (nextTrackId === null) {
    return window.history.pushState({}, 'Exercism: Track maintenance tool - Select your track', '/')
  }

  const current = getOptionsFromUrl()
  const trackId = nextTrackId || current.trackId
  const branch = nextBranch || current.branch

  const exercise = nextExercise === undefined ? current.exercise : nextExercise
  const view = nextView === undefined ? (nextExercise ? 'details' : current.view) : nextView

  return window.history.pushState(
    { trackId },
    `Exercism: Track ${trackId} maintenance tool (${branch}) - ${view || 'Dashboard'}`,
    '/' + [trackId, branch, view, view && exercise].filter(Boolean).join('/')
  )
}
