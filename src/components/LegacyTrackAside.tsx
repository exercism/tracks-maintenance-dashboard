import React from 'react'
import { useActionableState } from '../hooks/useActionableOnly'
import { useKeyPressListener } from '../hooks/useKeyListener'
import { useRemoteConfig } from '../hooks/useLegacyRemoteConfig'
import { useTrackAsideData } from '../hooks/useLegacyTrackData'
import { useToggleState } from '../hooks/useToggleState'
import type { TrackIdentifier } from '../types'
import { LoadingIconWithPopover } from './Popover'

export interface TrackAsideProps {
  trackId: TrackIdentifier
}

export function TrackAside({ trackId }: TrackAsideProps): JSX.Element {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { done, data } = useTrackAsideData(trackId)
  const [actionableOnly] = useActionableState()

  const [
    activeDetailsKey,
    setActiveDetailsKey,
  ] = useToggleState<HTMLUListElement>(undefined, 'popover', 'popover-toggle')

  useKeyPressListener(['Esc', 'Escape'], setActiveDetailsKey)

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={trackId}>Repository</RepositoryLink>
        </li>
        <AsideItem disabled={actionableOnly && !!config}>
          <a
            href={`https://github.com/exercism/${trackId}/blob/main/config.json`}
            className="d-block mr-4"
          >
            Normalized Configuration
          </a>

          <ConfigurationIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('config.json')}
            loading={!doneConfig}
            valid={!!config}
          />
        </AsideItem>
        <AsideItem disabled={actionableOnly && data['analyzer'] === true}>
          <RepositoryLink repository={`${trackId}-analyzer`}>
            Automated Analysis
          </RepositoryLink>
          <AnalyzerIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('analyzer')}
            trackId={trackId}
            loading={!done}
            valid={data['analyzer'] === true}
          />
        </AsideItem>
        <AsideItem disabled={actionableOnly && data['testRunner'] === true}>
          <RepositoryLink repository={`${trackId}-test-runner`}>
            Test Runner
          </RepositoryLink>
          <TestRunnerIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('test-runner')}
            trackId={trackId}
            loading={!done}
            valid={data['testRunner'] === true}
          />
        </AsideItem>
      </ul>

      {done && data['analyzer'] === true && (
        <ul className="list-group mt-4">
          <li className="list-group-item d-flex w-100 w-sm-auto justify-content-between">
            <a
              href={`https://exercism.io/admin/analyses`}
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

function AsideItem({
  disabled,
  children,
}: {
  disabled?: boolean
  children: React.ReactNode
}): JSX.Element {
  return (
    <li
      className={`list-group-item d-flex justify-content-between ${
        disabled ? 'not-actionable' : ''
      }`}
    >
      {children}
    </li>
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
}): JSX.Element {
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

function ConfigurationIcon({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
}: PreconfiguredIconProps): JSX.Element {
  return (
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
        <a href="https://github.com/exercism/problem-specifications/blob/main/CONTRIBUTING.md#track-configuration-file">
          here
        </a>
        .
      </p>
    </LoadingIconWithPopover>
  )
}

function AnalyzerIcon({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
  trackId,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }): JSX.Element {
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
        <a href="https://github.com/exercism/automated-analysis/blob/main/docs/docker.md">
          here
        </a>
        , or about{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/main/docs/about.md">
          the automated analysis in general
        </a>
        , as well as the steps to{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/main/docs/creating-an-analyzer.md">
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
}: PreconfiguredIconProps & { trackId: TrackIdentifier }): JSX.Element {
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
        <a href="https://github.com/exercism/automated-tests/blob/main/docs/docker.md">
          here
        </a>
      </p>
    </LoadingIconWithPopover>
  )
}
