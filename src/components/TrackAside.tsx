import React from 'react'
import { useTrackAsideData } from '../hooks/useTrackData'
import { CheckOrCross } from './CheckOrCross'
import { LoadingIndicator } from './LoadingIndicator'
import { useRemoteConfig } from '../hooks/useRemoteConfig'

export function TrackAside({ trackId }: { trackId: TrackIdentifier }) {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { done, data } = useTrackAsideData(trackId)

  return (
    <aside className="mr-4 mt-4 mb-4">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}`} className="d-block mr-2">
            Repository
          </a> 
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}/blob/master/config.json`} className="d-block mr-2">
            Normalised Configuration
          </a> 
          {doneConfig ? <CheckOrCross value={!!config} /> : <LoadingIndicator />}
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}-analyzer`} className="d-block mr-2">
            Automated Analysis
          </a> 
          {done ? <CheckOrCross value={data['analyzer'] === true} /> : <LoadingIndicator />}
        </li>
        <li className="list-group-item d-flex justify-content-between" >
          <a href={`https://github.com/exercism/${trackId}-test-runner`}  className="d-block mr-2">
            Test Runner
          </a> 
          {done ? <CheckOrCross value={data['testRunner'] === true} /> : <LoadingIndicator />}
        </li>
      </ul>

      {done && data['analyzer'] === true && (
        <ul className="list-group mt-4">
          <li className="list-group-item d-flex justify-content-between" >
            <a href={`https://exercism.io/mentor/analyses`} className="d-block mr-2">
              Latest Analysis
            </a> 
          </li>
        </ul>
      )}
    </aside>
  )
}
