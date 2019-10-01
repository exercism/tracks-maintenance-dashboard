import { useMemo } from 'react'

export function useCoreExercises({ exercises, foregone }: TrackConfiguration) {
  return useMemo(
    () =>
      exercises.filter(
        exercise =>
          exercise.core &&
          !exercise.deprecated &&
          (foregone || []).indexOf(exercise.slug) === -1
      ),
    [exercises, foregone]
  )
}
