import React, { useMemo, useCallback } from 'react'
import { useRemoteConfig } from '../../hooks/useRemoteConfig'
import { useRemoteCanonicalList } from '../../hooks/useRemoteCanonicalList'
import { LoadingIndicator } from '../LoadingIndicator'
import { useProblemSpecificationBranch } from '../../hooks/useProblemSpecificationBranch'

const NO_EXERCISES = Object.freeze([])

export function TrackMissing({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const track = useRemoteConfig(trackId)
  const canonical = useRemoteCanonicalList()
  const branch = useProblemSpecificationBranch()

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
        <LoadingIndicator>Loading tree of <code>exercism/problem-specifications/{branch}</code>. Filtering those with <code>.deprecated</code>.</LoadingIndicator>
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
        <li key={exercise} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
          <a href={canonicalUrl} className="d-flex align-items-center">
            <figure className="media mr-2 mb-0">
              <img className="hover"
                src={`https://assets.exercism.io/exercises/${exercise}-white.png`}
                alt={`${exercise} logo`}
                style={{
                  background: '#009cab',
                  border: '1px solid rgba(0,156,171,0.5)',
                  padding: 6,
                  width: 56,
                  borderRadius: 2,
                  height: 56
                }}
                />

              <img className="normal"
                src={`https://assets.exercism.io/exercises/${exercise}-turquoise.png`}
                alt={`${exercise} logo hover state`}
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,156,171,0.5)',
                  padding: 6,
                  borderRadius: 2,
                  width: 56,
                  height: 56
                }}
                />
            </figure>
            <span className="media-body">{exercise}</span>
          </a>
        </li>
      )
    },
    []
  )

  if (!exercises) {
    return <div>No exercises found</div>
  }

  return (
    <>
      <style>{`
        .exercises-list > li > a {
          color: #333;
        }

        .exercises-list > li > a figure {
          position: relative;
          width: 56px;
          height: 56px;
          overflow: hidden;
        }

        .exercises-list > li > a img {
          display: inline-block;
        }

        .exercises-list > li > a img.hover {
          will-change: opacity;
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: opacity 100ms ease;
        }

        .exercises-list > li > a:hover img.hover {
          opacity: 1;
        }
      `}</style>
      <ol className="exercises-list list-unstyled row mt-4 mb-2">{exercises.map(renderExercise)}</ol>
    </>
  )
}
