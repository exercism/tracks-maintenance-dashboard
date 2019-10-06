import React, { useState, useCallback } from 'react'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'
import { useOutsideClick } from '../hooks/useOutsideClick'

export const TrackChecklist = ({ trackId }: { trackId: TrackIdentifier }) => {
  const { done, checklist } = useTrackAsideData(trackId)
  //track-blurb
  const [trackBlurbVisible, setTrackBlurbVisible] = useState<boolean>(false)
  const trackBlurbRef = useOutsideClick(
    useCallback(() => setTrackBlurbVisible(false), [trackBlurbVisible])
  )
  //auto-approve-exercise
  const [approveExerciseVisible, setApproveExerciseVisible] = useState<boolean>(
    false
  )
  const approveExerciseVisibleRef = useOutsideClick(
    useCallback(() => setApproveExerciseVisible(false), [
      approveExerciseVisible,
    ])
  )
  //exercises-in-core
  const [exercisesInCoreVisible, setExercisesInCoreVisible] = useState<boolean>(
    false
  )
  const exerciseInCoreRef = useOutsideClick(
    useCallback(() => setExercisesInCoreVisible(false), [
      exercisesInCoreVisible,
    ])
  )
  //exercises-with-topics
  const [exercisesWithTopicsVisible, setExercisesWithTopicsVisible] = useState<
    boolean
  >(false)
  const exerciseWithTopicsRef = useOutsideClick(
    useCallback(() => setExercisesWithTopicsVisible(false), [
      exercisesWithTopicsVisible,
    ])
  )
  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={trackBlurbRef}
        >
          Track blurb
          <BlurbIcon
            onToggleDetails={() => setTrackBlurbVisible((prev) => !prev)}
            loading={!done}
            valid={checklist.hasBlurb}
            contentVisible={trackBlurbVisible}
          />
        </li>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={approveExerciseVisibleRef}
        >
          Auto approve exercise
          <AutoApproveIcon
            onToggleDetails={() => setApproveExerciseVisible((prev) => !prev)}
            loading={!done}
            valid={checklist.hasAutoApprove}
            contentVisible={approveExerciseVisible}
          />
        </li>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={exerciseInCoreRef}
        >
          Exercises in core
          <CoreIcon
            onToggleDetails={() => setExercisesInCoreVisible((prev) => !prev)}
            loading={!done}
            valid={checklist.exerciseCoreCount > 0}
            contentVisible={exercisesInCoreVisible}
          />
        </li>
        <li
          className="list-group-item d-flex justify-content-between"
          ref={exerciseWithTopicsRef}
        >
          Exercises with topics
          <TopicsIcon
            onToggleDetails={() =>
              setExercisesWithTopicsVisible((prev) => !prev)
            }
            loading={!done}
            valid={checklist.exerciseWithTopicsCount > 0}
            contentVisible={exercisesWithTopicsVisible}
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
  contentVisible: boolean
}

const BlurbIcon = ({
  loading,
  valid,
  onToggleDetails,
  contentVisible,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={contentVisible}
    loading={loading}
    valid={valid}
    onToggle={onToggleDetails}
  >
    <p>
      This check passes if there is a <code>blurb</code> present in the{' '}
      <code>config.json</code> file, which in turn is located at the root of the
      repository. The <code>blurb</code> is a <strong>requirement</strong>.
    </p>
    <AboutConfigJson />
  </LoadingIconWithPopover>
)

const AutoApproveIcon = ({
  loading,
  valid,
  onToggleDetails,
  contentVisible,
}: PreconfiguredIconProps) => (
  <LoadingIconWithPopover
    active={contentVisible}
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
