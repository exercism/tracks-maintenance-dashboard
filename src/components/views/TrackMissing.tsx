import React, { useMemo, useCallback } from 'react'
import { useRemoteConfig } from '../../hooks/useRemoteConfig'
import { useRemoteCanonicalList } from '../../hooks/useRemoteCanonicalList'
import { LoadingIndicator } from '../LoadingIndicator'
import { useProblemSpecificationBranch } from '../../hooks/useProblemSpecificationBranch'
import { ExerciseIcon } from '../ExerciseIcon'

const NO_EXERCISES = Object.freeze([])

export function TrackMissing({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const track = useRemoteConfig(trackId)
  const canonical = useRemoteCanonicalList()
  const branch = useProblemSpecificationBranch()

  const isShowable =
    track.done && track.config && canonical.done && canonical.data

  const unimplementedExercises = useMemo(() => {
    if (!isShowable) {
      return NO_EXERCISES
    }

    if (!track.config!.exercises) {
      return canonical.list! || NO_EXERCISES
    }

    const foregone = track.config!.foregone || []

    // Create lookup table for known exericses so that they can be removed from the un-implementedlist
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
        <h2 id="unimplemented">Unimplemented exercises</h2>
        <p>
          This is the list of exercises as found in the <ProblemSpecLink>problem specifications</ProblemSpecLink> but not
          implemented in the <code>{trackId}</code> track. As maintainer, if you want an exercise to <em>never</em> be implemented, add its <code>slug</code> to
          the <code>foregone</code> key in <code>config.json</code>. In order to add or port an exercise to the <code>{trackId}</code> track, see
          the <a href={`https://github.com/exercism/${trackId}/blob/master/CONTRIBUTING.md`}>CONTRIBUTING guidelines</a>.
        </p>
      </header>

      {!isShowable ? (
        <div className="alert alert-info">
          <LoadingIndicator>Loading tree at <code>{branch}</code> branch. Filtering those with a <code>.deprecated</code> entry.</LoadingIndicator>
        </div>
      ) : (
        <MissingExercisesList missing={unimplementedExercises} data={canonical.data!} />
      )}
    </section>
  )
}

function ProblemSpecLink({ children }: { children: React.ReactNode }) {
  return (
    <a href="https://github.com/exercism/problem-specifications/tree/master/exercises">
      {children}
    </a>
  )
}

function MissingExercisesList({
  missing,
  data
}: {
  missing: ReadonlyArray<ExerciseIdentifier>;
  data: NonNullable<ReturnType<typeof useRemoteCanonicalList>['data']>
}) {
  const renderExercise = useCallback(
    (exercise: ExerciseIdentifier) => {

      // Hide deprecated exercises
      if (data[exercise].deprecated) {
        return null
      }

      const canonicalUrl = `https://github.com/exercism/problem-specifications/tree/master/exercises/${exercise}`
      return (
        <li key={exercise} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
          <a href={canonicalUrl} className="d-flex align-items-center">
            <figure className="media mr-2 mb-0">
              <ExerciseIcon exercise={exercise} size={56}/>
              <ExerciseIcon exercise={exercise} size={56} hover={true} />
            </figure>
            <span className="media-body">{exercise}</span>
          </a>
        </li>
      )
    },
    [data]
  )

  if (!missing || missing.length === 0) {
    return <div>No Unimplemented exercises found</div>
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
      <ol className="exercises-list list-unstyled row mt-4 mb-2">{
        missing.map(renderExercise)
      }</ol>
    </>
  )
}
