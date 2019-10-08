import React, { useCallback } from 'react'

import { useTrackData } from '../hooks/useTrackData'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { TrackAside } from './TrackAside'
import { TrackChecklist } from './TrackChecklist'
import { TrackDescription } from './TrackDescription'
import { TrackIcon } from './TrackIcon'

import { ExerciseDetails } from './views/ExerciseDetails'
import { TrackMissing } from './views/TrackMissing'
import { TrackTopics } from './views/TrackTopics'
import { TrackVersions } from './views/TrackVersions'
import { useView, setOptionsInUrl } from '../hooks/useUrlState'

export interface TrackToolProps {
  trackId: TrackIdentifier
  onUnselect: () => void
}

const DEFAULT_VIEW: View = 'versions'

export function TrackTool({
  trackId,
  onUnselect,
}: TrackToolProps): JSX.Element {
  const [selectedView] = useView()

  const actualView = selectedView || DEFAULT_VIEW

  const doHideExercise = useCallback(() => {
    // Heuristic, if there is a "back" state, go back
    if (window && window.history && window.history.state && window.history.state.previous) {
      if (window.history.state.previous.trackId === trackId) {
        window.history.back()
        return
      }
    }

    // Otherwise, hide by going to the default view
    setOptionsInUrl({ view: DEFAULT_VIEW, exercise: '' })
  }, [trackId])

  const doShowExercise = useCallback(
    (exercise: ExerciseIdentifier) => {
      setOptionsInUrl({
        view: 'details',
        exercise,
      })
    },
    []
  )

  return (
    <section>
      <UnselectTrackButton onClick={onUnselect} />

      <div className="d-flex flex-wrap row">
        <div className="col" style={{ maxWidth: '27rem' }}>
          <Header trackId={trackId} />
        </div>
        <TrackAside trackId={trackId} />
        <TrackChecklist trackId={trackId} />
      </div>

      <ViewSelect />

      <TrackView
        trackId={trackId}
        view={actualView}
        onShowExercise={doShowExercise}
        onHideExercise={doHideExercise}
      />
    </section>
  )
}

function UnselectTrackButton({
  onClick,
}: {
  onClick: TrackToolProps['onUnselect']
}): JSX.Element {
  return (
    <button className="btn btn-sm btn-outline-danger mr-3" onClick={onClick}>
      Select different track
    </button>
  )
}

const noop = () => {}

function ViewSelect() {
  const [view, onChangeView] = useView()

  return (
    <div className="btn-group">
      <button
        className={`btn btn-sm btn-outline-primary ${view === 'versions' &&
          'active'} mb-3`}
        aria-pressed={view === 'versions' ? 'true' : 'false'}
        onClick={view === 'versions' ? noop : () => onChangeView('versions')}
      >
        Versions
      </button>
      <button
        className={`btn btn-sm btn-outline-primary ${view === 'unimplemented' &&
          'active'} mb-3`}
        aria-pressed={view === 'unimplemented' ? 'true' : 'false'}
        onClick={
          view === 'unimplemented' ? noop : () => onChangeView('unimplemented')
        }
      >
        Unimplemented
      </button>
      <button
        className={`btn btn-sm btn-outline-primary ${view === 'topics' &&
          'active'} mb-3`}
        aria-pressed={view === 'topics' ? 'true' : 'false'}
        onClick={view === 'topics' ? noop : () => onChangeView('topics')}
      >
        Topics
      </button>
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
    default: {
      return null
    }
  }
}
