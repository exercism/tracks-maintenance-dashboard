import React from 'react'
import { useExercise } from '../../hooks/useUrlState'
import { ExerciseIcon } from '../ExerciseIcon'
import { ExerciseAside } from '../ExerciseAside'

interface ExerciseDetailsProps {
  trackId: TrackIdentifier
  onHide(): void
}

export function ExerciseDetails({
  trackId,
  onHide,
}: ExerciseDetailsProps): JSX.Element {
  const [exercise] = useExercise()

  return (
    <>
      <button
        type="button"
        className="btn btn-danger btn-outline btn-sm mb-4"
        onClick={onHide}
      >
        Hide
      </button>
      <section className="mt-2 d-flex">
        <header
          className="mb-4 d-flex"
          style={{ maxWidth: '25rem', width: '100%' }}>
          <ExerciseIcon className="mr-4" exercise={exercise!} size={150} />
          <div className="">
            <h2>{exercise}</h2>
            <p></p>
          </div>
        </header>

        <ExerciseAside exercise={exercise!} trackId={trackId} />
      </section>
    </>
  )
}
