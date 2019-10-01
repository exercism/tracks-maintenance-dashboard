import React from 'react'

export function BranchSelector({
  selected,
  onSelect,
}: {
  selected: Branch | undefined
  onSelect: (branch: Branch) => void
}) {
  return (
    <fieldset
      style={{ marginBottom: 20, background: '#ddd', padding: '0px 10px' }}
    >
      <legend>Problem Specifications Branch</legend>
      <BranchSelectOption branch="master" selected={selected} onSelect={onSelect} />
      <BranchSelectOption branch="track-anatomy" selected={selected} onSelect={onSelect} />
    </fieldset>
  )
}

function BranchSelectOption({
  branch,
  selected,
  onSelect
}: {
  branch: Branch;
  selected: Branch | undefined;
  onSelect: (branch: Branch) => void
}) {
  return (
    <label style={{ marginRight: 10 }}>
      {branch}
      <input
        type="radio"
        name="branch"
        value="master"
        checked={selected === branch}
        onChange={() => onSelect(branch)}
        style={{ marginLeft: 5 }}
      />
      </label>
  )
}