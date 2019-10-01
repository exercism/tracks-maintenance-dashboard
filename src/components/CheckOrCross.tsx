
import React from 'react'

export function CheckOrCross({ value }: { value: boolean }) {
  return <span aria-label={`Represents ${value}`}>{value ? '✔' : '❌'}</span>
}