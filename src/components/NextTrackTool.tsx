import React, { useCallback, Fragment } from 'react'
import { useView, setOptionsInUrl } from '../hooks/useUrlState'
import { useActionableState } from '../hooks/useActionableOnly'
import { SwitchToggle } from './SwitchToggle'
import { ViewSelectLink } from './ViewSelectLink'
import { useTrackData } from '../hooks/useLegacyTrackData'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { TrackIcon } from './TrackIcon'
import { TrackDescription } from './TrackDescription'
import { ExerciseDetails } from './views/ExerciseDetails'

const DEFAULT_VIEW = 'launch'
const VERSION3_VIEWS: ReadonlyArray<View> = ['concept', 'details', 'launch', 'practice', 'tree'] as const as ReadonlyArray<Version3.View>

function ensureVersionThreeView(view: View | undefined): Version3.View {
  if (view && VERSION3_VIEWS.indexOf(view) !== -1) {
    return view as Version3.View
  }

  return DEFAULT_VIEW
}

export function NextTrackTool({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const [selectedView] = useView()
  const actualView = ensureVersionThreeView(selectedView) || DEFAULT_VIEW

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
      <ViewSelectLink view="launch">Launch</ViewSelectLink>
      <ViewSelectLink view="tree">Tree</ViewSelectLink>
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

function TrackAside({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  return <aside>aside</aside>
}

function TrackChecklist({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  return <ul></ul>
}

interface TrackViewProps {
  trackId: TrackIdentifier
  view: Version3.View
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
      return <section>Launch</section>
    }
    case 'tree': {
      return <section>Tree</section>
    }
    default: {
      return null
    }
  }
}
