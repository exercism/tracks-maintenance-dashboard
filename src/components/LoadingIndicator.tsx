import React from 'react'

export function LoadingIndicator({
  children,
}: {
  children?: React.ReactNode
}): JSX.Element {
  if (children) {
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

  return (
    <div
      className="spinner-border text-secondary spinner-border-sm"
      role="status"
    >
      <span className="sr-only">Loading Indicator</span>
    </div>
  )
}
