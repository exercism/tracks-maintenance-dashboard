import React from 'react'


export function ExerciseAside({ trackId, exercise }: { trackId: TrackIdentifier; exercise: ExerciseIdentifier }) {
  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul
        className="list-group"
        style={{ whiteSpace: 'nowrap' }}
      >
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={trackId} path={`exercises/${exercise}`}>Implementation</RepositoryLink>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository="problem-specifications" path={`exercises/${exercise}`}>Canonical Data</RepositoryLink>
        </li>
      </ul>
    </aside>
  )
}

function RepositoryLink({
  children,
  repository,
  organisation = 'exercism',
  path
}: {
  children: React.ReactNode
  organisation?: string
  repository: string
  path?: string
}) {
  return (
    <a
      href={`https://github.com/${organisation}/${repository}${path ? `/tree/master/${path}` : ''}`}
      className="d-block mr-4"
    >
      {children}
    </a>
  )
}
