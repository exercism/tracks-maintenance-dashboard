# tracks-maintenance-dashboard

A dashboard for maintainers to understand the state of tracks

## Track versioning

Edit `src/data/tracks.json` and add `versioning` key. The value is _not_ a
regular expression or glob pattern, but allows for very specific template
replacements:

- `{exercise-slug}` is replaced by the exercise slug, using `dash-case`
- `{ExerciseSlug}` is replaced by the exercise slug, using `CamelCase`
- `{exercise_slug}` is replaced by the exercise slug, using `snake_case`
- `{slug}` is the same as `{exercise-slug}`

## Stub tracking

Edit `src/data/tracks.json` and add `stub` key. The value is _not_ a
regular expression or glob pattern, but allows for very specific template
replacements. Same as Track Versioning.

## Exercise "unactionable"

In order to remove an exercise from the version table (marked as not in sync),
add it to the `unactionable -> versions` list in `src/data/tracks.json`.
