import React from 'react'

import type { Version3 } from '../types'

type TrackConfiguration = Version3.TrackConfiguration

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
