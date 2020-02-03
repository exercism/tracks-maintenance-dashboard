import React, { Fragment, useCallback } from 'react'

import { useActionableState } from '../hooks/useActionableOnly'
import { useRemoteConfig } from '../hooks/useLegacyRemoteConfig'
import { useTrackData } from '../hooks/useLegacyTrackData'
import { useView, setOptionsInUrl } from '../hooks/useUrlState'

import { SwitchToggle } from './SwitchToggle'
import { TrackAside } from './LegacyTrackAside'
import { TrackChecklist } from './LegacyTrackChecklist'
import { TrackDescription } from './LegacyTrackDescription'
import { TrackIcon } from './TrackIcon'
import { ViewSelectLink } from './ViewSelectLink'

import { ExerciseDetails } from './views/ExerciseDetails'
import { TrackMissing } from './views/LegacyTrackMissing'
import { TrackStubs } from './views/LegacyTrackStubs'
import { TrackTopics } from './views/LegacyTrackTopics'
import { TrackVersions } from './views/LegacyTrackVersions'

const DEFAULT_VIEW: View = 'versions'

export function CurrentTrackTool({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const [selectedView] = useView()
  const actualView = selectedView || DEFAULT_VIEW

  const doHideExercise = useCallback(() => {
    // Heuristic, if there is a "back" state, go back
    if (
      window &&
      window.history &&
      window.history.state &&
      window.history.state.previous
    ) {
      if (window.history.state.previous.trackId === trackId) {
        window.history.back()
        return
      }
    }

    // Otherwise, hide by going to the default view
    setOptionsInUrl({ view: DEFAULT_VIEW, exercise: '' })
  }, [trackId])

  const doShowExercise = useCallback((exercise: ExerciseIdentifier) => {
    setOptionsInUrl({
      view: 'details',
      exercise,
    })
  }, [])

  return (
    <Fragment>
      <div className="d-flex flex-wrap row">
        <div className="col" style={{ maxWidth: '27rem' }}>
          <Header trackId={trackId} />
        </div>
        <TrackAside trackId={trackId} />
        <TrackChecklist trackId={trackId} />
      </div>

      <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
        <div className="col-12 col-md-auto mb-2">
          <ViewSelect />
        </div>
        <div className="col mb-2">
          <SwitchActionableState />
        </div>
      </div>

      <TrackView
        trackId={trackId}
        view={actualView}
        onShowExercise={doShowExercise}
        onHideExercise={doHideExercise}
      />
    </Fragment>
  )
}

function SwitchActionableState(): JSX.Element {
  const [current, onChange] = useActionableState()

  const doToggle = useCallback(() => onChange((prev) => !prev), [onChange])

  return (
    <SwitchToggle
      inActiveLabel="All"
      activeLabel="Actionable"
      onToggle={doToggle}
      actionableOnly={current}
    />
  )
}


function ViewSelect(): JSX.Element {
  return (
    <div className="btn-group w-100">
      <ViewSelectLink view="versions">Versions</ViewSelectLink>
      <ViewSelectLink view="stubs">Stubs</ViewSelectLink>
      <ViewSelectLink view="topics">Topics</ViewSelectLink>
      <ViewSelectLink view="unimplemented">Unimplemented</ViewSelectLink>
    </div>
  )
}

function Header({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const trackData = useTrackData(trackId)
  const { config, done } = useRemoteConfig(trackId)

  return (
    <header
      className="card mt-4 mb-4"
      style={{ maxWidth: '25rem', width: '100%' }}
    >
      <figure style={{ maxWidth: 234, padding: '0 10px', margin: '10px auto' }}>
        <TrackIcon className="card-img-top" trackId={trackId} />
      </figure>
      <h1 className="sr-only card-title">{trackData.name}</h1>
      {done && (
        <div className="card-body">
          <TrackDescription config={config} />
        </div>
      )}
    </header>
  )
}

interface TrackViewProps {
  trackId: TrackIdentifier
  view: View
  onShowExercise: (exercise: ExerciseIdentifier) => void
  onHideExercise: () => void
}

function TrackView({
  trackId,
  view,
  onShowExercise,
  onHideExercise,
}: TrackViewProps): JSX.Element | null {
  switch (view) {
    case 'unimplemented': {
      return <TrackMissing trackId={trackId} />
    }
    case 'details': {
      return <ExerciseDetails trackId={trackId} onHide={onHideExercise} />
    }
    case 'topics': {
      return <TrackTopics trackId={trackId} onShowExercise={onShowExercise} />
    }
    case 'versions': {
      return <TrackVersions trackId={trackId} onShowExercise={onShowExercise} />
    }
    case 'stubs': {
      return <TrackStubs trackId={trackId} onShowExercise={onShowExercise} />
    }
    default: {
      return null
    }
  }
}
