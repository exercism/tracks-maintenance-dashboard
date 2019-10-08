import React from 'react'
import { LoadingIndicator } from './LoadingIndicator'
import { CheckOrCross } from './CheckOrCross'

interface PopoverProps {
  align?: 'center' | 'right'
  title?: React.ReactNode
  active?: boolean
  children: React.ReactNode
}


export function Popover({ children, active, title, align }: PopoverProps) {
  const left = align === 'right' ? -253 : -150
  const arrow = align === 'right' ? 255 : 153

  return (
    <div
      className={`popover fade ${active !== false && 'show'} bs-popover-bottom`}
      role="tooltip"
      style={{
        left,
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <div className="arrow" style={{ left: arrow }} />
      {title && <h5 className="popover-title">{title}</h5>}
      <div className="popover-body">{children}</div>
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
}: PopoverProps & { onToggle?: () => void; toggle: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        style={{ background: 0, border: 0 }}
        onClick={onToggle}
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
}: IconWithPopoverProps) {
  return loading ? (
    <button type="button" style={{ background: 0, border: 0 }}>
      <LoadingIndicator />
    </button>
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
