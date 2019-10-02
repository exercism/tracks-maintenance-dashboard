import React from 'react'

import { useTrackData } from '../hooks/useTrackData'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { TrackAside } from './TrackAside'
import { TrackChecklist } from './TrackChecklist'
import { TrackDescription } from './TrackDescription'
import { TrackIcon } from './TrackIcon'

import { TrackMissing } from './views/TrackMissing'
import { TrackTopics } from './views/TrackTopics'
import { TrackVersions } from './views/TrackVersions'

export interface TrackToolProps {
  trackId: TrackIdentifier
  view: View | undefined
  onUnselect: () => void
  onChangeView: (view: View) => void
}

const DEFAULT_VIEW: View = ''

export function TrackTool({
  trackId,
  view,
  onUnselect,
  onChangeView,
}: TrackToolProps): JSX.Element {
  return (
    <section>
      <UnselectTrackButton onClick={onUnselect} />
      <ViewSelect view={view || DEFAULT_VIEW} onChangeView={onChangeView} />

      <div className="d-flex flex-wrap row">
        <div className="col" style={{ maxWidth: '27rem' }}><Header trackId={trackId} /></div>
        <TrackAside trackId={trackId} />
        <TrackChecklist trackId={trackId} />
      </div>

      <TrackView trackId={trackId} view={view || DEFAULT_VIEW} />
    </section>
  )
}

function UnselectTrackButton({ onClick }: { onClick: TrackToolProps['onUnselect'] }): JSX.Element {
  return (
    <button
      className="btn btn-sm btn-outline-danger mb-3 mr-3"
      onClick={onClick}
    >
      Select different track
    </button>
  )
}

const noop = () => {}

function ViewSelect({ view, onChangeView }: { view: View; onChangeView: TrackToolProps['onChangeView'] }) {
  return (
    <div className="btn-group">
      <button
        className={`btn btn-sm btn-outline-primary ${view === '' && 'active'} mb-3`}
        aria-pressed={view === '' ? 'true' : 'false'}
        onClick={view === '' ? noop : () => onChangeView('')}
        >
          Versions
        </button>
      <button
        className={`btn btn-sm btn-outline-primary ${view === 'unimplemented' && 'active'} mb-3`}
        aria-pressed={view === 'unimplemented' ? 'true' : 'false'}
        onClick={view === 'unimplemented' ? noop : () => onChangeView('unimplemented')}
        >
          Unimplemented
        </button>
      <button
        className={`btn btn-sm btn-outline-primary ${view === 'topics' && 'active'} mb-3`}
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
    <header className="card mt-4 mb-4" style={{ maxWidth: '25rem', width: '100%' }}>
      <figure style={{ maxWidth: 234, padding: '0 10px', margin: '10px auto' }}>
        <TrackIcon className="card-img-top" trackId={trackId} />
      </figure>
      <h1 className="sr-only card-title">{trackData.name}</h1>
      {done && <div className="card-body"><TrackDescription config={config} /></div>}
    </header>
  )
}

function TrackView({ trackId, view }: { trackId: TrackIdentifier; view: View }): JSX.Element | null {
  switch(view) {
    case 'unimplemented': {
      return <TrackMissing trackId={trackId} />
    }
    case 'topics': {
      return <TrackTopics trackId={trackId} />
    }
    case '': {
      return <TrackVersions trackId={trackId} />
    }
    default: {
      return null
    }
  }
}
