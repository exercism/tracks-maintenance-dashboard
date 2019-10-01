import React from 'react'

export function LoadingIndicator({
  children,
}: {
  children?: React.ReactNode
}): JSX.Element {
  return (
    <div>
      <div
        className="spinner-border text-secondary spinner-border-sm mr-2"
        role="status"
      >
        <span className="sr-only">Loading Indicator</span>
      </div>
      {children}
    </div>
  )
}
