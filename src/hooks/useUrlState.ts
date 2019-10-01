import { useState, useCallback, useEffect } from 'react'

import TRACKS from '../data/tracks.json'

const DEFAULT_BRANCH: Branch = 'master'

type SupportedState = {
  trackId: TrackIdentifier | null | undefined;
  branch: Branch;
  view: View | undefined;
}

type sanitizeUrlState<K extends keyof SupportedState> = (input: string) => SupportedState[K]
type UseUrlState<K extends keyof SupportedState> = [SupportedState[K], (value: SupportedState[K]) => void]

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

export function useTrack() {
  return useUrlState('trackId', sanitizeTrack)
}

export function useBranch() {
  return useUrlState('branch', sanitizeBranch)
}

export function useView() {
  return useUrlState('view', sanitizeView)
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
  const branches: View[] = ['unimplemented', 'topics']
  return branches.find((branch) => branch === anyView)
}

function getOptionFromUrl<K extends keyof SupportedState>(key: K, sanitize: sanitizeUrlState<K>): SupportedState[K] {
  const { trackId: urlTrackId, branch: urlBranch, view: urlView } = getOptionsFromUrl()

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
    default: {
      throw new Error(`${key} not handled in option parsing`)
    }
  }
}

function getOptionsFromUrl(): Record<string, string> {
  const [, urlTrackId, urlBranch, urlView] = window.location.pathname.split('/')
  return {
    trackId: urlTrackId,
    branch: urlBranch || DEFAULT_BRANCH,
    view: urlView
  }
}

function setOptionsInUrl({
  trackId: nextTrackId,
  branch: nextBranch,
  view: nextView,
}: Partial<{
  trackId: SelectedTrackIdentifier | undefined
  branch: SelectedBranch | undefined
  view: SelectedView | undefined
}>) {
  // unset track
  if (nextTrackId === null) {
    return window.history.pushState({}, 'Select your track', '/')
  }

  const current = getOptionsFromUrl()
  const trackId = nextTrackId || current.trackId
  const branch = nextBranch || current.branch
  const view = nextView === undefined ? current.view : nextView

  return window.history.pushState(
    { trackId },
    `Track Exercise Versions (${branch})`,
    '/' + [trackId, branch, view].filter(Boolean).join('/')
  )
}
