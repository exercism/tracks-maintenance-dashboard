import React, { useState } from 'react'

interface PopoverProps {
  title?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}

export function Popover({ children, active, title }: PopoverProps) {
  return (
    <div className={`popover fade ${active !== false && 'show'} bs-popover-bottom`} role="tooltip" style={{
      position: 'absolute',
      top: 25,
      left: -150,
      width: 300,
      maxWidth: 300,
      pointerEvents: active ? 'auto' : 'none'
    }}>
      <div className="arrow" style={{ left: 153 }}></div>
      {title && <h5 className="popover-title">{title}</h5>}
      <div className="popover-body">
        {children}
      </div>
    </div>
  )
}

export function ContainedPopover({ children, title, toggle, active }: PopoverProps & { toggle: React.ReactNode }) {
  const [isActive, setActive] = useState(active === true)
  return (
    <div style={{ position: 'relative', display: 'inline-block'}}>
      <button type="button" style={{ background: 0, border: 0 }} onClick={() => setActive((prev) => !prev)}>
        {toggle}
      </button>
      <Popover active={isActive} title={title}>{children}</Popover>
    </div>
  )
}
