import levenshtein from 'js-levenshtein'
import React, { useCallback } from 'react'
import { RemoteConfig } from '../../net/LegacyRemoteConfig'
import { ExerciseIcon } from '../ExerciseIcon'
import { ExerciseIdentifier, Legacy, TrackIdentifier } from '../../types'

type ExerciseConfiguration = Legacy.ExerciseConfiguration
type TrackConfiguration = Legacy.TrackConfiguration

interface TrackTopicsProps {
  trackId: TrackIdentifier
  onShowExercise: (exercise: ExerciseIdentifier) => void
}

export function TrackTopics({
  trackId,
  onShowExercise,
}: TrackTopicsProps): JSX.Element {
  return (
    <section>
      <header className="mb-4">
        <h2 id="topics">Exercise Topics</h2>
        <p>
          This is the list of exercises as found in the <code>{trackId}</code>{' '}
          track, without the deprecated or foregone exercises. Each exercise
          should have one or more <strong>topics</strong> which indicate what
          the exercise is about.
        </p>
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
  const practiceExercises = Array.isArray(exercises)
    ? (exercises as readonly Legacy.ExerciseConfiguration[])
    : exercises.practice
  const validExercises = useValidExercises(
    foregone || NO_FOREGONE_EXERCISES,
    practiceExercises
  )

  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration) => {
      return (
        <ExerciseRow
          key={exercise.slug}
          exercise={exercise}
          onShowExercise={onShowExercise}
        />
      )
    },
    [onShowExercise]
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
            <th style={{ minWidth: 256 }}>Topics</th>
            <th style={{ minWidth: 64 }} />
          </tr>
        </thead>
        <tbody>{validExercises.map(renderExercise)}</tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>
              <p className="text-muted mb-0">
                Showing <ValidBadge count={validExercises.length} /> out of{' '}
                <TotalBadge count={practiceExercises.length} /> exercises.
                Deprecated and foregone exercises are hidden.
              </p>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  )
}

function ValidBadge({ count }: { count: number }): JSX.Element {
  return <span className="badge badge-pill badge-primary">{count}</span>
}

function TotalBadge({ count }: { count: number }): JSX.Element {
  return <span className="badge badge-pill badge-secondary">{count}</span>
}

interface ExerciseRowProps {
  exercise: ExerciseConfiguration
  onShowExercise(exercise: ExerciseIdentifier): void
}

function ExerciseRow({
  exercise,
  onShowExercise,
}: ExerciseRowProps): JSX.Element | null {  
  const doShowExercise = useCallback(() => onShowExercise(exercise.slug), [
    exercise,
    onShowExercise,
  ])

  return (
    <tr key={exercise.slug}>
      <ExerciseNameCell exercise={exercise} onShowDetails={doShowExercise} />
      <td>
        <ul className="list-inline mb-0">
          {(exercise.topics || []) .map((topic) => (
            <li
              key={topic}
              className={`list-inline-item badge badge-success`}
            >
              {topic}
            </li>
          ))}
          {exercise.topics === null || exercise.topics.length === 0 && (
            <li className="list-inline-item badge badge-warning">{'<none>'}</li>
          )}
        </ul>
      </td>
    </tr>
  )
}

function ExerciseNameCell({
  exercise,
  onShowDetails,
}: {
  exercise: ExerciseConfiguration
  onShowDetails(): void
}): JSX.Element {
  const Cell = exercise.core ? 'th' : 'td'

  return (
    <Cell onClick={onShowDetails}>
      <ExerciseIcon exercise={exercise.slug} size={24} />
      <span className="ml-2">{exercise.slug}</span>
    </Cell>
  )
}

function useValidExercises(
  foregone: ReadonlyArray<string>,
  exercises: ReadonlyArray<ExerciseConfiguration>
): readonly ExerciseConfiguration[] {
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

const NEARBY_TOPICS_CACHE = {} as Record<string, ReadonlyArray<string>>

function findNearbyTopics(
  topic: string,
  topics: ReadonlyArray<string>
): ReadonlyArray<string> {
  if (NEARBY_TOPICS_CACHE[topic] !== undefined) {
    return NEARBY_TOPICS_CACHE[topic]
  }

  NEARBY_TOPICS_CACHE[topic] = topics.filter(
    (potential) =>
      levenshtein(topic, potential) < 5 ||
      potential.split('_').indexOf(topic) !== -1 ||
      topic.split('_').indexOf(potential) !== -1
  )
  return NEARBY_TOPICS_CACHE[topic]
}
