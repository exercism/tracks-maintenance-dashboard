import React, { useCallback } from 'react'
import { useProvideBrowserLocation, ProvideLocation } from './hooks/useLocation'

import { useTrack } from './hooks/useUrlState'
import { TrackSelection } from './components/TrackSelection'
import { TrackTool } from './components/TrackTool'

import './styles.css'

export function App(): JSX.Element {
  const location = useProvideBrowserLocation()

  return (
    <ProvideLocation value={location}>
      <AppContainer>
        <TrackMaintenanceTool />
      </AppContainer>
    </ProvideLocation>
  )
}

function AppContainer({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return <div className="app container">{children}</div>
}

function TrackMaintenanceTool(): JSX.Element {
  const [selectedTrackId, onSelectTrack] = useTrack()

  const doUnselectTrack = useCallback(() => onSelectTrack(null), [
    onSelectTrack,
  ])

  if (!selectedTrackId) {
    return <TrackSelection />
  }

  return <TrackTool trackId={selectedTrackId} onUnselect={doUnselectTrack} />
}
