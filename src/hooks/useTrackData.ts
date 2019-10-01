import { useMemo } from 'react'

import TRACKS from '../data/tracks.json'

export function useTrackData(trackId: string): TrackData {
  return useMemo(
    () => TRACKS.find((trackData) => trackData.slug === trackId) as TrackData,
    [trackId]
  )
}
