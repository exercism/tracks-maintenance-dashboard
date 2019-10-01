import React, { useCallback, useState, useMemo } from 'react'
import { useTrackData } from './hooks/useTrackData'
import { RemoteConfig } from './net/RemoteConfig'
import { useRemoteConfig } from './hooks/useRemoteConfig'
import { useRemoteVersion } from './hooks/useRemoteVersion'
import { useRemoteCanonicalVersion } from './hooks/useRemoteCanonicalVersion'
import { useRemoteCanonicalList } from './hooks/useRemoteCanonicalList'
import { LoadingIndicator } from './LoadingIndicator'

export interface TrackToolProps {
  trackId: TrackIdentifier
  showUnimplemented: boolean
  onUnselect: () => void
  onToggleUnimplemented: () => void
}

export function TrackTool({
  trackId,
  showUnimplemented,
  onUnselect,
  onToggleUnimplemented,
}: TrackToolProps): JSX.Element {
  return (
    <section>
      <button
        className="btn btn-sm btn-outline-danger mb-3 mr-3"
        onClick={onUnselect}
      >
        Select different track
      </button>

      <button
        className={`btn btn-sm btn-secondary ${showUnimplemented &&
          'active'} mb-3`}
        aria-pressed={showUnimplemented ? 'true' : 'false'}
        onClick={onToggleUnimplemented}
      >
        Unimplemented
      </button>

      {showUnimplemented ? (
        <TrackMissing trackId={trackId} />
      ) : (
        <TrackVersions trackId={trackId} />
      )}
    </section>
  )
}

function TrackVersions({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const trackData = useTrackData(trackId)

  return (
    <section>
      <header>
        <h1>{trackData.name} Exercise Versions</h1>
      </header>

      <RemoteConfig trackId={trackId}>
        {({ config }) => (
          <ExerciseTable trackId={trackId} exercises={config.exercises} />
        )}
      </RemoteConfig>
    </section>
  )
}

const NO_EXERCISES = Object.freeze([])

function TrackMissing({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const track = useRemoteConfig(trackId)
  const canonical = useRemoteCanonicalList()

  const isShowable =
    track.done && track.config && canonical.done && canonical.list

  const unimplementedExercises = useMemo(() => {
    if (!isShowable) {
      return NO_EXERCISES
    }

    if (!track.config!.exercises) {
      return canonical.list! || NO_EXERCISES
    }

    // Create lookup table for known exericses
    const lookup = track.config!.exercises.reduce(
      (lookup, item) => {
        lookup[item.slug] = item
        return lookup
      },
      {} as Record<string, ExerciseConfiguration>
    )

    // Only keep exercises that can't be looked up
    return canonical.list!.filter((item) => lookup[item] === undefined)
  }, [isShowable, track, canonical])

  return (
    <section>
      <header>
        <h2>Unimplemented exercises</h2>
      </header>

      {!isShowable ? (
        <LoadingIndicator />
      ) : (
        <ExerciseList exercises={unimplementedExercises} />
      )}
    </section>
  )
}

function ExerciseList({
  exercises,
}: {
  exercises: ReadonlyArray<ExerciseConfiguration['slug']>
}) {
  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration['slug']) => {
      const canonicalUrl = `https://github.com/exercism/problem-specifications/tree/master/exercises/${exercise}`
      return (
        <li key={exercise}>
          <a href={canonicalUrl}>{exercise}</a>
        </li>
      )
    },
    []
  )

  if (!exercises) {
    return <div>No exercises found</div>
  }

  return <ol className="list">{exercises.map(renderExercise)}</ol>
}

function ExerciseTable({
  trackId,
  exercises,
}: {
  trackId: TrackIdentifier
  exercises: ReadonlyArray<ExerciseConfiguration>
}) {
  const track = useTrackData(trackId)

  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration) => {
      if (exercise.deprecated) {
        return null
      }

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

  if (!exercises) {
    return <div>No exercises found</div>
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Exercise</th>
          <th>{track.name} version</th>
          <th>Canonical data version</th>
          <th />
        </tr>
      </thead>
      <tbody>{exercises.map(renderExercise)}</tbody>
    </table>
  )
}

function Spinner() {
  return (
    <div
      className="spinner-border text-secondary spinner-border-sm mr-2"
      role="status"
    >
      <span className="sr-only">Loading Indicator</span>
    </div>
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
      {exercise.core ? <th>{exercise.slug}</th> : <td>{exercise.slug}</td>}
      <td>
        <a href={remoteUrl}>
          <code>
            {remoteVersion || ((remoteDone && '<none>') || <Spinner />)}
          </code>
        </a>
      </td>
      <td>
        <a href={canonicalUrl}>
          <code>
            {canonicalVersion || ((canonicalDone && '<none>') || <Spinner />)}
          </code>
        </a>
      </td>
      <td>
        {canonicalDone && remoteDone
          ? canonicalVersion === remoteVersion
            ? '✔'
            : '❌'
          : '⏳'}
      </td>
    </tr>
  )
}
