import React, { useCallback, useRef, useEffect } from 'react'
import { LoadingIndicator } from './LoadingIndicator'
import { CheckOrCross } from './CheckOrCross'

interface PopoverProps {
  align?: 'center' | 'right'
  title?: React.ReactNode
  active?: boolean
  children: React.ReactNode
}

export function Popover({
  children,
  active,
  title,
  align,
}: PopoverProps): JSX.Element {
  const tabableRef = useRef<HTMLDivElement | null>(null)
  const measuredSize = useRef<number | null>(null)

  const left = align === 'right' ? -253 : -150
  const arrow = align === 'right' ? 255 : 153

  useEffect(() => {
    if (!tabableRef || !tabableRef.current) {
      return
    }

    if (!active) {
      return
    }

    const tooltip = tabableRef.current

    // This focusses the popover when it becomes active
    tooltip.focus()

    // This tracks the render size once, and only once. We want to do this
    // so that the animation isn't akward when the tooltip is dismissed. The
    // reason the children aren't drawn is so that the "hidden links" are
    // removed from the tab order.
    if (measuredSize.current === null) {
      measuredSize.current = tabableRef.current.getBoundingClientRect().height
    }
  }, [active, tabableRef, measuredSize])

  return (
    <div
      ref={tabableRef}
      tabIndex={-1}
      className={`popover fade ${active !== false && 'show'} bs-popover-bottom`}
      role="tooltip"
      aria-hidden={!active}
      style={{
        left,
        pointerEvents: active ? 'auto' : 'none',
        height: measuredSize.current || undefined,
      }}
    >
      <div className="arrow" style={{ left: arrow }} />
      {title && <h5 className="popover-title">{title}</h5>}
      <div className="popover-body">{active && children}</div>
    </div>
  )
}

export function ContainedPopover({
  children,
  title,
  toggle,
  active,
  align,
  onToggle,
}: PopoverProps & {
  onToggle?: () => void
  toggle: React.ReactNode
}): JSX.Element {
  const doToggle = useCallback(() => {
    onToggle && onToggle()
  }, [onToggle])

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="popover-toggle"
        tabIndex={0}
        type="button"
        style={{ background: 0, border: 0 }}
        onClick={doToggle}
      >
        {toggle}
      </button>
      <Popover active={active === true} title={title} align={align}>
        {children}
      </Popover>
    </div>
  )
}

interface IconWithPopoverProps {
  loading: boolean
  valid: boolean
  children: React.ReactNode
  active?: boolean
  onToggle?: () => void
}

export function LoadingIconWithPopover({
  active,
  onToggle,
  loading,
  valid,
  children,
}: IconWithPopoverProps): JSX.Element {
  return loading ? (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" style={{ background: 0, border: 0 }}>
        <LoadingIndicator />
      </button>
    </div>
  ) : (
    <ContainedPopover
      active={active}
      onToggle={onToggle}
      align="right"
      toggle={<CheckOrCross value={valid} />}
    >
      {children}
    </ContainedPopover>
  )
}
