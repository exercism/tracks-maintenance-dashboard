import React, { useCallback } from 'react'
import { ProvideBranch } from './hooks/useProblemSpecificationBranch'
import { useBranch, useTrack, useView } from './hooks/useUrlState'
import { TrackSelection } from './components/TrackSelection'
import { TrackTool } from './components/TrackTool'

import './styles.css'

export function App() {
  const [selectedTrackId, doSelectTrack] = useTrack()
  const [selectedBranch] = useBranch()
  const [selectedView, doSelectView] = useView()

  const doUnselectTrack = useCallback(() => doSelectTrack(null), [doSelectTrack])

  if (!selectedTrackId) {
    return (
      <div className="app container">
        <TrackSelection onSelect={doSelectTrack} />
      </div>
    )
  }

  return (
    <div className="app container">
      <React.Fragment>
        <ProvideBranch value={selectedBranch}>
          <TrackTool
            trackId={selectedTrackId}
            onUnselect={doUnselectTrack}
            view={selectedView}
            onChangeView={doSelectView}
          />
        </ProvideBranch>
      </React.Fragment>
    </div>
  )
}
