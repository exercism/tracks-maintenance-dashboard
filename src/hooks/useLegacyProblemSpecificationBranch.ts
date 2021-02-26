import { createContext, useContext } from 'react'
import type { Branch } from '../types'

export type NormalisedBranch = Exclude<Branch, 'track-anatomy'> | 'trackanatomy'

const DEFAULT_BRANCH = 'main' as const
const ProblemSpecificationBranch = createContext<Branch | undefined>(
  DEFAULT_BRANCH
)

export const ProvideBranch = ProblemSpecificationBranch.Provider

export function useProblemSpecificationBranch(): NormalisedBranch {
  const value = useContext(ProblemSpecificationBranch)

  switch (value) {
    case 'track-anatomy': {
      return 'trackanatomy'
    }
    default: {
      return value || DEFAULT_BRANCH
    }
  }
}
