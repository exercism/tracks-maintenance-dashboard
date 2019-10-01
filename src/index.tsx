import React, { useState, useCallback, useEffect } from 'react'
import { render } from 'react-dom'
import { TrackSelection } from './TrackSelection'
import { TrackTool } from './TrackTool'

import './styles.css'
import { ProvideBranch } from './hooks/useProblemSpecificationBranch'

const DEFAULT_BRANCH = 'master'

function App() {
  // Tracks the selected track, ingesting from the path
  const [selectedTrackId, setSelectedTrackId] = useState<
    SelectedTrackIdentifier
  >(getTrackIdFromUrl)

  const [showUnimplemented, setShowUnimplemented] = useState(
    () => getViewFromUrl() === 'unimplemented'
  )

  const [selectedBranch, setSelectedBranch] = useState<Branch>(
    () => getBranchFromUrl() || DEFAULT_BRANCH
  )

  const doSelectTrack = useCallback(
    (trackId: TrackIdentifier) => {
      setSelectedTrackId(trackId)
      setOptionsInUrl({ trackId })
    },
    [setSelectedTrackId]
  )
  const doUnselectTrack = useCallback(() => {
    setSelectedTrackId(null)
    setOptionsInUrl({ trackId: null })
  }, [setSelectedTrackId])

  const doSelectBranch = useCallback(
    (branch: Branch) => {
      setSelectedBranch(branch)
      setOptionsInUrl({ branch })
    },
    [setSelectedBranch]
  )

  const doToggleUnimplemented = useCallback(() => {
    const nextUnimplemented = !showUnimplemented
    setShowUnimplemented(nextUnimplemented)
    setOptionsInUrl({ view: nextUnimplemented ? 'unimplemented' : null })
  }, [showUnimplemented])

  // Very simple router
  useEffect(() => {
    const originalHandler = window.onpopstate
    window.onpopstate = function(event) {
      const nextTrackId = getTrackIdFromUrl()
      if (nextTrackId !== selectedTrackId) {
        setSelectedTrackId(nextTrackId)
      }

      originalHandler && originalHandler.call(this, event)
    }

    return () => {
      window.onpopstate = originalHandler
    }
  }, [selectedTrackId, setSelectedTrackId])

  return (
    <div className="app container">
      {selectedTrackId === null ? (
        <TrackSelection onSelect={doSelectTrack} />
      ) : (
        <React.Fragment>
          <BranchSelector selected={selectedBranch} onSelect={doSelectBranch} />
          <ProvideBranch value={selectedBranch}>
            <TrackTool
              trackId={selectedTrackId}
              onUnselect={doUnselectTrack}
              showUnimplemented={showUnimplemented}
              onToggleUnimplemented={doToggleUnimplemented}
            />
          </ProvideBranch>
        </React.Fragment>
      )}
    </div>
  )
}

function BranchSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (branch: Branch) => void
}) {
  return (
    <fieldset
      style={{ marginBottom: 20, background: '#ddd', padding: '0px 10px' }}
    >
      <legend>Problem Specifications Branch</legend>
      <label style={{ marginRight: 10 }}>
        master
        <input
          type="radio"
          name="branch"
          value="master"
          checked={selected === 'master'}
          onChange={() => onSelect('master')}
          style={{ marginLeft: 5 }}
        />
      </label>
      <label>
        track-anatomy
        <input
          type="radio"
          name="branch"
          value="track-anatomy"
          checked={selected === 'track-anatomy'}
          onChange={() => onSelect('track-anatomy')}
          style={{ marginLeft: 5 }}
        />
      </label>
    </fieldset>
  )
}

function getTrackIdFromUrl(): SelectedTrackIdentifier {
  return getOptionsFromUrl().trackId
}

function getBranchFromUrl(): SelectedBranch {
  return getOptionsFromUrl().branch
}

function getViewFromUrl(): View | null {
  return getOptionsFromUrl().view || null
}

function getOptionsFromUrl(): {
  trackId: TrackIdentifier | null
  branch: Branch
  view: View | null
} {
  const [, urlTrackId, urlBranch, urlView] = window.location.pathname.split('/')

  return {
    trackId: (urlTrackId || null) as TrackIdentifier | null,
    branch: sanitizeBranch(urlBranch) || DEFAULT_BRANCH,
    view: sanitizeView(urlView) || null,
  }
}

function sanitizeBranch(anyBranch: string): Branch | undefined {
  const branches: Branch[] = ['master', 'track-anatomy']
  return branches.find((branch) => branch === anyBranch)
}

function sanitizeView(anyView: string): View | undefined {
  const branches: View[] = ['unimplemented']
  return branches.find((branch) => branch === anyView)
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
    `/${trackId}/${branch}${view ? `/${view}` : ''}`
  )
}

const rootElement = document.getElementById('root')
render(<App />, rootElement)
