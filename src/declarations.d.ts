// TODO: update to ALL the supported tracks
type TrackIdentifier = 'csharp' | 'javascript' | 'ruby' | 'typescript'
type ExerciseIdentifier = string

type Branch = 'master' | 'track-anatomy'
type View = 'unimplemented' | '' | 'topics' | 'details'

type SelectedTrackIdentifier = TrackIdentifier | null
type SelectedBranch = Branch | null
type SelectedView = View | null
type SelectedExercise = ExerciseIdentifier | null

interface TrackConfiguration extends Readonly<TrackConfiguration> {
  language: string
  active: boolean
  blurb: string
  foregone: ReadonlyArray<string>
  exercises: ReadonlyArray<ExerciseConfiguration>
}

interface ExerciseConfiguration extends Readonly<ExerciseConfiguration> {
  slug: Exercise
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

declare module 'js-levenshtein' {
  export default function levenshtein(a: string, b: string): number
}
