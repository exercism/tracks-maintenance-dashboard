import React from 'react'
import type { Legacy } from '../types'

type TrackConfiguration = Legacy.TrackConfiguration

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
