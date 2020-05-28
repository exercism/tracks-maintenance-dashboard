// TODO: update to ALL the supported tracks
type TrackIdentifier = 'csharp' | 'javascript' | 'ruby' | 'typescript'
type ExerciseIdentifier = string

interface GenericTrackConfiguration
  extends Readonly<GenericTrackConfiguration> {
  language: string
  active: boolean
  blurb: string
}

type View = 'tree' | 'concept' | 'practice' | 'details' | 'launch'

interface TrackConfiguration extends GenericTrackConfiguration {
  test_pattern: string
  version: 3
  online_editor: Readonly<{
    indent_style: 'space' | 'tab'
    indent_size: number
  }>
  exercises: Readonly<{
    concept: ReadonlyArray<ExerciseConfiguration>
    practice: ReadonlyArray<ExerciseConfiguration>
  }>
}

interface ExerciseConfiguration extends Readonly<ExerciseConfiguration> {
  slug: string
  uuid: string
  concepts: ReadonlyArray<string>
  prerequisites: ReadonlyArray<string>
}

type SelectedTrackIdentifier = TrackIdentifier | null
type SelectedView = View | null
type SelectedExercise = ExerciseIdentifier | null

interface TrackData extends Readonly<TrackData> {
  slug: TrackIdentifier
  name: string
  core_enabled: boolean
  versioning?: string
  stub_file?: string
  test_file?: string
  unactionable?: {
    versioning?: string[]
    topics?: string[]
  }
}

declare module 'js-levenshtein' {
  export default function levenshtein(a: string, b: string): number
}
