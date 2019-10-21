import React, { useCallback } from 'react'

import TRACKS from '../data/tracks.json'

import { useTrack } from '../hooks/useUrlState'

const ENABLED_TRACKS = TRACKS as ReadonlyArray<TrackData>

function TrackSelectionItem({
  track,
  onSelect,
}: {
  track: TrackData
  onSelect: () => void
}): JSX.Element {
  return (
    <li className="list-inline-item mb-2">
      <button
        className={`btn btn-md btn-${
          track.versioning ? '' : 'outline-'
        }primary`}
        onClick={onSelect}
      >
        {track.name}
      </button>
    </li>
  )
}

export function TrackSelection(): JSX.Element {
  const [, onSelectTrack] = useTrack()

  const renderTrackSelectionItem = useCallback(
    (track: Readonly<TrackData>) => {
      const doSelectTrack = (): void => onSelectTrack(track.slug)
      return (
        <TrackSelectionItem
          key={track.slug}
          onSelect={doSelectTrack}
          track={track}
        />
      )
    },
    [onSelectTrack]
  )

  return (
    <section>
      <header className="mb-4">
        <h1 className="mb-4">Exercism: Track maintenance</h1>
      </header>
      <ol className="list-inline">
        {ENABLED_TRACKS.map(renderTrackSelectionItem)}
      </ol>
      <p className="text-muted">
        Tracks are highlighted if the track has a defined versioning scheme. If
        a track isn&apos;t highlighted, but the track does keep track of the
        exercise versions, you may{' '}
        <a href="https://github.com/exercism/tracks-maintenance-dashboard/edit/master/src/data/tracks.json">
          edit this file
        </a>
        . Add the <code>versioning</code> key to the right track data. Follow
        the format of existing values.
      </p>
    </section>
  )
}
