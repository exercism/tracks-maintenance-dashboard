// TODO: update to ALL the supported tracks
type TrackIdentifier = 'csharp' | 'javascript' | 'ruby' | 'typescript'
type ExerciseIdentifier = string

interface GenericTrackConfiguration
  extends Readonly<GenericTrackConfiguration> {
  language: string
  active: boolean
  blurb: string
}

namespace Legacy {
  type Branch = 'master' | 'track-anatomy'
  type View = 'versions' | 'unimplemented' | 'topics' | 'details' | 'stubs'

  interface TrackConfiguration extends GenericTrackConfiguration {
    exercises: ReadonlyArray<Legacy.ExerciseConfiguration>
    foregone: ReadonlyArray<string>
  }

  interface ExerciseConfiguration
    extends Readonly<Legacy.ExerciseConfiguration> {
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
}

namespace Version3 {
  type Branch = 'v3'
  type View = 'tree' | 'concept' | 'practice' | 'details' | 'launch'

  interface TrackConfiguration extends GenericTrackConfiguration {
    test_pattern: string
    version: 3
    online_editor: Readonly<{
      indent_style: 'space' | 'tab'
      indent_size: number
    }>
    exercises: Readonly<{
      concept: ReadonlyArray<Version3.ExerciseConfiguration>
      practice: ReadonlyArray<Version3.ExerciseConfiguration>
    }>
  }

  interface ExerciseConfiguration
    extends Readonly<Version3.ExerciseConfiguration> {
    slug: string
    uuid: string
    concepts: ReadonlyArray<string>
    prerequisites: ReadonlyArray<string>
  }
}

type Branch = Legacy.Branch | Version3.Branch
type View = Legacy.View | Version3.View

type SelectedTrackIdentifier = TrackIdentifier | null
type SelectedBranch = Branch | null
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
