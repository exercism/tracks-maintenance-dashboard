import { useCallback } from 'react'
import { useLocation } from './useLocation'

import TRACKS from '../data/tracks.json'

const DEFAULT_BRANCH: Branch = 'master'
const DETAULT_VIEW: View = 'versions'

type UnsetTrackIdentifier = null
type UnsetStatePartial = undefined

interface SupportedState {
  trackId: TrackIdentifier | UnsetTrackIdentifier
  branch: Branch | UnsetStatePartial
  view: View | UnsetStatePartial
  exercise: ExerciseIdentifier | UnsetStatePartial
}

type sanitizeUrlState<K extends keyof SupportedState> = (
  input: string | undefined
) => SupportedState[K]
type UseUrlState<K extends keyof SupportedState> = [
  SupportedState[K],
  (value: SupportedState[K]) => void
]

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
export function useUrlState<K extends keyof SupportedState>(
  key: K,
  sanitize: sanitizeUrlState<K>
): UseUrlState<K> {
  const location = useLocation()

  const value = getOptionFromLocation(location, key, sanitize)
  const doUpdateValue = useCallback(
    (value: SupportedState[K]) => {
      setOptionsInUrl({ [key]: value })
    },
    [key]
  )

  return [value, doUpdateValue]
}

/**
 * Convenience method to get the track id from the url
 */
export function useTrack(): [
  TrackIdentifier | null,
  (next: TrackIdentifier | null) => void
] {
  return useUrlState('trackId', sanitizeTrack)
}

/**
 * Convenience method to get the problem spec branch from the url
 */
export function useBranch(): [
  Branch | undefined,
  (next: Branch | undefined) => void
] {
  return useUrlState('branch', sanitizeBranch)
}

/**
 * Convenience method to get the current view from the url
 */
export function useView(): [
  View | undefined,
  (next: View | undefined) => void
] {
  return useUrlState('view', sanitizeView)
}

/**
 * Convenience method to get the current exercise from the url
 */
export function useExercise(): [
  ExerciseIdentifier | undefined,
  (next: ExerciseIdentifier | undefined) => void
] {
  return useUrlState('exercise', sanititzeExercise)
}

function sanitizeTrack(
  anyTrack: string | undefined
): TrackIdentifier | UnsetTrackIdentifier {
  const track = TRACKS.find((track) => track['slug'] === anyTrack)
  return track ? (anyTrack as TrackIdentifier) : null
}

function sanitizeBranch(anyBranch: string | undefined): Branch {
  const branches: Branch[] = ['master', 'track-anatomy']
  return branches.find((branch) => branch === anyBranch) || DEFAULT_BRANCH
}

function sanitizeView(anyView: string | undefined): View {
  const views: View[] = ['unimplemented', 'topics', 'details', 'versions']
  return views.find((views) => views === anyView) || DETAULT_VIEW
}

function sanititzeExercise(
  anyExercise: string | undefined
): ExerciseIdentifier | UnsetStatePartial {
  return anyExercise ? anyExercise.trim().replace(/( |_)/g, '-') : undefined
}

function getOptionFromLocation<K extends keyof SupportedState>(
  location: Location | undefined,
  key: K,
  sanitize: sanitizeUrlState<K>
): SupportedState[K] {
  const {
    trackId: urlTrackId,
    branch: urlBranch,
    view: urlView,
    exercise: urlExercise,
  } = getOptionsFromLocation(location)

  switch (key) {
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

interface Options {
  trackId: string | undefined
  branch: string
  view: string | undefined
  exercise: string | undefined
}

function getOptionsFromLocation(location: Location | undefined): Options {
  const [, urlTrackId, urlBranch, urlView, urlExercise] = location
    ? decodeURIComponent(location.pathname || '').split('/')
    : []

  return {
    trackId: urlTrackId,
    branch: urlBranch || DEFAULT_BRANCH,
    view: urlView,
    exercise: urlExercise,
  }
}

export function setOptionsInUrl(nextState: Partial<SupportedState>): void {
  return setOptionsWithLocation({ ...nextState, location: window.location })
}

export function getNextUrl(
  nextState: Partial<SupportedState>
): ReturnType<typeof getNextUrlWithLocation> {
  return getNextUrlWithLocation({ ...nextState, location: window.location })
}

export function useUrl(
  nextState: Partial<SupportedState>
): ReturnType<typeof getNextUrlWithLocation> {
  const location = useLocation()
  return getNextUrlWithLocation({
    ...nextState,
    location: location || window.location,
  })
}

interface NextUrl {
  state: {
    trackId: TrackIdentifier | null
    branch: Branch
    view: View
    exercise: ExerciseIdentifier | undefined
    previous?: Options
  }
  title: string
  href: string
}

function getNextUrlWithLocation({
  location,
  trackId: nextTrackId,
  branch: nextBranch,
  view: nextView,
  exercise: nextExercise,
}: Partial<SupportedState> & { location: Location }): NextUrl {
  // unset track
  if (nextTrackId === null) {
    return {
      state: {
        trackId: null,
        branch: DEFAULT_BRANCH,
        view: DETAULT_VIEW,
        exercise: undefined,
      },
      title: 'Exercism: Track maintenance tool - Select your track',
      href: '/',
    }
  }

  const current = getOptionsFromLocation(location)
  const trackId = sanitizeTrack(nextTrackId || current.trackId)
  const branch = sanitizeBranch(nextBranch || current.branch)

  const exercise = nextExercise === undefined ? current.exercise : nextExercise
  const view = sanitizeView(
    nextView === undefined
      ? nextExercise
        ? 'details'
        : current.view
      : nextView
  )

  return {
    state: { trackId, branch, view, exercise, previous: { ...current } },
    title: `Exercism: Track ${trackId} maintenance tool (${branch}) - ${view ||
      'Dashboard'}`,
    href:
      '/' + [trackId, branch, view, view && exercise].filter(Boolean).join('/'),
  }
}

function setOptionsWithLocation(
  options: Partial<SupportedState> & { location: Location }
): void {
  const { state, title, href } = getNextUrlWithLocation(options)

  return window.history.pushState(state, title, href)
}
