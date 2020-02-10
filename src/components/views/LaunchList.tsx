import React from 'react'
import { useTrackAsideData } from '../../hooks/useTrackData'
import { LoadingIconWithPopover } from '../Popover'
import { useActionableState } from '../../hooks/useActionableOnly'
import { useToggleState } from '../../hooks/useToggleState'
import {
  useRawGithubFileExists,
  useRawGithubFileDoesNotContain,
  useRawGithubFileMatches,
} from '../../hooks/useRawGithubFile'

export interface LaunchListProps {
  trackId: TrackIdentifier
}

export function LaunchList({ trackId }: LaunchListProps): JSX.Element {
  const [activeDetailsKey, setActiveDetailsKey] = useToggleState<
    HTMLUListElement
  >(undefined, 'popover', 'popover-toggle')

  return (
    <article>
      <header>
        <p>
          During the initial stages of exercism v3, this view will list the
          generic list to launch. All tracks should attempt to follow all the
          steps and check all the items on this list, before launching the track
          in version three.
        </p>

        <p>
          To discuss the overall roadmap, go{' '}
          <a href="https://github.com/exercism/v3/issues/1">here</a>.
        </p>
      </header>

      <PreparationList
        trackId={trackId}
        activeDetailsKey={activeDetailsKey}
        setActiveDetailsKey={setActiveDetailsKey}
      />

      <ReadyForLaunch
        trackId={trackId}
        activeDetailsKey={activeDetailsKey}
        setActiveDetailsKey={setActiveDetailsKey}
      />
    </article>
  )
}

function ReadyForLaunch({
  trackId,
  activeDetailsKey,
  setActiveDetailsKey,
}: {
  trackId: TrackIdentifier
  activeDetailsKey: string | undefined
  setActiveDetailsKey(next?: string): void
}): JSX.Element {
  const [actionableOnly] = useActionableState()
  const { done, checklist, data } = useTrackAsideData(trackId)

  const configDone = done && checklist.hasOnlineEditor && checklist.hasVersion3

  return (
    <section>
      <h2>Readiness for Launch</h2>
      <ol className="list-group mt-4">
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            done &&
            configDone &&
            'not-actionable') ||
            ''}`}
        >
          <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/migrating-your-config-json-files.md">
            Updated <code>config.json</code>
          </a>
          <ul className="mt-2 d-flex">
            <li
              className={`badge badge-pill badge-light d-flex justify-content-between ${(actionableOnly &&
                done &&
                checklist.hasVersion3 &&
                'not-actionable') ||
                ''}`}
            >
              <span>
                Added <code>version</code> key
              </span>
              <LoadingIconWithPopover
                active={activeDetailsKey === 'config_version'}
                loading={!done}
                valid={!!checklist.hasVersion3}
                onToggle={(): void => {
                  setActiveDetailsKey('config_version')
                }}
              >
                <p className="mb-0">
                  The <code>version</code> key must be present and have a value
                  of <code>3</code> or higher.
                </p>
              </LoadingIconWithPopover>
            </li>
            <li
              className={`badge badge-pill badge-light ml-2 d-flex justify-content-between ${(actionableOnly &&
                done &&
                checklist.hasOnlineEditor &&
                'not-actionable') ||
                ''}`}
            >
              <span>Added online editor settings</span>
              <LoadingIconWithPopover
                active={activeDetailsKey === 'config_online_editor'}
                loading={!done}
                valid={!!checklist.hasOnlineEditor}
                onToggle={(): void => {
                  setActiveDetailsKey('config_online_editor')
                }}
              >
                <p className="mb-0">
                  The <code>online_editor</code> key must be present and at
                  least contain both <code>indent_style</code> and{' '}
                  <code>indent_style</code>.
                </p>
              </LoadingIconWithPopover>
            </li>
          </ul>
        </li>

        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            done &&
            checklist.exerciseConceptCount >= 20 &&
            'not-actionable') ||
            ''}`}
        >
          Implemented 20+ Concept Exercises
          <LoadingIconWithPopover
            active={activeDetailsKey === 'config_concept_exercises'}
            loading={!done}
            valid={checklist.exerciseConceptCount >= 20}
            onToggle={(): void => {
              setActiveDetailsKey('config_concept_exercises')
            }}
          >
            <p className="mb-0">
              There should be at least 20 concept exercises.
            </p>
          </LoadingIconWithPopover>
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            done &&
            checklist.exercisePracticeWithConceptCount ===
              checklist.exercisePracticeCount &&
            checklist.exercisePracticeCount > 0 &&
            'not-actionable') ||
            ''}`}
        >
          Added Concepts for all Practice Exercises
          <LoadingIconWithPopover
            active={activeDetailsKey === 'config_practice_exercises'}
            loading={!done}
            valid={
              checklist.exercisePracticeWithConceptCount ===
                checklist.exercisePracticeCount &&
              checklist.exercisePracticeCount > 0
            }
            onToggle={(): void => {
              setActiveDetailsKey('config_practice_exercises')
            }}
          >
            <p className="mb-0">
              Each practice exercise should have their{' '}
              <code>prerequisites</code> set. Also, there should be at least one
              such exercise.
            </p>
          </LoadingIconWithPopover>
        </li>

        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            done &&
            data.testRunner &&
            'not-actionable') ||
            ''}`}
        >
          Build Test Runner
          <LoadingIconWithPopover
            active={activeDetailsKey === 'project_test_runner'}
            loading={!done}
            valid={!!data.testRunner}
            onToggle={(): void => {
              setActiveDetailsKey('project_test_runner')
            }}
          >
            <p>
              This check passes if there is a <code>Dockerfile</code> file
              present in the <code>exercism/{trackId}-test-runner</code>{' '}
              repository.
            </p>

            <p className="mb-0">
              You can find more information about the <code>Dockerfile</code>{' '}
              file{' '}
              <a href="https://github.com/exercism/automated-tests/blob/master/docs/docker.md">
                here
              </a>
            </p>
          </LoadingIconWithPopover>
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            done &&
            data.representer &&
            'not-actionable') ||
            ''}`}
        >
          Build Representer
          <LoadingIconWithPopover
            active={activeDetailsKey === 'project_representer'}
            loading={!done}
            valid={!!data.testRunner}
            onToggle={(): void => {
              setActiveDetailsKey('project_representer')
            }}
          >
            <p>
              This check passes if there is a <code>Dockerfile</code> file
              present in the <code>exercism/{trackId}-representer</code>{' '}
              repository.
            </p>

            <p className="mb-0">
              You can find more information about the <code>Dockerfile</code>{' '}
              file{' '}
              <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">
                here
              </a>
              , or about{' '}
              <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">
                the automated analysis in general
              </a>
              , as well as the steps to{' '}
              <a href="https://github.com/exercism/automated-analysis/blob/master/docs/representers/getting-started.md">
                pass this test
              </a>
              .
            </p>
          </LoadingIconWithPopover>
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            done &&
            data.analyzer &&
            'not-actionable') ||
            ''}`}
        >
          (Optional) Build Analyzer
          <LoadingIconWithPopover
            active={activeDetailsKey === 'project_analyzer'}
            loading={!done}
            valid={!!data.testRunner}
            onToggle={(): void => {
              setActiveDetailsKey('project_analyzer')
            }}
          >
            <p>
              This check passes if there is a <code>Dockerfile</code> file
              present in the <code>exercism/{trackId}-analyzer</code>{' '}
              repository.
            </p>

            <p className="mb-0">
              You can find more information about the <code>Dockerfile</code>{' '}
              file{' '}
              <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">
                here
              </a>
              , or about{' '}
              <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">
                the automated analysis in general
              </a>
              , as well as the steps to{' '}
              <a href="https://github.com/exercism/automated-analysis/blob/master/docs/analyzers/getting-started.md">
                pass this test
              </a>
              .
            </p>
          </LoadingIconWithPopover>
        </li>
      </ol>
    </section>
  )
}

function PreparationList({
  trackId,
  activeDetailsKey,
  setActiveDetailsKey,
}: {
  trackId: TrackIdentifier
  activeDetailsKey: string | undefined
  setActiveDetailsKey(next?: string): void
}): JSX.Element {
  const [actionableOnly] = useActionableState()

  const asyncStructureCheck = useRawGithubFileExists({
    repository: 'v3',
    path: `languages/${trackId}/README.md`,
  })

  const asyncMaintainersFilled = useRawGithubFileDoesNotContain({
    repository: 'v3',
    path: `languages/${trackId}/maintainers.md`,
    refute: 'TODO',
  })

  const asyncCheckLinkToTrack = useRawGithubFileMatches({
    repository: 'v3',
    path: `README.md`,
    cacheKey: `link-to-${trackId}`,
    matcher: (content) => {
      const requirements = [
        `label%3Atrack%2F${trackId}`,
        'is%3Aissue',
        'is%3Aopen',
        'label%3Astatus%2Fhelp-wanted',
      ]

      const tester = new RegExp(
        `https://github.com/exercism/v3/issues?((?:.*)${requirements[0]}(?:.*))`,
        'i'
      )
      const match = content.match(tester)

      if (!match) {
        return false
      }

      return requirements.every(
        (requirement) => match[1].indexOf(requirement) !== -1
      )
    },
  })

  const asyncConceptExerciseGuideCheck = useRawGithubFileDoesNotContain({
    repository: 'v3',
    path: `languages/${trackId}/docs/implementing-a-concept-exercise.md`,
    refute: 'TODO',
  })

  const asyncConceptsReferenceCheck = useRawGithubFileDoesNotContain({
    repository: 'v3',
    path: `languages/${trackId}/reference/README.md`,
    refute: 'TODO',
  })

  return (
    <section>
      <h2>Preparation Status</h2>
      <ol className="list-group mt-4">
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            asyncStructureCheck.done &&
            asyncStructureCheck.result &&
            'not-actionable') ||
            ''}`}
        >
          <span>
            Convert existing files to{' '}
            <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/repository-structure.md">
              new repository structure
            </a>
          </span>
          <span>
            {asyncStructureCheck.done && (
              <a
                style={{ textDecoration: 'none' }}
                href={asyncStructureCheck.url}
              >
                <span role="img" aria-label="File url">
                  🔗
                </span>
              </a>
            )}
            <LoadingIconWithPopover
              active={activeDetailsKey === 'covert-structure'}
              loading={!asyncStructureCheck.done}
              valid={!!asyncStructureCheck.result}
              onToggle={(): void => {
                setActiveDetailsKey('covert-structure')
              }}
            >
              <p>
                This check passes if there is a <code>README.md</code> file
                present in the{' '}
                <code>
                  exercism/v3<code> repository at </code>languages/{trackId}/
                </code>
                .
              </p>

              <p className="mb-0">
                You can find more information about the converting existing
                files to the new repository structure{' '}
                <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/repository-structure.md">
                  here
                </a>
                .
              </p>
            </LoadingIconWithPopover>
          </span>
        </li>
        <li className="list-group-item d-flex">
          Have a kick-off discussion between track maintainers
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            asyncMaintainersFilled.done &&
            asyncMaintainersFilled.result &&
            'not-actionable') ||
            ''}`}
        >
          <span>
            Fill out the{' '}
            <code>
              /languages/{trackId}/
              <a
                href={`https://github.com/exercism/v3/blob/master/languages/${trackId}/maintainers.md`}
              >
                maintainers.md
              </a>
            </code>{' '}
            file.
          </span>

          <span>
            {asyncMaintainersFilled.done && (
              <a
                style={{ textDecoration: 'none' }}
                href={asyncMaintainersFilled.url}
              >
                <span role="img" aria-label="File url">
                  🔗
                </span>
              </a>
            )}
            <LoadingIconWithPopover
              active={activeDetailsKey === 'maintainers.md'}
              loading={!asyncMaintainersFilled.done}
              valid={!!asyncMaintainersFilled.result}
              onToggle={(): void => {
                setActiveDetailsKey('maintainers.md')
              }}
            >
              <p>
                This check passes if there is a <code>maintainers.md</code> file
                present in the{' '}
                <code>
                  exercism/v3<code> repository at </code>languages/{trackId}/
                </code>
                .
              </p>

              <p className="mb-0">
                All <code>TODO</code>s should be replaced with actual content.
                If there are no current maintainers or contributore, you may
                choose to replace the <code>TODO</code> with{' '}
                <em>No one yet.</em> and optionally add a link to the
                call-for-maintainers issue.
              </p>
            </LoadingIconWithPopover>
          </span>
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            asyncCheckLinkToTrack.done &&
            asyncCheckLinkToTrack.result &&
            'not-actionable') ||
            ''}`}
        >
          <span>
            Ensure there is a link to your track&apos;s GitHub issues on the{' '}
            <a href="https://github.com/exercism/v3/blob/master/README.md">
              main README.md
            </a>
          </span>

          <LoadingIconWithPopover
            active={activeDetailsKey === 'link-in-master-readme'}
            loading={!asyncCheckLinkToTrack.done}
            valid={!!asyncCheckLinkToTrack.result}
            onToggle={(): void => {
              setActiveDetailsKey('link-in-master-readme')
            }}
          >
            <p>
              This check passes if there is a link to find open issues that are
              marked for <code>help-wanted</code> with the label{' '}
              <code>track/{trackId}</code> present in the{' '}
              <code>exercism/v3/README.md</code> file.
            </p>

            <p className="mb-0">
              It specifically needs the track label, the correct status, issue
              and open flags.
            </p>
          </LoadingIconWithPopover>
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            asyncConceptExerciseGuideCheck.done &&
            asyncConceptExerciseGuideCheck.result &&
            'not-actionable') ||
            ''}`}
        >
          <span>
            <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/writing-a-concept-exercise-github-issue.md">
              Write a Concept Exercise implementation guide
            </a>
          </span>

          <span>
            {asyncConceptExerciseGuideCheck.done && (
              <a
                style={{ textDecoration: 'none' }}
                href={asyncConceptExerciseGuideCheck.url}
              >
                <span role="img" aria-label="File url">
                  🔗
                </span>
              </a>
            )}

            <LoadingIconWithPopover
              active={activeDetailsKey === 'concept-exercise-guide'}
              loading={!asyncConceptExerciseGuideCheck.done}
              valid={!!asyncConceptExerciseGuideCheck.result}
              onToggle={(): void => {
                setActiveDetailsKey('concept-exercise-guide')
              }}
            >
              <p>
                This check passes if there is a file called{' '}
                <code>implementing-a-concept-exercise.md</code> present at{' '}
                <code>languages/{trackId}/docs</code> in the{' '}
                <code>exercism/v3</code> repository.
              </p>

              <p className="alert alert-warning">
                This test also fails if there is a TODO present in the file.
              </p>

              <p className="mb-0">
                There is a{' '}
                <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/writing-a-concept-exercise-github-issue.md">
                  document
                </a>{' '}
                that has valuable resources when writing the guide for the
                track.
              </p>
            </LoadingIconWithPopover>
          </span>
        </li>
        <li
          className={`list-group-item d-flex justify-content-between ${(actionableOnly &&
            asyncConceptsReferenceCheck.done &&
            asyncConceptsReferenceCheck.result &&
            'not-actionable') ||
            ''}`}
        >
          <span>
            <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/determining-concepts.md">
              List out key Concepts for your language
            </a>
          </span>

          <span>
            {asyncConceptsReferenceCheck.done && (
              <a
                style={{ textDecoration: 'none' }}
                href={asyncConceptsReferenceCheck.url}
              >
                <span role="img" aria-label="File url">
                  🔗
                </span>
              </a>
            )}
            <LoadingIconWithPopover
              active={activeDetailsKey === 'determine-concepts'}
              loading={!asyncConceptsReferenceCheck.done}
              valid={!!asyncConceptsReferenceCheck.result}
              onToggle={(): void => {
                setActiveDetailsKey('determine-concepts')
              }}
            >
              <p>
                This check passes if there is a file called{' '}
                <code>README.md</code> present at{' '}
                <code>languages/{trackId}/reference</code> in the{' '}
                <code>exercism/v3</code> repository.
              </p>

              <p>
                Read more about determining concepts{' '}
                <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/determining-concepts.md">
                  here
                </a>
                .
              </p>

              <p className="alert alert-warning">
                <strong>Note:</strong> this test will fail if there is a TODO in
                the file.
              </p>

              <p className="mb-0">
                There is currently no <em>official</em> place to list these
                concepts, but since various tracks have already chosen to put
                them at this specific location, this automated check only works
                for that specific location.
              </p>
            </LoadingIconWithPopover>
          </span>
        </li>
        <li className="list-group-item d-flex">
          <span>
            <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/writing-a-concept-exercise-github-issue.md">
              Add GitHub issues for 20 Concept Exercises
            </a>
          </span>
        </li>
      </ol>
    </section>
  )
}
