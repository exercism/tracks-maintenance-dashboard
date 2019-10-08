import React from 'react'

interface Props {
  activeLabel: string
  inActiveLabel: string
  onToggle: () => void
  actionableOnly: boolean
}

export function SwitchToggle({
  activeLabel,
  inActiveLabel,
  onToggle,
  actionableOnly,
}: Props) {
  return (
    <div className="custom-control custom-switch" onClick={onToggle}>
      <input
        type="checkbox"
        className="custom-control-input"
        checked={actionableOnly}
        readOnly
      />
      <label className="custom-control-label">
        {actionableOnly ? activeLabel : inActiveLabel}
      </label>
    </div>
  )
}
