import React from 'react'

export function ExerciseIcon({
  exercise,
  size = 24,
  hover,
}: {
  exercise: string
  size?: number
  hover?: boolean
}): JSX.Element {
  return (
    <img
      className={hover === true ? 'hover' : 'normal'}
      src={`https://assets.exercism.io/exercises/${exercise}-${
        hover === true ? 'white' : 'turquoise'
      }.png`}
      alt={`${exercise} logo`}
      style={{
        background: hover === true ? '#009cab' : '#fff',
        border: '1px solid rgba(0,156,171,0.5)',
        padding: size < 48 ? 4 : 6,
        borderRadius: 2,
        width: size,
        height: size,
        maxWidth: size,
        maxHeight: size,
        overflow: 'hidden',
        verticalAlign: 'text-top',
        display: 'inline-block',
      }}
    />
  )
}
