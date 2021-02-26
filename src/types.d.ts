export type TrackIdentifier = 'csharp' | 'javascript' | 'ruby' | 'typescript'
export type ExerciseIdentifier = string
export type ExerciseType = 'concept' | 'practice'

export interface GenericTrackConfiguration
  extends Readonly<GenericTrackConfiguration> {
  language: string
  active: boolean
  blurb: string
}

export namespace Legacy {
  type Branch = 'main' | 'track-anatomy'
  type View = 'versions' | 'unimplemented' | 'topics' | 'details' | 'stubs'

  interface TrackConfiguration extends GenericTrackConfiguration {
    exercises: {
      concept: ReadonlyArray<Legacy.ExerciseConfiguration>
      practice: ReadonlyArray<Legacy.ExerciseConfiguration>
    }
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

export namespace Version3 {
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

export type Branch = Legacy.Branch | Version3.Branch
export type View = Legacy.View | Version3.View

export type SelectedTrackIdentifier = TrackIdentifier | null
export type SelectedBranch = Branch | null
export type SelectedView = View | null
export type SelectedExercise = ExerciseIdentifier | null

export interface TrackData extends Readonly<TrackData> {
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
