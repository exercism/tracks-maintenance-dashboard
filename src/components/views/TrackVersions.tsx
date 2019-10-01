import React, { useCallback, useState } from 'react'
import semver from 'semver'

import { RemoteConfig } from '../../net/RemoteConfig'
import { useTrackData } from '../../hooks/useTrackData'
import { useRemoteVersion } from '../../hooks/useRemoteVersion'
import { useRemoteCanonicalVersion } from '../../hooks/useRemoteCanonicalVersion'

import { CheckOrCross } from './../CheckOrCross'
import { LoadingIndicator } from '../LoadingIndicator'
import { Popover, ContainedPopover } from '../Popover'


export function TrackVersions({ trackId }: { trackId: TrackIdentifier }): JSX.Element {

  return (
    <section>
      <header className="mb-4">
        <h2>Exercise Versions</h2>
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
  const validExercises = useValidExercises(foregone || NO_FOREGONE_EXERCISES, exercises)
  const { deprecated } = useInvalidExercises(foregone || NO_FOREGONE_EXERCISES, exercises)

  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration) => {
      return (
        <ExerciseRow
          trackId={trackId}
          exercise={exercise}
          key={exercise.slug}
        />
      )
    },
    [trackId]
  )

  if (!exercises || exercises.length === 0) {
    return <div>No exercises found</div>
  }


  return (
    <>
      <table className="table mb-4 table-responsive">
        <thead>
          <tr>
            <th style={{ minWidth: 256 }}>Exercise</th>
            <th style={{ minWidth: 200 }}>{track.name} version <VersionInfoButton trackData={track} /></th>
            <th style={{ minWidth: 200 }}>Canonical data version</th>
            <th style={{ minWidth: 64 }} />
          </tr>
        </thead>
        <tbody>{validExercises.map(renderExercise)}</tbody>
      </table>

      <ForegoneSection exercises={foregone || NO_FOREGONE_EXERCISES} />
      <DeprecatedSection exercises={deprecated} />
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
  trackId,
  exercise,
}: {
  trackId: TrackIdentifier
  exercise: ExerciseConfiguration
}) {
  const {
    done: remoteDone,
    version: remoteVersion,
    url: remoteUrl,
  } = useRemoteVersion(trackId, exercise.slug)
  const {
    done: canonicalDone,
    version: canonicalVersion,
    url: canonicalUrl,
  } = useRemoteCanonicalVersion(exercise.slug)

  return (
    <tr key={exercise.slug}>
      <ExerciseNameCell exercise={exercise} />
      <td>
        <a href={remoteUrl}>
          <code>
            {remoteVersion || ((remoteDone && '<none>') || <LoadingIndicator />)}
          </code>
        </a>
      </td>
      <td>
        <a href={canonicalUrl}>
          <code>
            {canonicalVersion || ((canonicalDone && '<none>') || <LoadingIndicator />)}
          </code>
        </a>
      </td>
      <td>
        {canonicalDone && remoteDone
          ? <CheckOrCross value={testVersion(canonicalVersion, remoteVersion)} />
          : '⏳'}
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

function ForegoneSection({ exercises }: { exercises: ReadonlyArray<string> }) {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h3>Foregone</h3>
      <p>
        Exercises listed here have the <code>forgone</code> flag set to <code>true</code>.
        This means that the track has <em>explicitely</em> chosen to forego
        implementing this exercise.
      </p>

      <ul>
        {exercises.map((exercise) => {
          return <li key={exercise}>{exercise}</li>
        })}
      </ul>
    </section>
  )
}

function DeprecatedSection({ exercises }: { exercises: ReadonlyArray<ExerciseConfiguration> }) {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h3>Deprecated</h3>
      <p>
        Exercises listed here have the <code>deprecated</code> flag set to <code>true</code>.
        This means that the exercise has been implemented but will no longer be
        updated, as it's no longer considered part of the track.
      </p>

      <ul>
        {exercises.map((exercise) => {
          return <li key={exercise.slug}>{exercise.slug}</li>
        })}
      </ul>
    </section>
  )
}

function useValidExercises(foregone: ReadonlyArray<string>, exercises: ReadonlyArray<ExerciseConfiguration>) {
  if (!exercises) {
    return NO_EXCERCISES
  }

  return exercises.filter((exercise) => exercise.foregone !== true && foregone.indexOf(exercise.slug) === -1 && exercise.deprecated !== true)
}

function useInvalidExercises(foregone: ReadonlyArray<string>, exercises: ReadonlyArray<ExerciseConfiguration>) {
  if (!exercises) {
    return { foregone, deprecated: NO_EXCERCISES }
  }

  return exercises.reduce((result, exercise) => {
    if (exercise.foregone) {
      result.foregone.push(exercise.slug)
    }

    if (exercise.deprecated) {
      result.deprecated.push(exercise)
    }

    return result
  }, { foregone: [...foregone], deprecated: [] as  ExerciseConfiguration[]})
}

type Version = string | undefined
function testVersion(origin: Version, head: Version): boolean {
  if (head === undefined || origin === undefined) {
    // Version is fine if there is no canonical one
    return origin === undefined
  }

  // Version should be equal OR bigger than canonical
  return semver.gte(head, origin)
}
