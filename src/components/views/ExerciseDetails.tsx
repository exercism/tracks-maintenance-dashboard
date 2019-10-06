import React from 'react'
import { useExercise } from '../../hooks/useUrlState'
import { useRemoteConfig } from '../../hooks/useRemoteConfig'

interface ExerciseDetailsProps {
  trackId: TrackIdentifier;
  onHide(): void
}

export function ExerciseDetails({ trackId, onHide }: ExerciseDetailsProps): JSX.Element {
  const [exercise] = useExercise()
  const { done, config } = useRemoteConfig(trackId)

  const exerciseData = config && config.exercises.find((e) => e.slug === exercise) || undefined
  return (
    <section>
      <header className="mb-4">
        <h2>{exercise}</h2>
        <p></p>
      </header>

      <button type="button" className="btn btn-danger btn-outline btn-sm mb-4" onClick={onHide}>Hide</button>


    </section>
  )
}
