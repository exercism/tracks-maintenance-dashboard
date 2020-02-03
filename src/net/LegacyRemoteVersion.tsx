import React from 'react'
import { useRemoteVersion } from '../hooks/useLegacyRemoteVersion'
import { LoadingIndicator } from '../components/LoadingIndicator'

type RenderRemoteVersionProp = (props: {
  version: Version
  url: string
}) => JSX.Element

type Slug = string
type Version = string

export interface RemoteVersionProps {
  trackId: TrackIdentifier
  slug: Slug
  children: RenderRemoteVersionProp
}

export function RemoteVersion({
  trackId,
  slug,
  children,
}: RemoteVersionProps): JSX.Element {
  const { done, version, url, path } = useRemoteVersion(trackId, slug)

  if (done && url) {
    return children({
      url,
      version: typeof version === 'string' ? version : '<no version>',
    })
  }

  return (
    <LoadingIndicator>
      Retrieving <code>{path}</code> for{' '}
      <code>
        {trackId}/{slug}
      </code>
    </LoadingIndicator>
  )
}
