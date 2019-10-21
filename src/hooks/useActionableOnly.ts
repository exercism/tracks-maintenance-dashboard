import {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
} from 'react'

type ActionableState = [boolean, Dispatch<SetStateAction<boolean>>]

const ActionableContext = createContext<ActionableState>([
  false,
  (): void => {},
])
export const ProvideActionable = ActionableContext.Provider

export function useProvideActionableState(): ActionableState {
  return useState<boolean>(false)
}

export function useActionableState(): ActionableState {
  return useContext(ActionableContext)
}
