import React, { useCallback } from 'react'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { useToggleState } from '../hooks/useToggleState'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'

export function TrackAside({ trackId }: { trackId: TrackIdentifier }) {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { done, data } = useTrackAsideData(trackId)

  const [currentDetails, doToggleDetails] = useToggleState()

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={trackId}>Repository</RepositoryLink>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}/blob/master/config.json`} className="d-block mr-4">
            Normalised Configuration
          </a>
          <ConfigurationIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} loading={!doneConfig} valid={!!config} />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={`${trackId}-analyzer`}>Automated Analysis</RepositoryLink>
          <AnalyzerIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} trackId={trackId} loading={!done} valid={data['analyzer'] === true} />
        </li>
        <li className="list-group-item d-flex justify-content-between" >
          <RepositoryLink repository={`${trackId}-test-runner`}>Test Runner</RepositoryLink>
          <TestRunnerIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} trackId={trackId} loading={!done} valid={data['testRunner'] === true} />
        </li>
      </ul>

      {done && data['analyzer'] === true && (
        <ul className="list-group mt-4">
          <li className="list-group-item d-flex w-100 w-sm-auto justify-content-between" >
            <a href={`https://exercism.io/mentor/analyses`} className="d-block mr-4">
              Latest Analysis
            </a>
          </li>
        </ul>
      )}
    </aside>
  )
}

function RepositoryLink({ children, repository, organisation = 'exercism' }: { children: React.ReactNode; organisation?: string; repository: string }) {
  return (
    <a href={`https://github.com/${organisation}/${repository}`} className="d-block mr-4">
      {children}
    </a>
  )
}

interface PreconfiguredIconProps {
  loading: boolean;
  valid: boolean;
  currentDetails?: string;
  onToggleDetails?(next: string): void;
}

function ConfigurationIcon({ loading, valid, currentDetails, onToggleDetails }: PreconfiguredIconProps) {
  const active = currentDetails === 'config.json'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('config.json'), [onToggleDetails])

  return (
    <LoadingIconWithPopover active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>This check passes if there is a <code>config.json</code> file present at the root of the repository.</p>
      <p className="mb-0">You can find more information about the <code>config.json</code> file <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">here</a>.</p>
    </LoadingIconWithPopover>
  )
}

function AnalyzerIcon({ loading, valid, currentDetails, onToggleDetails, trackId }: PreconfiguredIconProps & { trackId: TrackIdentifier }) {
  const active = currentDetails === 'analyzer'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('analyzer'), [onToggleDetails])

  return (
    <LoadingIconWithPopover  active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>This check passes if there is a <code>Dockerfile</code> file present in the <code>exercism/{trackId}-analyzer</code> repository.</p>

      <p className="mb-0">You can find more information about the <code>Dockerfile</code> file <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">here</a>,
      or about <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">the automated analysis in general</a>, as well as the steps to <a href="https://github.com/exercism/automated-analysis/blob/master/docs/creating-an-analyzer.md">pass this test</a>.
      </p>
    </LoadingIconWithPopover>
  )
}

function TestRunnerIcon({ loading, valid, currentDetails, onToggleDetails, trackId }: PreconfiguredIconProps & { trackId: TrackIdentifier }) {
  const active = currentDetails === 'test-runner'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('test-runner'), [onToggleDetails])

  return (
    <LoadingIconWithPopover  active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>This check passes if there is a <code>Dockerfile</code> file present in the <code>exercism/{trackId}-test-runner</code> repository.</p>

      <p className="mb-0">You can find more information about the <code>Dockerfile</code> file <a href="https://github.com/exercism/automated-tests/blob/master/docs/docker.md">here</a></p>
    </LoadingIconWithPopover>
  )
}
