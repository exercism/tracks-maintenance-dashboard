import React from 'react'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'
import { useToggleState } from '../hooks/useToggleState'
import { useKeyPressListener } from '../hooks/useKeyListener'

export function TrackAside({
  trackId,
  actionableOnly,
}: {
  trackId: TrackIdentifier
  actionableOnly: boolean
}) {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { done, data } = useTrackAsideData(trackId)
  const [activeDetailsKey, setActiveDetailsKey] = useToggleState<
    HTMLUListElement
  >(undefined, 'popover', 'popover-toggle')

  useKeyPressListener(['Esc', 'Escape'], setActiveDetailsKey)

  const normConfigVisible = !!config !== actionableOnly
  const automatedAnalysisVisible =
    (actionableOnly && data['analyzer'] === false) || !actionableOnly
  const testRunnerVisible =
    (actionableOnly && data['testRunner'] === false) || !actionableOnly

    return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={trackId}>Repository</RepositoryLink>
        </li>
        {normConfigVisible && (
          <li className="list-group-item d-flex justify-content-between">
            <a
              href={`https://github.com/exercism/${trackId}/blob/master/config.json`}
              className="d-block mr-4"
            >
              Normalized Configuration
            </a>

            <ConfigurationIcon
              currentDetails={activeDetailsKey}
              onToggleDetails={() => setActiveDetailsKey('config.json')}
              loading={!doneConfig}
              valid={!!config}
            />
          </li>
        )}
        {automatedAnalysisVisible && (
          <li className="list-group-item d-flex justify-content-between">
            <RepositoryLink repository={`${trackId}-analyzer`}>
              Automated Analysis
            </RepositoryLink>
            <AnalyzerIcon
              currentDetails={activeDetailsKey}
              onToggleDetails={() => setActiveDetailsKey('analyzer')}
              trackId={trackId}
              loading={!done}
              valid={data['analyzer'] === true}
            />
          </li>
        )}
        {testRunnerVisible && (
          <li className="list-group-item d-flex justify-content-between">
            <RepositoryLink repository={`${trackId}-test-runner`}>
              Test Runner
            </RepositoryLink>
            <TestRunnerIcon
              currentDetails={activeDetailsKey}
              onToggleDetails={() => setActiveDetailsKey('test-runner')}
              trackId={trackId}
              loading={!done}
              valid={data['testRunner'] === true}
            />
          </li>
        )}
      </ul>

      {done && data['analyzer'] === true && (
        <ul className="list-group mt-4">
          <li className="list-group-item d-flex w-100 w-sm-auto justify-content-between">
            <a
              href={`https://exercism.io/mentor/analyses`}
              className="d-block mr-4"
            >
              Latest Analysis
            </a>
          </li>
        </ul>
      )}
    </aside>
  )
}

function RepositoryLink({
  children,
  repository,
  organisation = 'exercism',
}: {
  children: React.ReactNode
  organisation?: string
  repository: string
}) {
  return (
    <a
      href={`https://github.com/${organisation}/${repository}`}
      className="d-block mr-4"
    >
      {children}
    </a>
  )
}

interface PreconfiguredIconProps {
  loading: boolean
  valid: boolean
  onToggleDetails: () => void
  currentDetails: string | undefined
}

const ConfigurationIcon = ({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={currentDetails === 'config.json'}
    loading={loading}
    valid={valid}
    onToggle={onToggleDetails}
  >
    <p>
      This check passes if there is a <code>config.json</code> file present at
      the root of the repository.
    </p>
    <p className="mb-0">
      You can find more information about the <code>config.json</code> file{' '}
      <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">
        here
      </a>
      .
    </p>
  </LoadingIconWithPopover>
)

function AnalyzerIcon({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
  trackId,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }) {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'analyzer'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is a <code>Dockerfile</code> file present in
        the <code>exercism/{trackId}-analyzer</code> repository.
      </p>

      <p className="mb-0">
        You can find more information about the <code>Dockerfile</code> file{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">
          here
        </a>
        , or about{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">
          the automated analysis in general
        </a>
        , as well as the steps to{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/creating-an-analyzer.md">
          pass this test
        </a>
        .
      </p>
    </LoadingIconWithPopover>
  )
}

function TestRunnerIcon({
  loading,
  valid,
  onToggleDetails,
  trackId,
  currentDetails,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }) {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'test-runner'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is a <code>Dockerfile</code> file present in
        the <code>exercism/{trackId}-test-runner</code> repository.
      </p>

      <p className="mb-0">
        You can find more information about the <code>Dockerfile</code> file{' '}
        <a href="https://github.com/exercism/automated-tests/blob/master/docs/docker.md">
          here
        </a>
      </p>
    </LoadingIconWithPopover>
  )
}
