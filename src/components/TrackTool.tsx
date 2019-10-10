import React, { useCallback, useState, MouseEvent } from 'react'

import { useTrackData } from '../hooks/useTrackData'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { TrackAside } from './TrackAside'
import { TrackChecklist } from './TrackChecklist'
import { TrackDescription } from './TrackDescription'
import { TrackIcon } from './TrackIcon'
import { SwitchToggle } from './SwitchToggle'
import { ExerciseDetails } from './views/ExerciseDetails'
import { TrackMissing } from './views/TrackMissing'
import { TrackTopics } from './views/TrackTopics'
import { TrackVersions } from './views/TrackVersions'
import { useView, setOptionsInUrl, useUrl } from '../hooks/useUrlState'
import {
  ProvideActionable,
  useProvideActionableState,
  useActionableState,
} from '../hooks/useActionableOnly'

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
      </section>
    </ProvideActionable>
  )
}

function SwitchActionableState() {
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

function ViewSelect() {
  return (
    <div className="btn-group w-100">
      <ViewSelectLink view="versions">Versions</ViewSelectLink>
      <ViewSelectLink view="unimplemented">Unimplemented</ViewSelectLink>
      <ViewSelectLink view="topics">Topics</ViewSelectLink>
    </div>
  )
}

function ViewSelectLink({
  view,
  children,
}: {
  view: View
  children: React.ReactNode
}) {
  const [actualView, onChangeView] = useView()
  const { href } = useUrl({ view })

  const doChangeView = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      onChangeView(view)
    },
    [view, onChangeView]
  )

  const active = view === actualView

  return (
    <a
      className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
      onClick={doChangeView}
      href={href}
    >
      {children}
    </a>
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
