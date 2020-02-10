import React, { useCallback } from 'react'

import {
  ProvideActionable,
  useProvideActionableState,
} from '../hooks/useActionableOnly'
import { useBranch } from '../hooks/useUrlState'

import { BranchSelectLink } from './BranchSelectLink'
import { CurrentTrackTool } from './LegacyTrackTool'
import { NextTrackTool } from './NextTrackTool'

export interface TrackToolProps {
  trackId: TrackIdentifier
  onUnselect: () => void
}

const DEFAULT_BRANCH: Branch = 'v3'

export function TrackTool({
  trackId,
  onUnselect,
}: TrackToolProps): JSX.Element {
  return (
    <ProvideActionable value={useProvideActionableState()}>
      <section>
        <div className="d-flex justify-content-start flex-row align-items-center w-50">
          <UnselectTrackButton onClick={onUnselect} />
          <ToggleV3Button />
        </div>

        <BranchView trackId={trackId} />
      </section>
    </ProvideActionable>
  )
}

function BranchView({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const [selectedBranch] = useBranch()
  const actualBranch = selectedBranch || DEFAULT_BRANCH

  switch (actualBranch) {
    case 'v3': {
      return <NextTrackTool trackId={trackId} />
    }
    default: {
      return <CurrentTrackTool trackId={trackId} />
    }
  }
}

function ToggleV3Button(): JSX.Element {
  return (
    <div className="btn-group">
      <BranchSelectLink branch="master">Current</BranchSelectLink>
      <BranchSelectLink branch="v3">V3</BranchSelectLink>
    </div>
  )
}

function UnselectTrackButton({
  onClick,
}: {
  onClick: TrackToolProps['onUnselect']
}): JSX.Element {
  const doClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onClick()
    },
    [onClick]
  )

  return (
    <a
      href="/"
      className="btn btn-sm btn-outline-danger mr-3"
      onClick={doClick}
    >
      Select different track
    </a>
  )
}
