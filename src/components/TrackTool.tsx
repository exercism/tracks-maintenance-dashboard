import React, { useCallback } from 'react'

import {
  ProvideActionable,
  useProvideActionableState,
  useActionableState,
} from '../hooks/useActionableOnly'

import { useView, setOptionsInUrl } from '../hooks/useUrlState'
import { TrackAside } from './TrackAside'
import { SwitchToggle } from './SwitchToggle'
import { ViewSelectLink } from './ViewSelectLink'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { TrackIcon } from './TrackIcon'
import { TrackDescription } from './TrackDescription'
import { ExerciseDetails } from './views/ExerciseDetails'
import { LaunchList } from './views/LaunchList'
import { ExerciseTree } from './views/ExerciseTree'

export interface TrackToolProps {
  trackId: TrackIdentifier
  onUnselect: () => void
}

export function TrackTool({
  trackId,
  onUnselect,
}: TrackToolProps): JSX.Element {
  const [selectedView] = useView()
  const actualView = (selectedView || DEFAULT_VIEW) as View

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
    <ProvideActionable value={useProvideActionableState()}>
      <section>
        <div className="d-flex justify-content-start flex-row align-items-center w-50">
          <UnselectTrackButton onClick={onUnselect} />
        </div>

        <div className="d-flex flex-wrap row">
          <div className="col" style={{ maxWidth: '27rem' }}>
            <Header trackId={trackId} />
          </div>
          <TrackAside trackId={trackId} />
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
      </section>
    </ProvideActionable>
  )
}

function UnselectTrackButton({
  onClick,
}: {
  onClick: TrackToolProps['onUnselect']
}): JSX.Element {
  const doClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onClick()
    },
    [onClick]
  )

  return (
    <a
      href="/"
      className="btn btn-sm btn-outline-danger mr-3"
      onClick={doClick}
    >
      Select different track
    </a>
  )
}

const DEFAULT_VIEW = 'launch'

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
      <ViewSelectLink view="launch">Launch</ViewSelectLink>
      <ViewSelectLink view="tree">Tree</ViewSelectLink>
    </div>
  )
}

function Header({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const { config, done } = useRemoteConfig(trackId)

  return (
    <header
      className="card mt-4 mb-4"
      style={{ maxWidth: '25rem', width: '100%' }}
    >
      <figure style={{ maxWidth: 234, padding: '0 10px', margin: '10px auto' }}>
        <TrackIcon className="card-img-top" trackId={trackId} />
      </figure>
      <h1 className="sr-only card-title">{trackId}</h1>
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
    case 'details': {
      return <ExerciseDetails trackId={trackId} onHide={onHideExercise} />
    }
    case 'launch': {
      return <LaunchList trackId={trackId} />
    }
    case 'tree': {
      return <ExerciseTree trackId={trackId} />
    }
    default: {
      return null
    }
  }
}
