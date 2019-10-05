import levenshtein from 'js-levenshtein'
import React, { useCallback, useMemo } from 'react'
import { useRemoteTopics } from '../../hooks/useRemoteTopics'
import { useToggleState } from '../../hooks/useToggleState'
import { RemoteConfig } from '../../net/RemoteConfig'
import { LoadingIndicator } from '../LoadingIndicator'
import { ContainedPopover } from '../Popover'
import { CheckOrCross } from '../CheckOrCross'
import { ExerciseIcon } from '../ExerciseIcon'

interface TrackTopicsProps {
  trackId: TrackIdentifier;
  onShowExercise: (exercise: ExerciseIdentifier) => void;
}

export function TrackTopics({ trackId, onShowExercise }: TrackTopicsProps): JSX.Element {

  return (
    <section>
      <header className="mb-4">
        <h2 id="topics">Exercise Topics</h2>
        <p>
          This is the list of exercises as found in the <code>{trackId}</code> track, without the deprecated or
          foregone exercises. Each exercise should have one or more <strong>topics</strong> which indicate what the
          exercise is about. In order to normalise these topics accorss tracks, a list of available topics lives in
          the <TopicsFileLink><code>exercism/problem-specifications</code> repository</TopicsFileLink> as
          the file <TopicsFileLink><code>TOPICS.txt</code></TopicsFileLink>.
        </p>
      </header>

      <RemoteConfig trackId={trackId}>
        {({ config }) => (
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

function TopicsFileLink({ children, edit }: { children: React.ReactNode; edit?: boolean }) {

  return (
    <a href={`https://github.com/exercism/problem-specifications/${ edit === true ? 'edit' : 'blob' }/master/TOPICS.txt`}>
      {children}
    </a>
  )
}

const NO_EXCERCISES: ReadonlyArray<ExerciseConfiguration> = []
const NO_FOREGONE_EXERCISES: ReadonlyArray<string> = []

interface ExerciseTableProps {
  trackId: TrackIdentifier;
  config: TrackConfiguration;
  onShowExercise(exercise: ExerciseIdentifier): void;
}

function ExerciseTable({
  trackId,
  config: { exercises, foregone },
  onShowExercise
}: ExerciseTableProps) {
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
      const detailsActive = details === exercise.slug

      return (
        <ExerciseRow key={exercise.slug}
          exercise={exercise}
          topics={lookupTopic}
          detailsActive={detailsActive}
          onToggleDetails={setDetails}
          onShowExercise={onShowExercise}
        />
      )
    },
    [details, setDetails, lookupTopic]
  )

  if (!done) {
    return (
      <div className="alert alert-info">
        <LoadingIndicator>Fetching list of all <em>topics</em>...</LoadingIndicator>
      </div>
    )
  }

  if (!exercises || exercises.length === 0) {
    return <div>No exercises found</div>
  }

  return (
    <>
      <table className="table table-responsive" style={{ paddingBottom: '4.5rem' }}>
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
                Showing <ValidBadge count={validExercises.length} /> out of <TotalBadge count={exercises.length} /> exercises.
                Deprecated and foregone exercises are hidden.
              </p>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  )
}

function ValidBadge({ count }: { count: number }) {
  return (
    <span className="badge badge-pill badge-primary">{count}</span>
  )
}

function TotalBadge({ count }: { count: number }) {
  return (
    <span className="badge badge-pill badge-secondary">{count}</span>
  )
}

interface ExerciseRowProps {
  exercise: ExerciseConfiguration;
  topics: Record<string, boolean>;
  detailsActive: boolean;
  onToggleDetails(key: string): void;
  onShowExercise(exercise: ExerciseIdentifier): void;
}

function ExerciseRow({ exercise, topics, detailsActive, onToggleDetails, onShowExercise }: ExerciseRowProps) {

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
  const doShowExercise = useCallback(() => onShowExercise(exercise.slug), [exercise, onShowExercise])

  return (
    <tr key={exercise.slug}>
      <ExerciseNameCell exercise={exercise} onShowDetails={doShowExercise} />
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
      <p className="mb-0">If you believe a topic is missing, add it <TopicsFileLink edit={true}>here</TopicsFileLink> via a pull request.</p>
    </>
  )
}

function NoSuggestions() {
  return <span>All topics are in <TopicsFileLink><code>TOPICS.txt</code></TopicsFileLink>.</span>
}

function ExerciseNameCell({ exercise, onShowDetails }: { exercise: ExerciseConfiguration; onShowDetails(): void }) {
  const Cell = exercise.core ? 'th' : 'td'

  return (
    <Cell onClick={onShowDetails}>
      <ExerciseIcon exercise={exercise.slug} size={24} />
      <span className="ml-2">{exercise.slug}</span>
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

  NEARBY_TOPICS_CACHE[topic] = topics.filter(
    (potential) => levenshtein(topic, potential) < 5
      || potential.split('_').indexOf(topic) !== -1
      || topic.split('_').indexOf(potential) !== -1)
  return NEARBY_TOPICS_CACHE[topic]
}
