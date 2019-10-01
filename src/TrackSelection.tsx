import React, { useCallback } from 'react'

import TRACKS from './data/tracks.json'

const ENABLED_TRACKS = TRACKS as ReadonlyArray<TrackData>

export interface TrackSelectionProps {
  onSelect: (track: TrackIdentifier) => void
}

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
        className={`btn btn-${track.versioning ? '' : 'outline-'}primary`}
        onClick={onSelect}
      >
        {track.name}
      </button>
    </li>
  )
}

export function TrackSelection({ onSelect }: TrackSelectionProps): JSX.Element {
  const renderTrackSelectionItem = useCallback(
    (track: Readonly<TrackData>) => {
      const doSelectTrack = () => onSelect(track.slug)
      return (
        <TrackSelectionItem
          key={track.slug}
          onSelect={doSelectTrack}
          track={track}
        />
      )
    },
    [onSelect]
  )

  return (
    <section>
      <header>
        <h1>Select your track</h1>
      </header>
      <ol className="list-inline">
        {ENABLED_TRACKS.map(renderTrackSelectionItem)}
      </ol>
    </section>
  )
}
