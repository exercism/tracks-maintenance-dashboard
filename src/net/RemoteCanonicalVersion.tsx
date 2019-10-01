import React from 'react'
import { useRemoteCanonicalVersion } from '../hooks/useRemoteCanonicalVersion'
import { LoadingIndicator } from '../components/LoadingIndicator'

type RenderRemoteCanonicalVersionProp = (props: {
  version: Version
  url: string
}) => JSX.Element

type Slug = string
type Version = string

export interface RemoteCanonicalVersionProps {
  slug: Slug
  children: RenderRemoteCanonicalVersionProp
}

export function RemoteVersion({
  slug,
  children,
}: RemoteCanonicalVersionProps): JSX.Element {
  const { done, version, url } = useRemoteCanonicalVersion(slug)

  if (done && url) {
    return children({
      url,
      version: typeof version === 'string' ? version : '<no version>',
    })
  }

  return (
    <LoadingIndicator>
      Retrieving <code>canonical version</code> for{' '}
      <code>problem-specifications/{slug}</code>
    </LoadingIndicator>
  )
}
