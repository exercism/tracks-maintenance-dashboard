import React, { useState, useEffect } from 'react'
import { TrackIdentifier } from '../../types'

export function ExerciseTree({
  trackId,
}: {
  trackId: TrackIdentifier
}): JSX.Element {
  const [library, setLibrary] = useState()

  useEffect(() => {
    let active = true

    const element = document.getElementById('d3-script')

    if (element) {
      const currentD3 = (window as any).d3

      if (currentD3) {
        setLibrary(currentD3)
        return
      }

      element.onload = (): void => {
        active && setLibrary((window as any).d3)
      }

      return (): void => {
        active = false
      }
    }

    const newElement = document.createElement('script')
    newElement.onload = (): void => {
      active && setLibrary((window as any).d3)
    }
    newElement.src =
      'https://cdnjs.cloudflare.com/ajax/libs/d3/5.15.0/d3.min.js'
    newElement.id = 'd3-script'

    document.body.appendChild(newElement)
    return (): void => {
      active = false
    }
  }, [])

  if (!library) {
    return <span>loading...</span>
  }

  return <p>Coming soon!</p>
}
