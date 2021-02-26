import React from 'react'
import { TrackIdentifier } from '../types'

export interface TrackIconProps {
  trackId: TrackIdentifier
  className?: string
}

export function TrackIcon({ trackId, className }: TrackIconProps): JSX.Element {
  return (
    <img
      className={className}
      src={`https://assets.exercism.io/tracks/${trackId}-hex-turquoise.png`}
      alt={`Track Icon for the ${trackId} track on Exercism.io`}
    />
  )
}
