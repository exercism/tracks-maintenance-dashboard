import React from 'react'
import { useTrackAsideData } from '../hooks/useTrackData'
import { CheckOrCross } from './CheckOrCross'
import { LoadingIndicator } from './LoadingIndicator'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { ContainedPopover } from './Popover'

export function TrackAside({ trackId }: { trackId: TrackIdentifier }) {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { done, data } = useTrackAsideData(trackId)

  return (
    <aside className="mt-md-4 mb-4 col-12 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}`} className="d-block mr-4">
            Repository
          </a>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}/blob/master/config.json`} className="d-block mr-4">
            Normalised Configuration
          </a>
          <ConfigurationIcon loading={!doneConfig} valid={!!config} />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <a href={`https://github.com/exercism/${trackId}-analyzer`} className="d-block mr-4">
            Automated Analysis
          </a>
          <AnalyzerIcon trackId={trackId} loading={!done} valid={data['analyzer'] === true} />
        </li>
        <li className="list-group-item d-flex justify-content-between" >
          <a href={`https://github.com/exercism/${trackId}-test-runner`}  className="d-block mr-4">
            Test Runner
          </a>
          <TestRunnerIcon trackId={trackId} loading={!done} valid={data['testRunner'] === true} />
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

function IconWithPopover({ loading, valid, children }: { loading: boolean; valid: boolean; children: React.ReactNode }) {
  if (loading) {
    return (
      <button type="button" style={{ background: 0, border: 0}}>
        <LoadingIndicator />
      </button>
    )
  }

  return (
    <ContainedPopover align="right" toggle={<CheckOrCross value={valid} />}>
      {children}
    </ContainedPopover>
  )
}

function ConfigurationIcon({ loading, valid }: { loading: boolean; valid: boolean }) {
  return (
    <IconWithPopover loading={loading} valid={valid}>
      <p>This check passes if there is a <code>config.json</code> file present at the root of the repository.</p>
      <p className="mb-0">You can find more information about the <code>config.json</code> file <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">here</a>.</p>
    </IconWithPopover>
  )
}

function AnalyzerIcon({ loading, valid, trackId }: { loading: boolean; valid: boolean; trackId: TrackIdentifier }) {
  return (
    <IconWithPopover loading={loading} valid={valid}>
      <p>This check passes if there is a <code>Dockerfile</code> file present in the <code>exercism/{trackId}-analyzer</code> repository.</p>

      <p className="mb-0">You can find more information about the <code>Dockerfile</code> file <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">here</a>,
      or about <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">the automated analysis in general</a>, as well as the steps to <a href="https://github.com/exercism/automated-analysis/blob/master/docs/creating-an-analyzer.md">pass this test</a>.
      </p>
    </IconWithPopover>
  )
}

function TestRunnerIcon({ loading, valid, trackId }: { loading: boolean; valid: boolean; trackId: TrackIdentifier }) {
  return (
    <IconWithPopover loading={loading} valid={valid}>
      <p>This check passes if there is a <code>Dockerfile</code> file present in the <code>exercism/{trackId}-test-runner</code> repository.</p>

      <p className="mb-0">You can find more information about the <code>Dockerfile</code> file <a href="https://github.com/exercism/automated-tests/blob/master/docs/docker.md">here</a></p>
    </IconWithPopover>
  )
}
