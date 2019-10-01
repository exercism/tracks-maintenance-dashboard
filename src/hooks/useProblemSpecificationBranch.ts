import { createContext, useContext } from 'react'

const ProblemSpecificationBranch = createContext<Branch>('master')

export const ProvideBranch = ProblemSpecificationBranch.Provider

type NormalisedBranch = string

export function useProblemSpecificationBranch(): NormalisedBranch {
  const value = useContext(ProblemSpecificationBranch)

  switch (value) {
    case 'track-anatomy': {
      return 'trackanatomy'
    }
    default: {
      return value
    }
  }
}
