import React, { useCallback } from 'react'
import semver from 'semver'

import { RemoteConfig } from '../../net/LegacyRemoteConfig'
import { useTrackData } from '../../hooks/useLegacyTrackData'
import { useRemoteVersion } from '../../hooks/useLegacyRemoteVersion'
import { useToggleState } from '../../hooks/useToggleState'
import { useRemoteCanonicalVersion } from '../../hooks/useLegacyRemoteCanonicalVersion'

import { CheckOrCross } from '../CheckOrCross'
import { LoadingIndicator } from '../LoadingIndicator'
import { ContainedPopover } from '../Popover'
import { ExerciseIcon } from '../ExerciseIcon'
import { useKeyPressListener } from '../../hooks/useKeyListener'
import { useActionableState } from '../../hooks/useActionableOnly'

type ExerciseConfiguration = Legacy.ExerciseConfiguration
type TrackConfiguration = Legacy.TrackConfiguration

const TRACKS_JSON_GITHUB_URL =
  'https://github.com/exercism/tracks-maintenance-dashboard/blob/master/src/data/tracks.json'

interface TrackVersionsProps {
  trackId: TrackIdentifier
  onShowExercise(exercise: ExerciseIdentifier): void
}

export function TrackVersions({
  trackId,
  onShowExercise,
}: TrackVersionsProps): JSX.Element {
  return (
    <section>
      <header className="mb-4">
        <h2 id="#versions">Exercise Versions</h2>
      </header>

      <RemoteConfig trackId={trackId}>
        {({ config }): JSX.Element => (
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

const NO_EXERCISES: ReadonlyArray<ExerciseConfiguration> = []
const NO_FOREGONE_EXERCISES: ReadonlyArray<string> = []

interface ExerciseTableProps {
  trackId: TrackIdentifier
  config: TrackConfiguration
  onShowExercise(exercise: ExerciseIdentifier): void
}

function ExerciseTable({
  trackId,
  config: { exercises, foregone },
  onShowExercise,
}: ExerciseTableProps): JSX.Element {
  const [details, doSetDetails] = useToggleState(
    undefined,
    'popover',
    'popover-toggle'
  )

  useKeyPressListener(['Esc', 'Escape'], doSetDetails)

  const track = useTrackData(trackId)
  const validExercises = useValidExercises(
    foregone || NO_FOREGONE_EXERCISES,
    exercises
  )
  const { deprecated } = useInvalidExercises(
    foregone || NO_FOREGONE_EXERCISES,
    exercises
  )

  const doShowExercise = useCallback(
    (exercise: ExerciseIdentifier) => {
      onShowExercise(exercise)
    },
    [onShowExercise]
  )

  const renderExercise = useCallback(
    (exercise: ExerciseConfiguration) => {
      const detailsActive = details === exercise.slug
      return (
        <ExerciseRow
          exercise={exercise}
          key={exercise.slug}
          trackId={trackId}
          detailsActive={detailsActive}
          onToggleDetails={doSetDetails}
          onShowExercise={doShowExercise}
        />
      )
    },
    [details, doSetDetails, doShowExercise, trackId]
  )

  if (!exercises || exercises.length === 0) {
    return <div>No exercises found</div>
  }

  return (
    <>
      <table
        className="table table-responsive"
        style={{ paddingBottom: '4.5rem' }}
      >
        <thead>
          <tr>
            <th style={{ minWidth: 256 }}>Exercise</th>
            <th style={{ minWidth: 200 }}>
              {track.name} version <VersionInfoButton trackData={track} />
            </th>
            <th style={{ minWidth: 200 }}>Canonical data version</th>
            <th style={{ minWidth: 64 }} />
          </tr>
        </thead>
        <tbody>{validExercises.map(renderExercise)}</tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>
              <p className="text-muted">
                Showing{' '}
                <span className="badge badge-pill badge-primary">
                  {validExercises.length}
                </span>{' '}
                out of{' '}
                <span className="badge badge-pill badge-secondary">
                  {exercises.length}
                </span>{' '}
                exercises. Deprecated and foregone exercises are hidden.
              </p>
              <p className="text-muted mb-0">
                If exercises are not matching the canonical version for a
                different reason than being out of date, for example because its
                canonical updates don&apos;t make sense for this track, open a PR to
                change <a href={TRACKS_JSON_GITHUB_URL}>this file</a> and add
                each exercises&apos; <code>slug</code> to{' '}
                <code>unactionable -&gt; versioning</code>.
              </p>
            </td>
          </tr>
        </tfoot>
      </table>

      <ForegoneSection exercises={foregone || NO_FOREGONE_EXERCISES} />
      <DeprecatedSection exercises={deprecated} />
    </>
  )
}

function VersionInfoButton({
  trackData,
}: {
  trackData: TrackData
}): JSX.Element {
  const { versioning } = trackData

  const [active, setActive] = useToggleState(
    undefined,
    'popover',
    'popover-toggle'
  )
  const doToggle = useCallback(() => setActive('version.help'), [setActive])

  return (
    <ContainedPopover
      align="center"
      active={active === 'version.help'}
      onToggle={doToggle}
      toggle={
        <span aria-label="more information" role="img">
          ℹ️
        </span>
      }
    >
      <p>
        The version information is fetched from the {trackData.name} repository,
        at <code>{versioning || '<unknown>'}</code>.
      </p>
      <p className="mb-0">
        The casing of the <code>{'{placeholder}'}</code> is matched.
      </p>
    </ContainedPopover>
  )
}

interface ExerciseRowProps {
  exercise: ExerciseConfiguration
  trackId: TrackIdentifier
  detailsActive: boolean
  onToggleDetails(key: string): void
  onShowExercise(exercise: ExerciseIdentifier): void
}

function ExerciseRow({
  exercise,
  trackId,
  detailsActive,
  onToggleDetails,
  onShowExercise,
}: ExerciseRowProps): JSX.Element | null {

  const { unactionable } = useTrackData(trackId)

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

  const doToggle = useCallback(() => onToggleDetails(exercise.slug), [
    exercise,
    onToggleDetails,
  ])
  const doShowExerciseDetails = useCallback(
    () => onShowExercise(exercise.slug),
    [exercise, onShowExercise]
  )

  const [actionableOnly] = useActionableState()
  const markedAsWontAction =
    (unactionable &&
      unactionable.versioning &&
      unactionable.versioning.indexOf(exercise.slug) !== -1) ||
    false

  if (actionableOnly) {
    // Don't show whilst loading
    if (!remoteDone || !canonicalDone) {
      return null
    }

    // Hide if up-to-date
    const valid = testVersion(canonicalVersion, remoteVersion)
    if (valid) {
      return null
    }

    // Marked as unactionable
    if (markedAsWontAction) {
      return null
    }
  }

  return (
    <tr key={exercise.slug}>
      <ExerciseNameCell
        exercise={exercise}
        onShowDetails={doShowExerciseDetails}
      />
      <VersionCell url={remoteUrl} version={remoteVersion} done={remoteDone} />
      <VersionCell
        url={canonicalUrl}
        version={canonicalVersion}
        done={canonicalDone}
      />
      <DetailsCell
        active={detailsActive}
        onToggle={doToggle}
        remoteVersion={remoteVersion}
        canonicalVersion={canonicalVersion}
        done={remoteDone && canonicalDone}
        wontFix={markedAsWontAction}
      />
    </tr>
  )
}

interface ExerciseNameCellProps {
  exercise: ExerciseConfiguration
  onShowDetails(): void
}

function ExerciseNameCell({
  exercise,
  onShowDetails,
}: ExerciseNameCellProps): JSX.Element {
  const Cell = exercise.core ? 'th' : 'td'

  return (
    <Cell onClick={onShowDetails}>
      <ExerciseIcon exercise={exercise.slug} size={24} />
      <span className="ml-2">{exercise.slug}</span>
    </Cell>
  )
}

interface VersionCellProps {
  url: string | undefined
  version: string | undefined
  done: boolean
}

function VersionCell({ url, version, done }: VersionCellProps): JSX.Element {
  return (
    <td>
      <a href={url}>
        <code>{version || ((done && '<none>') || <LoadingIndicator />)}</code>
      </a>
    </td>
  )
}

interface DetailsCellProps {
  active: boolean
  onToggle(): void
  remoteVersion: Version
  canonicalVersion: Version
  done: boolean
  wontFix: boolean
}

function DetailsCell({
  active,
  onToggle,
  remoteVersion,
  canonicalVersion,
  done,
  wontFix,
}: DetailsCellProps) {
  if (!done) {
    return (
      <td>
        <button type="button" style={{ background: 0, border: 0 }}>
          <span role="img" aria-label="Fetching versions...">
            ⏳
          </span>
        </button>
      </td>
    )
  }

  if (wontFix) {
    return (
      <td>
        <ContainedPopover
          active={active}
          onToggle={onToggle}
          toggle={<WontFixIcon />}
          align="right"
        >
          <WontFixExplanation />
        </ContainedPopover>
      </td>
    )
  }

  const valid = testVersion(canonicalVersion, remoteVersion)

  return (
    <td>
      <ContainedPopover
        active={active}
        onToggle={onToggle}
        toggle={<CheckOrCross value={valid} />}
        align="right"
      >
        {valid ? <VersionsMatch /> : <VersionsDontMatch />}
      </ContainedPopover>
    </td>
  )
}

function VersionsMatch(): JSX.Element {
  return (
    <p className="mb-0">
      The exercise is up-to-date with the latest canonical data.
    </p>
  )
}

function VersionsDontMatch(): JSX.Element {
  return (
    <p className="mb-0">
      The version in the <code>exercism/problem-specifications</code> repository
      is higher than the local version. In order to resolve this, update the
      exercise by re-generating the <code>README.md</code> and updating the
      exercise tests.
    </p>
  )
}

function WontFixIcon(): JSX.Element {
  return (
    <span role="img" aria-label="Marked as unactionable">
      🚫
    </span>
  )
}

function WontFixExplanation(): JSX.Element {
  return (
    <p className="mb-0">
      This exercise has been added to the <code>unactionable -&gt; versioning</code>{' '}
      list in <a href={TRACKS_JSON_GITHUB_URL}>this file</a> , which means it is
      marked to be never in sync with the canonical data. A common reason is
      that the canonical updates don&apos;t make sense for this track and therefore
      are not going to be applied.
    </p>
  )
}

function ForegoneSection({ exercises }: { exercises: ReadonlyArray<string> }): JSX.Element | null {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h3>Foregone</h3>
      <p>
        Exercises listed here have the <code>foregone</code> flag set to{' '}
        <code>true</code>. This means that the track has <em>explicitly</em>{' '}
        chosen to forego implementing this exercise.
      </p>

      <ul>
        {exercises.map((exercise) => {
          return <li key={exercise}>{exercise}</li>
        })}
      </ul>
    </section>
  )
}

function DeprecatedSection({
  exercises,
}: {
  exercises: ReadonlyArray<ExerciseConfiguration>
}): JSX.Element | null {
  if (!exercises || exercises.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h3>Deprecated</h3>
      <p>
        Exercises listed here have the <code>deprecated</code> flag set to{' '}
        <code>true</code>. This means that the exercise has been implemented but
        will no longer be updated, as it&apos;s no longer considered part of the
        track.
      </p>

      <ul>
        {exercises.map((exercise) => {
          return <li key={exercise.slug}>{exercise.slug}</li>
        })}
      </ul>
    </section>
  )
}

function useValidExercises(
  foregone: readonly string[],
  exercises: readonly ExerciseConfiguration[]
): readonly ExerciseConfiguration[] {
  if (!exercises) {
    return NO_EXERCISES
  }

  return exercises.filter(
    (exercise) =>
      exercise.foregone !== true &&
      foregone.indexOf(exercise.slug) === -1 &&
      exercise.deprecated !== true
  )
}

function useInvalidExercises(
  foregone: readonly string[],
  exercises: readonly ExerciseConfiguration[]
): {
  foregone: readonly string[]
  deprecated: readonly ExerciseConfiguration[]
} {
  if (!exercises) {
    return { foregone, deprecated: NO_EXERCISES }
  }

  return exercises.reduce(
    (result, exercise) => {
      if (exercise.foregone) {
        result.foregone.push(exercise.slug)
      }

      if (exercise.deprecated) {
        result.deprecated.push(exercise)
      }

      return result
    },
    { foregone: [...foregone], deprecated: [] as ExerciseConfiguration[] }
  )
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
