import React from 'react'
import { useRemoteConfig } from '../hooks/useLegacyRemoteConfig'
import { LoadingIndicator } from '../components/LoadingIndicator'
import { Legacy, TrackIdentifier } from '../types'

type TrackConfiguration = Legacy.TrackConfiguration

type RenderRemoteConfigProp = (props: {
  config: TrackConfiguration
}) => JSX.Element

export interface RemoteConfigProps {
  trackId: TrackIdentifier
  children: RenderRemoteConfigProp
}

export function RemoteConfig({
  trackId,
  children,
}: RemoteConfigProps): JSX.Element {
  const { done, config } = useRemoteConfig(trackId)

  return done && config ? (
    children({ config })
  ) : (
    <LoadingIndicator>
      Retrieving <code>config.json</code> for <code>{trackId}</code>
    </LoadingIndicator>
  )
}
