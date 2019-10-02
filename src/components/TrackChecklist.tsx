import React, { useCallback } from 'react'
import { useToggleState } from '../hooks/useToggleState'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'

export function TrackChecklist({ trackId }: { trackId: TrackIdentifier }) {
  const { done, checklist } = useTrackAsideData(trackId)

  const [currentDetails, doToggleDetails] = useToggleState()

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          Track blurb
          <BlurbIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} loading={!done} valid={checklist.hasBlurb} />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          Auto approve exercise
          <AutoApproveIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} loading={!done} valid={checklist.hasAutoApprove} />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          Exercises in core
          <CoreIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} loading={!done} valid={checklist.exerciseCoreCount > 0} />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          Exercises with topics
          <TopicsIcon currentDetails={currentDetails} onToggleDetails={doToggleDetails} loading={!done} valid={checklist.exerciseWithTopicsCount > 0} />
        </li>
      </ul>
    </aside>
  )
}


interface PreconfiguredIconProps {
  loading: boolean;
  valid: boolean;
  currentDetails?: string;
  onToggleDetails?(next: string): void;
}

function BlurbIcon({ loading, valid, currentDetails, onToggleDetails }: PreconfiguredIconProps) {
  const active = currentDetails === 'blurb'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('blurb'), [onToggleDetails])

  return (
    <LoadingIconWithPopover active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>
        This check passes if there is a <code>blurb</code> present in the <code>config.json</code> file,
        which in turn is located at the root of the repository. The <code>blurb</code> is a <strong>requirement</strong>.
      </p>
      <AboutConfigJson />
    </LoadingIconWithPopover>
  )
}

function AutoApproveIcon({ loading, valid, currentDetails, onToggleDetails }: PreconfiguredIconProps) {
  const active = currentDetails === 'auto-approve'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('auto-approve'), [onToggleDetails])

  return (
    <LoadingIconWithPopover active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>
        This check passes if there is at least one exercise with the <code>auto_approve</code> flag switched to <code>true</code>.
        In general, this is the <em>first core</em> exercise of the track, usually <code>hello-world</code>.
      </p>
      <AboutConfigJson />
    </LoadingIconWithPopover>
  )
}

function CoreIcon({ loading, valid, currentDetails, onToggleDetails }: PreconfiguredIconProps) {
  const active = currentDetails === 'core'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('core'), [onToggleDetails])

  return (
  <LoadingIconWithPopover active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>
        This check passes if there is at least one <code>core</code> exercise in the <code>config.json</code>.
        Having a <em>core</em> track is <strong>required</strong>. Having non-core exercises (side exercises) is
        optional.
      </p>

      <AboutConfigJson />
    </LoadingIconWithPopover>
  )
}

function TopicsIcon({ loading, valid, currentDetails, onToggleDetails }: PreconfiguredIconProps) {
  const active = currentDetails === 'topics'
  const doToggle = useCallback(() => onToggleDetails && onToggleDetails('topics'), [onToggleDetails])

  return (
    <LoadingIconWithPopover active={active}
      loading={loading}
      valid={valid}
      onToggle={doToggle}>
      <p>
        This check passes if there is at least one exercise in the <code>config.json</code> with 1 or more topics.
      </p>

      <AboutConfigJson />
    </LoadingIconWithPopover>
  )
}

function AboutConfigJson() {
  return (
    <p className="mb-0">
      You can find more information about the <code>config.json</code> file <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">here</a>.
    </p>
  )
}
