# Changelog

## main

## 0.8.0

- Work with post-boom track configs

## 0.7.5

- Fix link to concept exercise guide. Now it points to the reference folder.

## 0.7.4

- Fix typo

## 0.7.3

- Fix maintainers check if file is missing

## 0.7.2

- Fix link to track "main" entry (v3/languages/trackid)
- Fix mobile view for pills in launch list
- Fix mobile view wrapping for url + check icon items
- Fix check marks for representer
- Fix check marks for analyzer

## 0.7.1

- Fix github action according to [this](https://github.com/aws/aws-cli/issues/4835).

## 0.7.0

- Add `v3` tool with prep and launch list
- Change default to `v3/launch`

## 0.6.3

- Add `versioning`, `stub_file` & `test_file` for `reasonml`

## 0.6.2

- Add `versioning` for `d`
- Fix `versioning` for `kotlin`

## 0.6.1

- Rename `perl6` track from **Perl 6** to **Raku**

## 0.6.0

- Add `stubs` view, showing the stub existance for exercises
- Add `stub_file` and `test_file` configuration for all `versioning` enabled tracks

## 0.5.0

- Add `unactionable` concept for `versioning`
- Add `diamond` to `unactionable` for `csharp` and `fsharp`

## 0.4.3

- Add `versioning` for `dart`

## 0.4.2

- Add `versioning` for `prolog`

## 0.4.1

- Add `versioning` for `delphi`

## 0.4.0

- Add `Escape` handler for the popover, as per `tooltip` aria guidlines
- Add accessiblity note to the `noscript` variant of the website
- Add `actionable` vs `all` items toggle
- Fix popovers not being "toggled" when same button is pressed again
- Fix tab order for content inside popovers
- Fix weird margin on spinner without label
- Fix browser error because of missing manifest
- Change buttons for views to be links
- Change button for select different track to be a link

## 0.3.1

- Add `versioning` for `elixir`

## 0.3.0

- Add `useOutsideClick` to `useToggleState` hook
- Add closing popovers when click happens outside of "parent group"
- Add `box-shadow` for popovers
- Fix issue with `versioning` information in `TrackVersions` table

## 0.2.7

- Add `versioning` for `lisp`

## 0.2.6

- Change `useRemoteVersion` to make matching simpler and work with `perl` tracks

## 0.2.5

- Add `versioning` for `perl5`
- Add `versioning` for `perl6`
- Add `versioning` for `scheme`

## 0.2.4

- Add missing track `ballerina`
- Add missing track `delphi`
- Add missing track `elisp`
- Add missing track `lfe`
- Add missing track `reasonml`
- Add missing track `sml`
- Add missing track `vimscript`

## 0.2.3

- Add `versioning` fro `go`
- Add `versioning` for `groovy`
- Add `versioning` for `nim`
- Fix the protocol for `homepage` in `package.json` to be `https` (instead of `http`)

## 0.2.2

- Fix path expansion for cloudfront invalidation

## 0.2.1

- Add missing `versioning` for `bash`

## 0.2.0

- Add track checklist
- Add information to unimplemented view
- Add information to topics view
- Fix track aside "details" overlapping overlay
- Fix deprecated fetch using N+1 requests

## 0.1.3

- Fix padding bottom on `topics` view
- Add generic `ExerciseIcon` component

## 0.1.2

- Fix `analyzer` and `test-runner` checks: look for `Dockerfile` instead of `README.md`
- Fix padding bottom on `versions` view
- Add typescript definitions for `jest`

## 0.1.1

- Add workflow for CI (`ci.yml`) and CD (`deploy.yml`)

## 0.1.0

- Initial release
