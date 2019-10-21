import React from 'react'

export function CheckOrCross({ value }: { value: boolean }): JSX.Element {
  return (
    <span role="img" aria-label={`Represents ${value}`}>
      {value ? '✔' : '❌'}
    </span>
  )
}
