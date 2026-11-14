# Changelog

User-facing changes. `/tech-lead reconcile` adds each merged pipeline PR's
release note under **Unreleased** (see `.claude/skills/tech-lead/SKILL.md`).

## Unreleased

### Features

- When generating a panel image, you can now attach a character's look from another panel so the character stays consistent. ([#212](https://github.com/erikhayry/tusch/pull/212))
- You can now save global instructions on the Settings page; they are kept in your browser and added to every AI generation. ([#198](https://github.com/erikhayry/tusch/pull/198))
- The comic page now shows every character's generated images, one per panel, and you can open each one to see the full-body crop. ([#195](https://github.com/erikhayry/tusch/pull/195))
- Tusch now switches to a dark theme automatically when your system or browser is set to dark mode. ([#170](https://github.com/erikhayry/tusch/pull/170))
- After generating a new panel image, you can restore the previous one with "Restore previous image". ([#167](https://github.com/erikhayry/tusch/pull/167))
- Deleting a panel now also removes the character images taken from it, so they no longer take up storage. ([#158](https://github.com/erikhayry/tusch/pull/158))
- While an action runs, Tusch now shows what it is doing, a progress bar and the seconds elapsed. ([#161](https://github.com/erikhayry/tusch/pull/161))
- The app now has a clean black-and-white style that is readable on small screens, with a clear blue focus outline for keyboard users. ([#159](https://github.com/erikhayry/tusch/pull/159))

### Fixes

- After replacing a panel image, the character heads next to the dialogue now match the new image. ([#215](https://github.com/erikhayry/tusch/pull/215))
- Example comics now show their own panel images, and a missing image shows a clear placeholder instead of an unrelated picture. ([#138](https://github.com/erikhayry/tusch/pull/138))
- Every page now has a proper title and a main landmark, so screen readers and browser tabs show where you are. ([#115](https://github.com/erikhayry/tusch/pull/115))

### Chores

- The example comics shown on first visit are now three small, simple comics instead of the Nirvana example. ([#191](https://github.com/erikhayry/tusch/pull/191))
