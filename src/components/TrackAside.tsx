import React, { useState, useCallback } from 'react'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { useTrackAsideData } from '../hooks/useTrackData'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { LoadingIconWithPopover } from './Popover'

export const TrackAside = ({ trackId }: { trackId: TrackIdentifier }) => {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { done, data } = useTrackAsideData(trackId)
  //test-runner
  const [testRunnerVisible, setTestRunnerVisible] = useState<boolean>(false)
  const testRunnerRef = useOutsideClick(
    useCallback(() => setTestRunnerVisible(false), [testRunnerVisible])
  )
  //normalized-configuration
  const [normalizedConfigVisible, setNormalizedConfigVisible] = useState<
    boolean
  >(false)
  const normalizedConfigRef = useOutsideClick(
    useCallback(() => setNormalizedConfigVisible(false), [
      normalizedConfigVisible,
    ])
  )
  //automated-analysis
  const [automatedAnalysisVisible, setAutomatedAnalysisVisible] = useState<
    boolean
  >(false)
  const automatedAnalysisRef = useOutsideClick(
    useCallback(() => setAutomatedAnalysisVisible(false), [
      automatedAnalysisVisible,
    ])
  )

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={trackId}>Repository</RepositoryLink>
        </li>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={normalizedConfigRef}
        >
          <a
            href={`https://github.com/exercism/${trackId}/blob/master/config.json`}
            className="d-block mr-4"
          >
            Normalized Configuration
          </a>
          <ConfigurationIcon
            contentVisible={normalizedConfigVisible}
            onToggleDetails={() => setNormalizedConfigVisible((prev) => !prev)}
            loading={!doneConfig}
            valid={!!config}
          />
        </li>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={automatedAnalysisRef}
        >
          <RepositoryLink repository={`${trackId}-analyzer`}>
            Automated Analysis
          </RepositoryLink>
          <AnalyzerIcon
            onToggleDetails={() => setAutomatedAnalysisVisible((prev) => !prev)}
            contentVisible={automatedAnalysisVisible}
            trackId={trackId}
            loading={!done}
            valid={data['analyzer'] === true}
          />
        </li>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={testRunnerRef}
        >
          <RepositoryLink repository={`${trackId}-test-runner`}>
            Test Runner
          </RepositoryLink>
          <TestRunnerIcon
            onToggleDetails={() => setTestRunnerVisible((prev) => !prev)}
            contentVisible={testRunnerVisible}
            trackId={trackId}
            loading={!done}
            valid={data['testRunner'] === true}
          />
        </li>
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
  contentVisible: boolean
}

const ConfigurationIcon = ({
  loading,
  valid,
  contentVisible,
  onToggleDetails,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={contentVisible}
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

const AnalyzerIcon = ({
  loading,
  valid,
  contentVisible,
  onToggleDetails,
  trackId,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }) => (
  <LoadingIconWithPopover
    active={contentVisible}
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

const TestRunnerIcon = ({
  loading,
  valid,
  onToggleDetails,
  trackId,
  contentVisible,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }) => (
  <LoadingIconWithPopover
    active={contentVisible}
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
