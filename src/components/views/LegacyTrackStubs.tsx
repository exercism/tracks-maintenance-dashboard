import React, { useCallback } from 'react'

import { RemoteConfig } from '../../net/LegacyRemoteConfig'
import { useTrackData } from '../../hooks/useLegacyTrackData'
import {
  useRemoteStub,
  MINIMUM_STUB_LENGTH,
} from '../../hooks/useLegacyRemoteStub'
import { useToggleState } from '../../hooks/useToggleState'

import { CheckOrCross } from '../CheckOrCross'
import { LoadingIndicator } from '../LoadingIndicator'
import { ContainedPopover } from '../Popover'
import { ExerciseIcon } from '../ExerciseIcon'
import { useKeyPressListener } from '../../hooks/useKeyListener'
import { useActionableState } from '../../hooks/useActionableOnly'
import {
  ExerciseIdentifier,
  Legacy,
  TrackData,
  TrackIdentifier,
} from '../../types'

type ExerciseConfiguration = Legacy.ExerciseConfiguration
type TrackConfiguration = Legacy.TrackConfiguration

interface TrackStubsProps {
  trackId: TrackIdentifier
  onShowExercise(exercise: ExerciseIdentifier): void
}

export function TrackStubs({
  trackId,
  onShowExercise,
}: TrackStubsProps): JSX.Element {
  return (
    <section>
      <header className="mb-4">
        <h2 id="#stubs">Exercise Stubs</h2>
      </header>

      <RemoteConfig trackId={trackId}>
        {({ config }): JSX.Element => (
          <ExerciseTable
            trackId={trackId}
            config={config}
            onShowExercise={onShowExercise}
          />
        )}
      </RemoteConfig>
    </section>
  )
}

const NO_EXERCISES: ReadonlyArray<ExerciseConfiguration> = []
const NO_FOREGONE_EXERCISES: ReadonlyArray<string> = []

interface ExerciseTableProps {
  trackId: TrackIdentifier
  config: TrackConfiguration
  onShowExercise(exercise: ExerciseIdentifier): void
}

function ExerciseTable({
  trackId,
  config: { exercises, foregone },
  onShowExercise,
}: ExerciseTableProps): JSX.Element {
  const [details, doSetDetails] = useToggleState(
    undefined,
    'popover',
    'popover-toggle'
  )

  useKeyPressListener(['Esc', 'Escape'], doSetDetails)

  const track = useTrackData(trackId)
  const practiceExercises = Array.isArray(exercises)
    ? (exercises as readonly Legacy.ExerciseConfiguration[])
    : exercises.practice
  const validExercises = useValidExercises(
    foregone || NO_FOREGONE_EXERCISES,
    practiceExercises
  )
  const { deprecated } = useInvalidExercises(
    foregone || NO_FOREGONE_EXERCISES,
    practiceExercises
  )

  const doShowExercise = useCallback(
    (exercise: ExerciseIdentifier) => {
      onShowExercise(exercise)
    },
    [onShowExercise]
  )

  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration) => {
      const detailsActive = details === exercise.slug
      return (
        <ExerciseRow
          exercise={exercise}
          key={exercise.slug}
          trackId={trackId}
          detailsActive={detailsActive}
          onToggleDetails={doSetDetails}
          onShowExercise={doShowExercise}
        />
      )
    },
    [details, doSetDetails, doShowExercise, trackId]
  )

  if (!exercises || practiceExercises.length === 0) {
    return <div>No exercises found</div>
  }

  return (
    <>
      <table
        className="table table-responsive"
        style={{ paddingBottom: '4.5rem' }}
      >
        <thead>
          <tr>
            <th style={{ minWidth: 256 }}>Exercise</th>
            <th style={{ minWidth: 200 }}>
              {track.name} stub <StubInfoButton trackData={track} />
            </th>
            <th />
          </tr>
        </thead>
        <tbody>{validExercises.map(renderExercise)}</tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>
              <p className="text-muted">
                Showing{' '}
                <span className="badge badge-pill badge-primary">
                  {validExercises.length}
                </span>{' '}
                out of{' '}
                <span className="badge badge-pill badge-secondary">
                  {practiceExercises.length}
                </span>{' '}
                exercises. Deprecated and foregone exercises are hidden.
              </p>
            </td>
          </tr>
        </tfoot>
      </table>

      <ForegoneSection exercises={foregone || NO_FOREGONE_EXERCISES} />
      <DeprecatedSection exercises={deprecated} />
    </>
  )
}

function StubInfoButton({ trackData }: { trackData: TrackData }): JSX.Element {
  const { stub_file: stubFile } = trackData

  const [active, setActive] = useToggleState(
    undefined,
    'popover',
    'popover-toggle'
  )
  const doToggle = useCallback(() => setActive('stub.help'), [setActive])

  return (
    <ContainedPopover
      align="center"
      active={active === 'stub.help'}
      onToggle={doToggle}
      toggle={
        <span aria-label="more information" role="img">
          ℹ️
        </span>
      }
    >
      <p>
        The stub file is fetched from the {trackData.name} repository, at{' '}
        <code>{stubFile || '<unknown>'}</code>.
      </p>
      <p className="mb-0">
        The casing of the <code>{'{placeholder}'}</code> is matched.
      </p>
    </ContainedPopover>
  )
}

interface ExerciseRowProps {
  exercise: ExerciseConfiguration
  trackId: TrackIdentifier
  detailsActive: boolean
  onToggleDetails(key: string): void
  onShowExercise(exercise: ExerciseIdentifier): void
}

function ExerciseRow({
  exercise,
  trackId,
  detailsActive,
  onToggleDetails,
  onShowExercise,
}: ExerciseRowProps): JSX.Element | null {
  const { done: remoteDone, stub: remoteStub, url: remoteUrl } = useRemoteStub(
    trackId,
    exercise.slug
  )

  const doToggle = useCallback(() => onToggleDetails(exercise.slug), [
    exercise,
    onToggleDetails,
  ])
  const doShowExerciseDetails = useCallback(
    () => onShowExercise(exercise.slug),
    [exercise, onShowExercise]
  )

  const [actionableOnly] = useActionableState()

  if (actionableOnly) {
    // Don't show whilst loading
    if (!remoteDone) {
      return null
    }

    // Hide if up-to-date
    const valid = remoteStub && remoteStub > MINIMUM_STUB_LENGTH
    if (valid) {
      return null
    }
  }

  return (
    <tr key={exercise.slug}>
      <ExerciseNameCell
        exercise={exercise}
        onShowDetails={doShowExerciseDetails}
      />
      <StubCell url={remoteUrl} stubLength={remoteStub} done={remoteDone} />
      <DetailsCell
        active={detailsActive}
        onToggle={doToggle}
        stubLength={remoteStub}
        done={remoteDone}
      />
    </tr>
  )
}

interface ExerciseNameCellProps {
  exercise: ExerciseConfiguration
  onShowDetails(): void
}

function ExerciseNameCell({
  exercise,
  onShowDetails,
}: ExerciseNameCellProps): JSX.Element {
  const Cell = exercise.core ? 'th' : 'td'

  return (
    <Cell onClick={onShowDetails}>
      <ExerciseIcon exercise={exercise.slug} size={24} />
      <span className="ml-2">{exercise.slug}</span>
    </Cell>
  )
}

interface StubCellProps {
  url: string | undefined
  stubLength: number | undefined
  done: boolean
}

function StubCell({ url, stubLength, done }: StubCellProps): JSX.Element {
  return (
    <td>
      <a href={url}>
        <code>
          {stubLength
            ? `${stubLength} chars`
            : (done && '<none>') || <LoadingIndicator />}
        </code>
      </a>
    </td>
  )
}

interface DetailsCellProps {
  active: boolean
  onToggle(): void
  done: boolean
  stubLength: number | undefined
}

function DetailsCell({
  active,
  onToggle,
  stubLength,
  done,
}: DetailsCellProps): JSX.Element | null {
  if (!done) {
    return (
      <td>
        <button type="button" style={{ background: 0, border: 0 }}>
          <span role="img" aria-label="Fetching stub...">
            ⏳
          </span>
        </button>
      </td>
    )
  }

  const valid = stubLength! > MINIMUM_STUB_LENGTH

  return (
    <td>
      <ContainedPopover
        active={active}
        onToggle={onToggle}
        toggle={<CheckOrCross value={valid} />}
        align="right"
      >
        {valid ? <StubExists /> : <StubDoesNotExist />}
      </ContainedPopover>
    </td>
  )
}

function StubExists(): JSX.Element {
  return <p className="mb-0">The exercise has a stub file.</p>
}

function StubDoesNotExist(): JSX.Element {
  return (
    <p className="mb-0">
      This exercise does not have a stub file or it does not have sufficient
      content. Add a stub file for this exercise to resolve this issue.
    </p>
  )
}

function ForegoneSection({
  exercises,
}: {
  exercises: ReadonlyArray<string>
}): JSX.Element | null {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h3>Foregone</h3>
      <p>
        Exercises listed here have the <code>foregone</code> flag set to{' '}
        <code>true</code>. This means that the track has <em>explicitely</em>{' '}
        chosen to forego implementing this exercise.
      </p>

      <ul>
        {exercises.map((exercise) => {
          return <li key={exercise}>{exercise}</li>
        })}
      </ul>
    </section>
  )
}

function DeprecatedSection({
  exercises,
}: {
  exercises: ReadonlyArray<ExerciseConfiguration>
}): JSX.Element | null {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h3>Deprecated</h3>
      <p>
        Exercises listed here have the <code>deprecated</code> flag set to{' '}
        <code>true</code>. This means that the exercise has been implemented but
        will no longer be updated, as it&apos;s no longer considered part of the
        track.
      </p>

      <ul>
        {exercises.map((exercise) => {
          return <li key={exercise.slug}>{exercise.slug}</li>
        })}
      </ul>
    </section>
  )
}

function useValidExercises(
  foregone: ReadonlyArray<string>,
  exercises: ReadonlyArray<ExerciseConfiguration>
): ReadonlyArray<ExerciseConfiguration> {
  if (!exercises) {
    return NO_EXERCISES
  }

  return exercises.filter(
    (exercise) =>
      exercise.foregone !== true &&
      foregone.indexOf(exercise.slug) === -1 &&
      exercise.deprecated !== true
  )
}

function useInvalidExercises(
  foregone: ReadonlyArray<string>,
  exercises: ReadonlyArray<ExerciseConfiguration>
): {
  foregone: readonly string[]
  deprecated: readonly ExerciseConfiguration[]
} {
  if (!exercises) {
    return { foregone, deprecated: NO_EXERCISES }
  }

  return exercises.reduce(
    (result, exercise) => {
      if (exercise.foregone) {
        result.foregone.push(exercise.slug)
      }

      if (exercise.deprecated) {
        result.deprecated.push(exercise)
      }

      return result
    },
    { foregone: [...foregone], deprecated: [] as ExerciseConfiguration[] }
  )
}
