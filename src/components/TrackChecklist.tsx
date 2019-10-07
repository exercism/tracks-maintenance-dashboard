import React, { useState, useCallback } from 'react'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'
import { useToggleState } from '../hooks/useToggleState'

export const TrackChecklist = ({ trackId }: { trackId: TrackIdentifier }) => {
  const { done, checklist } = useTrackAsideData(trackId)
  const [
    activeDetailsKey,
    setActiveDetailsKey,
    outsideDetailsRef,
  ] = useToggleState<HTMLUListElement>()

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul
        className="list-group"
        style={{ whiteSpace: 'nowrap' }}
        ref={outsideDetailsRef}
      >
        <li className="list-group-item d-flex justify-content-between">
          Track blurb
          <BlurbIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('blurb')}
            loading={!done}
            valid={checklist.hasBlurb}
          />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          Auto approve exercise
          <AutoApproveIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('auto-approve')}
            loading={!done}
            valid={checklist.hasAutoApprove}
          />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          Exercises in core
          <CoreIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('core')}
            loading={!done}
            valid={checklist.exerciseCoreCount > 0}
          />
        </li>
        <li className="list-group-item d-flex justify-content-between">
          Exercises with topics
          <TopicsIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('topics')}
            loading={!done}
            valid={checklist.exerciseWithTopicsCount > 0}
          />
        </li>
      </ul>
    </aside>
  )
}

interface PreconfiguredIconProps {
  loading: boolean
  valid: boolean
  onToggleDetails: () => void
  currentDetails: string | undefined
}

function BlurbIcon({
  loading,
  valid,
  onToggleDetails,
  currentDetails,
}: PreconfiguredIconProps) {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'blurb'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is a <code>blurb</code> present in the{' '}
        <code>config.json</code> file, which in turn is located at the root of
        the repository. The <code>blurb</code> is a <strong>requirement</strong>
        .
      </p>
      <AboutConfigJson />
    </LoadingIconWithPopover>
  )
}

const AutoApproveIcon = ({
  loading,
  valid,
  onToggleDetails,
  currentDetails,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={currentDetails === 'auto-approve'}
    loading={loading}
    valid={valid}
    onToggle={onToggleDetails}
  >
    <p>
      This check passes if there is at least one exercise with the{' '}
      <code>auto_approve</code> flag switched to <code>true</code>. In general,
      this is the <em>first core</em> exercise of the track, usually{' '}
      <code>hello-world</code>.
    </p>
    <AboutConfigJson />
  </LoadingIconWithPopover>
)

const CoreIcon = ({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={currentDetails === 'core'}
    loading={loading}
    valid={valid}
    onToggle={onToggleDetails}
  >
    <p>
      This check passes if there is at least one <code>core</code> exercise in
      the <code>config.json</code>. Having a <em>core</em> track is{' '}
      <strong>required</strong>. Having non-core exercises (side exercises) is
      optional.
    </p>

    <AboutConfigJson />
  </LoadingIconWithPopover>
)

const TopicsIcon = ({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={currentDetails === 'topics'}
    loading={loading}
    valid={valid}
    onToggle={onToggleDetails}
  >
    <p>
      This check passes if there is at least one exercise in the{' '}
      <code>config.json</code> with 1 or more topics.
    </p>

    <AboutConfigJson />
  </LoadingIconWithPopover>
)

const AboutConfigJson = () => (
  <p className="mb-0">
    You can find more information about the <code>config.json</code> file{' '}
    <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">
      here
    </a>
    .
  </p>
)
