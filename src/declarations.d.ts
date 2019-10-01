// TODO: update to ALL the supported tracks
type TrackIdentifier = 'csharp' | 'javascript' | 'ruby' | 'typescript'
type Branch = 'master' | 'track-anatomy'
type View = 'unimplemented' | ''

type SelectedTrackIdentifier = TrackIdentifier | null
type SelectedBranch = Branch | null
type SelectedView = View | null

interface TrackConfiguration extends Readonly<TrackConfiguration> {
  language: string
  active: boolean
  blurb: string
  foregone: ReadonlyArray<string>
  exercises: ReadonlyArray<ExerciseConfiguration>
}

interface ExerciseConfiguration extends Readonly<ExerciseConfiguration> {
  slug: string
  uuid: string
  core: boolean
  unlocked_by: string | null
  difficulty: number
  topics: ReadonlyArray<string> | null
  auto_approve?: boolean
  deprecated?: boolean
  foregone?: boolean
}

interface TrackData extends Readonly<TrackData> {
  slug: TrackIdentifier
  name: string
  core_enabled: boolean
  versioning?: string
}
