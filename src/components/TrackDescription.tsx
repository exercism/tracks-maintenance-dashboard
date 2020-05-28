import React from 'react'

export function TrackDescription({
  config,
}: {
  config: TrackConfiguration | undefined
}): JSX.Element | null {
  if (!config) {
    return null
  }

  return <blockquote className="card-text">{config.blurb}</blockquote>
}
