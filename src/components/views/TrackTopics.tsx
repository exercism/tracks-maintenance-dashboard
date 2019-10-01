import React, { useCallback, useState, useMemo } from 'react'

import { RemoteConfig } from '../../net/RemoteConfig'
import { useTrackData } from '../../hooks/useTrackData'
import { useRemoteTopics } from '../../hooks/useRemoteTopics'

import { CheckOrCross } from './../CheckOrCross'
import { LoadingIndicator } from '../LoadingIndicator'
import { Popover, ContainedPopover } from '../Popover'


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
  const track = useTrackData(trackId)
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
        />
      )
    },
    [trackId, lookupTopic]
  )

  if (!done) {
    return <div><LoadingIndicator>Fetching <code>TOPICS.txt</code>...</LoadingIndicator></div>
  }

  if (!exercises || exercises.length === 0) {
    return <div>No exercises found</div>
  }

  return (
    <>
      <table className="table mb-4 table-responsive">
        <thead>
          <tr>
            <th style={{ minWidth: 256 }}>Exercise</th>
            <th style={{ minWidth: 256 }}>Topics</th>
            <th style={{ minWidth: 64 }} />
          </tr>
        </thead>
        <tbody>{validExercises.map(renderExercise)}</tbody>
      </table>
    </>
  )
}

function VersionInfoButton({ trackData }: { trackData: TrackData }) {
  const { versioning } = trackData

  return (
    <ContainedPopover align="center" toggle={<span aria-label="more information" role="img">ℹ️</span>}>
      <p>
        The version information is fetched from the {trackData.name} repository, at <code>{versioning || '<unknown>'}</code>.
      </p>
      <p className="mb-0">The casing of the <code>{"{placeholder}"}</code> is matched.</p>
    </ContainedPopover>
  )
}

function ExerciseRow({
  exercise,
  topics
}: {
  exercise: ExerciseConfiguration
  topics: Record<string, boolean>
}) {

  const annotatedTopics = (exercise.topics || []).map((topic) => {
    if (topics[topic]) {
      return { topic, valid: true }
    }

    return { topic, valid: false }
  })

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
        <CheckOrCross value={annotatedTopics.every((annotated) => annotated.valid)} />
      </td>
    </tr>
  )
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
