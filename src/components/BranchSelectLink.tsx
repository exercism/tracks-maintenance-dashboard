import React, { useCallback } from 'react'
import { useBranch, useUrl } from '../hooks/useUrlState'
import type { Branch } from '../types'

interface BranchSelectLinkProps {
  branch: Branch
  children: React.ReactNode
}
export function BranchSelectLink({
  branch,
  children,
}: BranchSelectLinkProps): JSX.Element {
  const [actualBranch, onChangeBranch] = useBranch()
  const { href } = useUrl({ branch })

  const doChangeBranch = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault()
      onChangeBranch(branch)
    },
    [branch, onChangeBranch]
  )

  const active = branch === actualBranch

  return (
    <a
      className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
      onClick={doChangeBranch}
      href={href}
    >
      {children}
    </a>
  )
}
