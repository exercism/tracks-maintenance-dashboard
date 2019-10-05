import React, { useCallback } from 'react'
import { ProvideBranch } from './hooks/useProblemSpecificationBranch'
import { useProvideBrowserLocation, ProvideLocation } from './hooks/useLocation'

import { useBranch, useTrack } from './hooks/useUrlState'
import { TrackSelection } from './components/TrackSelection'
import { TrackTool } from './components/TrackTool'

import './styles.css'

export function App() {
  const location = useProvideBrowserLocation()

  return (
    <ProvideLocation value={location}>
      <AppContainer>
        <TrackMaintenanceTool />
      </AppContainer>
    </ProvideLocation>
  )
}


function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="app container">
      {children}
    </div>
  )
}

function TrackMaintenanceTool() {
  const [selectedTrackId, onSelectTrack] = useTrack()
  const [selectedBranch] = useBranch()

  const doUnselectTrack = useCallback(() => onSelectTrack(null), [onSelectTrack])

  if (!selectedTrackId) {
    return (
      <TrackSelection />
    )
  }

  return (
    <ProvideBranch value={selectedBranch}>
      <TrackTool
        trackId={selectedTrackId}
        onUnselect={doUnselectTrack}
      />
    </ProvideBranch>
  )
}
