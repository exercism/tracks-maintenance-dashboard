import React from 'react'

export function CheckOrCross({ value }: { value: boolean }) {
  return (
    <span role="img" aria-label={`Represents ${value}`}>
      {value ? '✔' : '❌'}
    </span>
  )
}
