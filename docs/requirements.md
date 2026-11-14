# Requirements

The ledger of how Tusch must behave. Owned by the tech lead
(`docs/agent-workflow-plan.md` §5.2).

- Plans reference requirements by id; PRs that change behaviour update this file.
- Every active requirement is proven by at least one E2E test tagged with its id:
  `test('…', { tag: '@REQ-012' }, async ({ page }) => …)`.
- `Proven by: gap` marks a requirement with no E2E test yet. Gaps are closed by
  AW4 (#29); add none without a linked issue.
- Requirements that no longer apply are deleted (git history keeps them).
- `pnpm run check:requirements` (also in CI) checks ids, tags and gaps.

## Comic library

### REQ-001 The landing page lists local comics

- Status: active
- Statement: `/` lists every locally stored comic, each linking to its comic page, and links to create a new one.
- Why: the library is the entry point to everything else.
- Proven by: tagged tests

### REQ-002 A comic can be deleted from the library

- Status: active
- Statement: deleting a comic on `/` removes it from the list and from local storage.
- Why: users manage their own local library.
- Proven by: tagged tests

### REQ-003 An empty library leads to creating a comic

- Status: active
- Statement: when no comics remain (e.g. all deleted this session), `/` redirects to `/comic/create`. A reload with no stored comics reseeds the examples (REQ-004).
- Why: an empty list is a dead end.
- Proven by: tagged tests

### REQ-004 Example comics are seeded on first visit

- Status: active
- Statement: with no stored comics, the app seeds three lightweight example comics (one complete, one without a cover or panel images, one with a single panel) and persists them.
- Why: development and tests start from a small library that covers the main data shapes without heavy assets.
- Proven by: tagged tests

## Creating a comic

### REQ-005 A comic can be created from a source URL

- Status: active
- Statement: on `/comic/create`, submitting a valid URL and a style generates a comic (title, characters, panels) and opens its page.
- Why: the core feature.
- Proven by: tagged tests

### REQ-006 A new comic gets a generated cover

- Status: active
- Statement: creating a comic also generates its cover image; the cover is stored locally and shown on the comic page.
- Why: every comic has a cover from the start.
- Proven by: tagged tests

### REQ-007 Invalid input is rejected with a visible message

- Status: active
- Statement: submitting an invalid URL shows an error and creates nothing; the error clears on the next valid submission.
- Why: users must know why nothing happened.
- Proven by: tagged tests

### REQ-008 Creating a comic never discards existing comics

- Status: active
- Statement: creating a comic, including from a freshly loaded `/comic/create`, keeps every previously stored comic.
- Why: regression guard for a data-loss bug (fixed in d72a36b).
- Proven by: tagged tests

### REQ-009 AI provider failures show readable messages

- Status: active
- Statement: auth, rate-limit and unexpected provider failures show the provider's message in the error region, never raw JSON or "Internal Error", and leave the user where they were.
- Why: provider problems are common and must be actionable.
- Proven by: tagged tests

## Comic page

### REQ-010 The comic page shows the comic and its panels

- Status: active
- Statement: `/comic/<id>` shows the comic's title, cover and panels; each panel links to its panel page.
- Why: overview and navigation for one comic.
- Proven by: tagged tests

### REQ-011 A cover can be generated or replaced

- Status: active
- Statement: on the comic page, the user can generate a new cover (optionally with instructions and the current cover as reference); it replaces the old one.
- Why: users iterate on the cover.
- Proven by: tagged tests

### REQ-012 A cover can be deleted

- Status: active
- Statement: deleting the cover removes it from the comic page.
- Why: users can start the cover over.
- Proven by: tagged tests

### REQ-013 A panel can be deleted

- Status: active
- Statement: deleting a panel removes it from the comic and its panel list.
- Why: users edit the story.
- Proven by: tagged tests

### REQ-014 Characters show the panels they appear in

- Status: active
- Statement: the comic page lists characters with the panels they appear in, and can preview a crop of that character from a panel image.
- Why: character consistency across panels.
- Proven by: tagged tests

### REQ-047 Deleting a panel removes its character images

- Status: active
- Statement: deleting a panel also removes every character image (head and full crop) taken from that panel, and their image files. The characters stay, as do their images from other panels.
- Why: the comic must not keep crops of a panel that no longer exists, and the files must not stay on disk (REQ-025).
- Proven by: tagged tests

## Panel page

### REQ-015 A panel image can be generated

- Status: active
- Statement: on a panel without an image, the user can generate one (optionally with instructions and a reference image).
- Why: the comic's visuals.
- Proven by: tagged tests

### REQ-016 A panel image can be replaced

- Status: active
- Statement: on a panel with an image, the user can generate a new image that replaces it.
- Why: users iterate on panels.
- Proven by: tagged tests

### REQ-017 A panel image can be removed

- Status: active
- Statement: removing a panel image leaves the panel without an image and offers to generate one.
- Why: users can start a panel image over.
- Proven by: tagged tests

### REQ-018 Generated panel images produce character crops

- Status: active
- Statement: generating a panel image also stores head and full-body crops for each known character in it, and the head crop is shown next to that character's dialogue.
- Why: character references for later images.
- Proven by: tagged tests

### REQ-048 A replaced panel image can be restored

- Status: active
- Statement: after a panel image is replaced, the panel page offers "Restore previous image", which brings back the image shown just before the latest replacement. It is a single step: once restored, or once the panel image is replaced again, removed, or the panel or comic deleted, only the newest previous image or none is kept. It survives a reload. A panel image that was never replaced offers nothing to restore.
- Why: a worse new image shouldn't destroy the one the user had.
- Proven by: tagged tests

### REQ-049 Restoring a panel image drops the crops of the replaced image

- Status: active
- Statement: restoring a previous panel image removes the character crops created from the replaced image and keeps the crops from earlier images, so dialogue heads match the image that's shown.
- Why: crops of an image that is gone would be stray files and wrong references.
- Proven by: tagged tests

### REQ-019 Captions can be added, edited and removed

- Status: active
- Statement: on a panel, the user can add a caption, edit any caption and remove any caption.
- Why: text is part of the comic.
- Proven by: tagged tests

### REQ-020 Dialogue can be edited and removed

- Status: active
- Statement: on a panel, the user can edit and remove dialogue lines.
- Why: text is part of the comic.
- Proven by: tagged tests

### REQ-021 A generated panel can be inserted before a panel

- Status: active
- Statement: from a panel, the user can generate a new panel that is inserted before it.
- Why: users extend the story.
- Proven by: tagged tests

## Persistence and navigation

### REQ-022 Changes persist locally across reloads

- Status: active
- Statement: comics and every edit to them are stored in the browser (`localStorage` metadata, OPFS images) and survive a reload. Nothing about a comic is stored on the server.
- Why: local-first; no accounts.
- Proven by: tagged tests

### REQ-023 Every local comic and panel is directly addressable

- Status: active
- Statement: opening or reloading `/comic/<id>` or `/comic/<id>/<panel>` works for any locally stored comic, including newly created ones.
- Why: links and reloads must not lose the user's place.
- Proven by: tagged tests

### REQ-024 Missing comics and panels show not found

- Status: active
- Statement: an unknown comic id, an unknown panel id, or a panel id from another comic shows a 404 page.
- Why: explicit errors instead of broken pages.
- Proven by: tagged tests

### REQ-025 Image files never leak or dangle

- Status: active
- Statement: replacing or deleting a cover, panel image, panel (with its character images) or comic removes image files no comic still references (shared example files are kept); a generation that fails part-way leaves no partial metadata and no stray files.
- Why: OPFS is the user's disk space; metadata must not point at missing files.
- Proven by: tagged tests

### REQ-026 Corrupt stored data doesn't break the app

- Status: active
- Statement: if stored comic data is corrupt or from an unsupported version, the app keeps a copy aside and starts with the examples instead of crashing.
- Why: recoverable failure instead of a blank app.
- Proven by: tagged tests

### REQ-036 A missing image file shows a placeholder

- Status: active
- Statement: if a comic references an image file that is no longer stored, the view shows a neutral "missing image" placeholder instead of a broken image or another comic's picture; example comics show their bundled images. In the dark colour scheme the placeholder has a dark version, so it doesn't show a light-grey box on a dark page.
- Why: a missing file must be visible, not disguised as a real image.
- Proven by: tagged tests

### REQ-027 The raw view shows the comic data

- Status: active
- Statement: `/comic/<id>/raw` shows the comic's stored data as JSON.
- Why: debugging and export.
- Proven by: tagged tests

## Settings and API key

### REQ-028 Users bring their own validated OpenAI key

- Status: active
- Statement: on `/settings`, the user enters an OpenAI API key; it is stored (HTTP-only cookie) only after the provider accepts it. A rejected key shows an error and keeps any previous key.
- Why: no shared key; an invalid key must never become active.
- Proven by: tagged tests

### REQ-029 The API key is never exposed to the browser

- Status: active
- Statement: the key never appears in page HTML, page data or `document.cookie`.
- Why: security.
- Proven by: tagged tests

### REQ-030 Users choose the text and image models

- Status: active
- Statement: `/settings` lists available models; the saved text and image models are stored in cookies, survive reload and are shown as the current selection.
- Why: users pick models their key can use.
- Proven by: tagged tests

### REQ-031 Settings work before a key is stored

- Status: active
- Statement: `/settings` renders (with empty model lists) when no key is stored, so the user can enter one.
- Why: otherwise a new user can't get started.
- Proven by: tagged tests

### REQ-034 Settings is reachable from the start page

- Status: active
- Statement: the start page links to Settings; the Settings page is titled "Settings" and links back to the start page.
- Why: users must find where to add their key without typing `/settings`.
- Proven by: tagged tests

### REQ-050 Global instructions can be saved in the browser

- Status: active
- Statement: on `/settings` the user can save global instructions (up to 1000 characters) in a labelled text field; they are stored only in the browser (`localStorage`), are shown in the field after a reload, and saving an empty field clears them.
- Why: users want standing instructions (tone, language) without retyping them for every generation, and nothing about them should leave the device except inside a generation request.
- Proven by: tagged tests

### REQ-051 Global instructions are added to every AI generation

- Status: active
- Statement: saved global instructions are added to the prompt of every AI generation (create comic and its cover, generate cover, generate panel image, insert panel), after the app's built-in rules and before any per-request instruction; with none saved, prompts are unchanged.
- Why: the instructions only help if every generation honours them.
- Proven by: tagged tests

### REQ-052 Too-long global instructions are rejected

- Status: active
- Statement: saving global instructions longer than 1000 characters shows an error and keeps the previously saved instructions.
- Why: an unbounded value would bloat every request; a failed save must not lose what the user had.
- Proven by: tagged tests

## Feedback

### REQ-032 Submissions show progress and can't be doubled

- Status: active
- Statement: while a form submission runs, a loading indicator is shown; submitting the same form again before it finishes does nothing.
- Why: AI calls are slow; duplicate submits would duplicate work.
- Proven by: tagged tests

### REQ-041 A running submission shows what is running

- Status: active
- Statement: while a form submission runs, the global loader shows an indeterminate progress bar (a `<progress>` with no value, named by the label) and a label naming the action, e.g. "Generating panel image...".
- Why: AI calls take seconds to half a minute; users can't tell what is running or whether it is stuck.
- Proven by: tagged tests

### REQ-042 A running submission shows the seconds elapsed

- Status: active
- Statement: while a form submission runs, the global loader shows the whole seconds elapsed since submit ("0 s", "1 s", …), updated every second; the bar, label and timer disappear when the submission finishes, whether it succeeds or fails.
- Why: a ticking counter shows the action is alive and how long it has taken.
- Proven by: tagged tests

### REQ-043 Screen readers hear the start and the end, not the ticks

- Status: active
- Statement: a screen reader hears the action's label when a submission starts and "Done" when it succeeds; the elapsed seconds are not inside a live region, and "Done" is not announced when the submission fails (the error is).
- Why: a counter inside a live region would be read out every second.
- Proven by: tagged tests

## Security

### REQ-033 Routes accept only the actions their forms use

- Status: active
- Statement: each page accepts POSTs only to the form actions its own forms use; any other action name returns 404.
- Why: limits what a crafted request can trigger (e.g. no AI generation from the settings page).
- Proven by: tagged tests

## Accessibility

### REQ-035 Every view passes an axe scan

- Status: active
- Statement: every view (landing, create, comic, panel, raw, not found, settings) has no axe violations, in both the light and the dark colour scheme: each has a page title, a main landmark, labelled form controls and sufficient colour contrast.
- Why: screen-reader and keyboard users must be able to use every view; tests select by role and name, so missing labels break both.
- Proven by: tagged tests

### REQ-037 Every control can be operated with the keyboard alone

- Status: active
- Statement: every interactive control (links, buttons, form fields, selects) can be reached with Tab, in a sensible order, and operated with the keyboard alone (Enter/Space, typing, arrow keys).
- Why: keyboard-only users must be able to use every view; axe doesn't check operability. The E2E suite itself drives the UI by keyboard, so it doubles as this check.
- Proven by: tagged tests

### REQ-038 The focused control has a visible focus indicator

- Status: active
- Statement: when a control receives focus by keyboard, it shows a visible indicator (non-zero outline or box-shadow, distinct from its unfocused state). The indicator uses the accent colour in both colour schemes, and the accent has at least 3:1 contrast against the background of the active scheme.
- Why: keyboard users must see where they are (WCAG 2.4.7); axe doesn't check it.
- Proven by: tagged tests

### REQ-040 No view scrolls horizontally at 320 px

- Status: active
- Statement: at a viewport 320 CSS px wide, no view (landing, create, comic, panel, raw, not found, settings) scrolls horizontally: the document is no wider than the viewport, and long content such as the raw JSON wraps or scrolls inside its own box.
- Why: WCAG 1.4.10 (Reflow); users on narrow screens or at high zoom must not have to scroll in two directions.
- Proven by: tagged tests

## Appearance

### REQ-044 Every view follows the OS/browser colour scheme

- Status: active
- Statement: every view follows the colour scheme the OS or browser asks for (`prefers-color-scheme`). With a dark preference it shows light text on a dark background and native controls render dark (`color-scheme`); it updates when the preference changes, without a reload. With a light (or no) preference it looks as before: black text on white. There is no toggle and nothing is stored.
- Why: users with a dark system setting otherwise get a bright white page.
- Proven by: tagged tests

## Performance

### REQ-039 Core views meet the web vitals budget

- Status: active
- Statement: the landing, comic and panel views, audited by Lighthouse (desktop preset) on the production build, meet LCP ≤ 2.5 s, CLS ≤ 0.1 and TBT ≤ 200 ms (median of 3 runs). A view that exceeds a budget fails the check, and the failure names the view and the metric.
- Why: nothing else stops a change from making the app slow or visually unstable. TBT is the lab proxy for INP, which Lighthouse navigation audits can't measure.
- Proven by: tagged tests
