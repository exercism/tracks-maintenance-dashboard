import React from 'react'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'
import { useToggleState } from '../hooks/useToggleState'
import { useKeyPressListener } from '../hooks/useKeyListener'
import { useActionableState } from '../hooks/useActionableOnly'

export const TrackChecklist = ({ trackId }: { trackId: TrackIdentifier }) => {
  const { done, checklist } = useTrackAsideData(trackId)
  const [activeDetailsKey, setActiveDetailsKey] = useToggleState(
    undefined,
    'popover',
    'popover-toggle'
  )
  const [actionableOnly] = useActionableState()

  useKeyPressListener(['Esc', 'Escape'], setActiveDetailsKey)

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <ChecklistItem disabled={actionableOnly && checklist.hasBlurb}>
          Track blurb
          <BlurbIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('blurb')}
            loading={!done}
            valid={checklist.hasBlurb}
          />
        </ChecklistItem>

        <ChecklistItem disabled={actionableOnly && checklist.hasAutoApprove}>
          Auto approve exercise
          <AutoApproveIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('auto-approve')}
            loading={!done}
            valid={checklist.hasAutoApprove}
          />
        </ChecklistItem>

        <ChecklistItem
          disabled={actionableOnly && checklist.exerciseCoreCount > 0}
        >
          Exercises in core {done ? `(${checklist.exerciseCoreCount})` : ''}
          <CoreIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('core')}
            loading={!done}
            valid={checklist.exerciseCoreCount > 0}
          />
        </ChecklistItem>

        <ChecklistItem
          disabled={actionableOnly && checklist.exerciseWithTopicsCount > 0}
        >
          Exercises with topics
          <TopicsIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={() => setActiveDetailsKey('topics')}
            loading={!done}
            valid={checklist.exerciseWithTopicsCount > 0}
          />
        </ChecklistItem>
      </ul>
    </aside>
  )
}

function ChecklistItem({
  disabled,
  children,
}: {
  disabled?: boolean
  children: React.ReactNode
}) {
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

function AutoApproveIcon({
  loading,
  valid,
  onToggleDetails,
  currentDetails,
}: PreconfiguredIconProps) {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'auto-approve'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is at least one exercise with the{' '}
        <code>auto_approve</code> flag switched to <code>true</code>. In
        general, this is the <em>first core</em> exercise of the track, usually{' '}
        <code>hello-world</code>.
      </p>
      <AboutConfigJson />
    </LoadingIconWithPopover>
  )
}

function CoreIcon({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
}: PreconfiguredIconProps) {
  return (
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
}

function TopicsIcon({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
}: PreconfiguredIconProps) {
  return (
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
}

function AboutConfigJson() {
  return (
    <p className="mb-0">
      You can find more information about the <code>config.json</code> file{' '}
      <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">
        here
      </a>
      .
    </p>
  )
}
