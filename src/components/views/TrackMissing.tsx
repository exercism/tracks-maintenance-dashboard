import React, { useMemo, useCallback } from 'react'
import { useRemoteConfig } from '../../hooks/useRemoteConfig'
import { useRemoteCanonicalList } from '../../hooks/useRemoteCanonicalList'
import { LoadingIndicator } from '../LoadingIndicator'

const NO_EXERCISES = Object.freeze([])

export function TrackMissing({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
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

    const foregone = track.config!.foregone || []

    // Create lookup table for known exericses
    const lookup = track.config!.exercises.reduce(
      (lookup, item) => {
        lookup[item.slug] = item
        return lookup
      },
      {} as Record<string, ExerciseConfiguration>
    )

    // Only keep exercises that can't be looked up
    return canonical.list!.filter((item) => lookup[item] === undefined && foregone.indexOf(item) === -1)
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
