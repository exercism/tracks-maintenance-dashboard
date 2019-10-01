import levenshtein from 'js-levenshtein'
import React, { useCallback, useMemo } from 'react'
import { useRemoteTopics } from '../../hooks/useRemoteTopics'
import { useToggleState } from '../../hooks/useToggleState'
import { RemoteConfig } from '../../net/RemoteConfig'
import { LoadingIndicator } from '../LoadingIndicator'
import { ContainedPopover } from '../Popover'
import { CheckOrCross } from './../CheckOrCross'

export function TrackTopics({ trackId }: { trackId: TrackIdentifier }): JSX.Element {

  return (
    <section>
      <header className="mb-4">
        <h2>Exercise Topics</h2>
      </header>

      <RemoteConfig trackId={trackId}>
        {({ config }) => (
          <ExerciseTable trackId={trackId} foregone={config.foregone} exercises={config.exercises} />
        )}
      </RemoteConfig>
    </section>
  )
}


const NO_EXCERCISES: ReadonlyArray<ExerciseConfiguration> = []
const NO_FOREGONE_EXERCISES: ReadonlyArray<string> = []

function ExerciseTable({
  trackId,
  exercises,
  foregone,
}: {
  trackId: TrackIdentifier
  exercises: ReadonlyArray<ExerciseConfiguration>
  foregone?: ReadonlyArray<string>
}) {
  const [details, setDetails] = useToggleState()
  const { list, done } = useRemoteTopics()
  const validExercises = useValidExercises(foregone || NO_FOREGONE_EXERCISES, exercises)

  const lookupTopic = useMemo(() => {
    if (!list) {
      return {}
    }

    return list.reduce((result, item) => {
      result[item] = true
      return result
    }, {} as Record<string, true>)
   }, [list])

  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration) => {
      return (
        <ExerciseRow
          exercise={exercise}
          key={exercise.slug}
          topics={lookupTopic}
          detailsActive={details === exercise.slug}
          onToggleDetails={setDetails}
        />
      )
    },
    [details, setDetails, lookupTopic]
  )

  if (!done) {
    return <div><LoadingIndicator>Fetching <code>TOPICS.txt</code>...</LoadingIndicator></div>
  }

  if (!exercises || exercises.length === 0) {
    return <div>No exercises found</div>
  }

  return (
    <>
      <table className="table pb-4 table-responsive">
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
                Showing <span className="badge badge-pill badge-primary">{validExercises.length}</span> out of <span className="badge badge-pill badge-secondary">{exercises.length}</span> exercises.
                Deprecated and foregone exercises are hidden.
              </p>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  )
}

interface ExerciseRowProps {
  exercise: ExerciseConfiguration;
  topics: Record<string, boolean>;
  detailsActive: boolean;
  onToggleDetails(key: string): void;
}

function ExerciseRow({ exercise, topics, detailsActive, onToggleDetails }: ExerciseRowProps) {

  const topicsList = useMemo(() => Object.keys(topics), [topics])
  const annotatedTopics = useMemo(() =>
    (exercise.topics || []).map((topic) => ({ topic, valid: !!topics[topic] })),
    [exercise.topics, topics]
  )
  const suggestions = useMemo(() =>
    annotatedTopics.reduce((suggestions, annotated) => {
      if (annotated.valid) {
        return suggestions
      }

      suggestions[annotated.topic] = findNearbyTopics(annotated.topic, topicsList)
      return suggestions
    }, {} as Record<string, ReadonlyArray<string>>),
    [annotatedTopics, topicsList]
  )

  const hasSuggestions = Object.keys(suggestions).length > 0

  return (
    <tr key={exercise.slug}>
      <ExerciseNameCell exercise={exercise} />
      <td>
        <ul className="list-inline mb-0">
          {annotatedTopics.map((annotated) => (
            <li key={annotated.topic}
              className={`list-inline-item badge badge-${annotated.valid ? 'success' : 'danger'}`}>
              {annotated.topic}
            </li>
          ))}
          {annotatedTopics.length === 0 && <li className="list-inline-item badge badge-warning">{'<none>'}</li>}
        </ul>
      </td>
      <td>
        <ContainedPopover
          active={detailsActive}
          onToggle={() => onToggleDetails(exercise.slug)}
          toggle={<CheckOrCross value={!hasSuggestions} />}
          align="right">
          {
            hasSuggestions
            ? <SuggestionsList suggestions={suggestions} />
            : <NoSuggestions />
          }
        </ContainedPopover>
      </td>
    </tr>
  )
}

function SuggestionsList({ suggestions }: { suggestions: Record<string, ReadonlyArray<string>> }) {
  return (
    <>
      <ul className="list-unstyled mb-2">
        {
          Object.keys(suggestions).map((topic) => (
            <li key={topic}>
              <span className="badge badge-danger mr-2">{topic}</span>{
                suggestions[topic].length === 0
                ? (<span>no suggestions</span>)
                : (<span>perhaps {suggestions[topic].map((suggestion) => <span key={suggestion} className="badge mr-1">{suggestion}</span>)}</span>)
              }
            </li>
          ))
        }
      </ul>
      <p className="mb-0">If you believe a topic is missing, add it <a href="https://github.com/exercism/problem-specifications/edit/master/TOPICS.txt">here</a> via a pull request.</p>
    </>
  )
}

function NoSuggestions() {
  return <span>All topics are in <code>TOPICS.txt</code>.</span>
}

function ExerciseNameCell({ exercise }: { exercise: ExerciseConfiguration }) {
  const Cell = exercise.core ? 'th' : 'td'

  return (
    <Cell>
      <img
        src={`https://assets.exercism.io/exercises/${exercise.slug}-turquoise.png`}
        alt={`${exercise} logo hover state`}
        style={{
          background: '#fff',
          border: '1px solid rgba(0,156,171,0.5)',
          padding: 4,
          borderRadius: 2,
          width: 24,
          height: 24,
          marginRight: 10,
          verticalAlign: 'text-top'
        }}
      />
      {exercise.slug}
    </Cell>
  )
}

function useValidExercises(foregone: ReadonlyArray<string>, exercises: ReadonlyArray<ExerciseConfiguration>) {
  if (!exercises) {
    return NO_EXCERCISES
  }

  return exercises.filter((exercise) => exercise.foregone !== true && foregone.indexOf(exercise.slug) === -1 && exercise.deprecated !== true)
}

const NEARBY_TOPICS_CACHE = {

} as Record<string, ReadonlyArray<string>>

function findNearbyTopics(topic: string, topics: ReadonlyArray<string>): ReadonlyArray<string> {
  if (NEARBY_TOPICS_CACHE[topic] !== undefined) {
    return NEARBY_TOPICS_CACHE[topic]
  }

  NEARBY_TOPICS_CACHE[topic] = topics.filter((potential) => levenshtein(topic, potential) < 5)
  return NEARBY_TOPICS_CACHE[topic]
}
