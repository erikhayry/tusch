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

### REQ-235-1 A comic with a cover shows it in its library card

- Status: active
- Statement: on `/`, each comic is a card showing its portrait cover (decorative, `alt=""`), its title and a meta line, none of them a link. Below them a "Read" link to `/comic/<id>/view` and an "Edit" link to `/comic/<id>`, named "Read <title>" and "Edit <title>", and an icon-only delete button named "Delete Comic <title>" (REQ-002). A cover whose file is gone shows the "missing image" placeholder (REQ-036).
- Why: a cover makes a comic recognisable at a glance, and a per-comic link name keeps every link unique and exact for screen-reader users (#295).
- Proven by: tagged tests

### REQ-235-2 A comic without a cover shows a "No cover yet" box in the library

- Status: active
- Statement: on `/`, a comic without a cover shows a 3:4 box with the text "No cover yet" in place of the cover; no image and no placeholder.
- Why: a missing cover is not a missing file, so there is nothing to replace; the box keeps the cards level and says why there is no picture (#295).
- Proven by: tagged tests

### REQ-235-3 The library lays out cards in an auto-fill grid and loads covers lazily

- Status: active
- Statement: on `/`, the cards sit in an `auto-fill` grid with a 220 px (token) minimum column: one per row at 320 px, several per row at 1280 px. The first four covers load eagerly and every later cover has `loading="lazy"`.
- Why: a narrow screen needs one column (REQ-040), and covers below the first row must not slow the first paint (REQ-039).
- Proven by: tagged tests

### REQ-295-1 A library card shows its style and panel count

- Status: active
- Statement: each card's meta line shows "Example" for a bundled example, then the comic's style name (any of the ten style names in REQ-306-1) and its panel count, separated by " · ": "Example · Anime · 3 panels"; a user's comic: "Anime · 1 panel".
- Why: the card says what a comic is without opening it (#295).
- Proven by: tagged tests

### REQ-295-2 The library heading shows the number of comics

- Status: active
- Statement: the comics heading on `/` reads "Your comics" and shows the number of comics in the library next to it; deleting a comic lowers the number by one.
- Why: users see the size of their library at a glance (#295).
- Proven by: tagged tests

### REQ-295-3 The last grid cell creates a new comic

- Status: active
- Statement: the last cell of the library grid is a "Create new comic" tile linking to `/comic/create`. The page body has no other "Create New Comic" link and no "Settings" link; the header has them (REQ-294-2, REQ-294-4).
- Why: the next step sits where the comics end, and the header already holds the global links (#295).
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

### REQ-005 A comic can be created from a source URL or a story

- Status: active
- Statement: on `/comic/create`, submitting a style, a panel count and a valid URL, a story, or both generates a comic (title, characters, panels) and opens its page. When both are given, the story is extra context on top of the URL.
- Why: the core feature.
- Proven by: tagged tests

### REQ-006 A new comic gets a generated cover

- Status: active
- Statement: creating a comic also generates its cover image; the cover is stored locally and shown on the comic page. The cover gets the variants of the default image format (REQ-103-1): portrait first, then landscape with the portrait cover as reference; if one fails the other is kept, as for panel images (REQ-103-3).
- Why: every comic has a cover from the start.
- Proven by: tagged tests

### REQ-007 Invalid input is rejected with a visible message

- Status: active
- Statement: submitting with neither a URL nor a story, an invalid URL, or a story shorter than 20 or longer than 10,000 characters shows an error and creates nothing; the error clears on the next valid submission.
- Why: users must know why nothing happened.
- Proven by: tagged tests

### REQ-289-1 A new comic has the number of panels the user chose

- Status: active
- Statement: the create form has a required "Number of panels" field after the story and before the comic style choice, prefilled with 5 and hinted "1–30"; the create-comic prompt asks the AI for exactly that many panels, so the created comic lists that many panels.
- Why: users want to choose how long a new comic is instead of getting 5–10 panels the AI picks.
- Proven by: tagged tests

### REQ-289-2 An invalid panel count is rejected with a visible message

- Status: active
- Statement: a panel count that isn't a whole number from 1 to 30 (0, 31, 2.5, empty) is rejected by the server with a message in the error region and no comic is created; the error clears on the next valid submission (as REQ-007).
- Why: users must know why nothing happened.
- Proven by: tagged tests

### REQ-105-1 A comic keeps and shows the story it was created from

- Status: active
- Statement: a comic created with a story stores the story locally with the comic (it survives a reload), and the comic page shows it in the source section. The source link is shown only when the comic has a URL.
- Why: the story is the comic's source when there is no article, and users want to see what a comic was based on.
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

### REQ-185-1 An image request that returns no image is retried once

- Status: active
- Statement: when the AI response to a panel image or cover image request contains no image, the server retries the request once by itself; the user only sees an error if the second response has no image either.
- Why: the model sometimes answers without calling the image tool, and a second try usually works (#185).
- Proven by: tagged tests

### REQ-185-2 An unusable AI response shows a friendly message with details

- Status: active
- Statement: when the AI returns a response the app can't use (no image, or comic or panel text that doesn't match the schema), the error region shows a translated, user-friendly message and a native `<details>` "Show details" disclosure, collapsed by default, with the technical message. The user stays where they were and nothing is saved; submitting again clears the error.
- Why: the raw schema issue list breaks REQ-009 and means nothing to the user (#185).
- Proven by: tagged tests

### REQ-185-3 Unexpected provider failures are reported to Sentry without private data

- Status: active
- Statement: invalid AI responses and other unexpected provider failures (the 502 path) are reported to Sentry from the server with only the error message and kind, never prompts, AI output or the API key; expected failures (auth, permission, rate limit, invalid input) are not reported.
- Why: the failures were invisible in Sentry, and reports must respect REQ-029 and `src/lib/sentry-options.ts` (#185).
- Proven by: tagged tests

## Comic page

### REQ-010 The comic page shows the comic and its panels

- Status: active
- Statement: `/comic/<id>` shows the comic's title, cover and panels; each panel links to its panel page.
- Why: overview and navigation for one comic.
- Proven by: tagged tests

### REQ-103-1 A comic has an image format setting

- Status: active
- Statement: the comic page's "Comic settings" card has an "Image format" setting (Portrait and landscape / Portrait only / Landscape only), saved with the comic and changeable at any time; it is "Portrait and landscape" for every comic that has none saved (existing and example comics).
- Why: wide screens should get a wide image and narrow screens a tall one, and some comics only need one (#103).
- Proven by: tagged tests

### REQ-236-1 The comic's title is the comic page's only h1

- Status: active
- Statement: on `/comic/<id>` the page's only level-1 heading is the comic's title, without a "Comic:" prefix; the title is not repeated as another heading, and the document title is "<title> · Tusch".
- Why: the heading and the tab said "Comic: <title>" and the title was repeated as an `<h2>`, which is noise for screen reader users and in the tab.
- Proven by: tagged tests

### REQ-236-2 The comic page's headings have no skipped level

- Status: active
- Statement: on `/comic/<id>` the sections below the title are four cards with an `<h2>` each, in this order: "Panels", "Characters", "Cover", "Comic settings"; a comic without characters has no "Characters" card, so three. Each character's name is an `<h3>` in "Characters" and "Setting" is an `<h3>` in "Comic settings". "Style" and "Source" are a description list (`<dt>`/`<dd>`), not headings.
- Why: skipped levels break heading navigation; one `<h2>` per card gives screen-reader users the page's four areas (#297).
- Proven by: tagged tests

### REQ-236-3 A comic with an empty title shows "Untitled comic"

- Status: active
- Statement: a comic whose title is empty shows "Untitled comic" (translated) as the `<h1>` of its page and "Untitled comic · Tusch" as the document title, so the page never has an empty heading.
- Why: `ComicSchema.title` allows an empty string, and an empty `<h1>` fails axe `empty-heading`.
- Proven by: tagged tests

### REQ-297-1 The comic page shows the panel and character counts

- Status: active
- Statement: under the title of `/comic/<id>` a meta line shows the panel count and, if the comic has any characters, the character count, joined by " · ": "8 panels · 2 characters", "1 panel · 1 character", "1 panel" when there are no characters. It has no "Example" part.
- Why: the size of the comic is visible without counting cards (#297).
- Proven by: tagged tests

### REQ-297-2 A panel card shows its caption and line counts

- Status: active
- Statement: each panel card on `/comic/<id>` shows its number, its editorial title (the panel link's name) and a meta line of its caption and dialogue-line counts joined by " · ": "1 caption · 2 lines". A count of zero is left out; a panel with neither has no meta line.
- Why: the strip shows how much text each panel holds (#297).
- Proven by: tagged tests

### REQ-297-3 A character shows how many panels it appears in

- Status: active
- Statement: each character on `/comic/<id>` shows "Appears in 1 panel" or "Appears in N panels", N being the number of panels listed for it (REQ-014).
- Why: the character cards say how central a character is (#297).
- Proven by: tagged tests

### REQ-87-1 The comic page links to a viewer and the viewer links back

- Status: active
- Statement: `/comic/<id>` has a top row with a "Back" link to `/` before the `<h1>` and a "View comic" link (not a button) after it, to `/comic/<id>/view`; both come before the first `<h2>`. The viewer has a "Back to editing" link to `/comic/<id>` in its header and another in its ending block (REQ-299-1, REQ-299-2). The links add no heading.
- Why: readers need a way to see the comic without the editor.
- Proven by: tagged tests

### REQ-87-2 The viewer shows the comic as a reader sees it

- Status: active
- Statement: `/comic/<id>/view` shows the comic's title (or "Untitled comic") as its only `<h1>` (placed over the cover, see REQ-283-5), then every panel in stored order as a section with a visually hidden `<h2>` "Panel <n>", its image, its captions and its dialogue lines as "<character name>" + text (text alone if the character is unknown).
- Why: the editor mixes content with controls and notes; a reader wants the story.
- Proven by: tagged tests

### REQ-87-3 The viewer shows no editing data or controls

- Status: active
- Statement: the viewer has no form, no button and none of the editing data: visual descriptions, time of day, season, year, style, source/story, character list, setting or dialogue head crops.
- Why: the viewer is read-only and shows the comic, not how it was made.
- Proven by: tagged tests

### REQ-87-4 The viewer handles panels without an image and comics without panels

- Status: active
- Statement: a viewer panel without an image still shows its heading, captions and dialogue over a decorative placeholder frame (no `<img>`, hidden from assistive technology) sized like a panel image (REQ-283-4), and renders no image. A comic without panels shows only its title and cover (if any), with no panel headings.
- Why: users edit comics in any order; a half-finished comic must still be readable.
- Proven by: tagged tests

### REQ-88-1 The viewer has a "Download comic" link that saves one .html file

- Status: active
- Statement: the viewer has a "Download comic" link (an `<a download>`, not a button) in its header and another in its ending block (REQ-299-1, REQ-299-2). Activating either saves the comic as one `.html` file named after the comic title (or "Untitled comic") plus `.html`, with characters that aren't allowed in file names replaced. The viewer still has no form and no button (REQ-87-3).
- Why: browser "Save as" on the viewer saves broken images, because they are OPFS `blob:` URLs (#88).
- Proven by: tagged tests

### REQ-88-2 The downloaded file is self-contained

- Status: active
- Statement: the downloaded file, opened with no network, shows the title, cover and every panel with its heading, captions and dialogue as the viewer does (REQ-87-2, REQ-283-1). Every image is embedded as a `data:` URL (bundled example images too) and the CSS is inlined. The file has no script, form, button, link back into Tusch or editing data (REQ-87-3).
- Why: the file must keep working outside Tusch and stay a read-only copy of the story (#88).
- Proven by: tagged tests

### REQ-88-3 The downloaded file switches between image variants

- Status: active
- Statement: in the downloaded file, a cover or panel with both variants is a `<picture>` that shows the landscape image when the viewport is landscape and the portrait image otherwise (REQ-103-5); one with a single variant shows that one at every size.
- Why: the file behaves like the viewer on any screen (#88).
- Proven by: tagged tests

### REQ-88-4 A missing image file is exported without an image

- Status: active
- Statement: a cover or panel whose image file is no longer stored (REQ-036) is exported without an image, like a panel without one (REQ-87-4), and the download still succeeds.
- Why: a cleared OPFS must not block saving the rest of the comic (#88).
- Proven by: tagged tests

### REQ-283-1 Viewer captions and dialogue are boxes over the panel image

- Status: active
- Statement: on the viewer, a panel with an image shows its captions as boxes over the top-left of the image and its dialogue as speech boxes over the bottom of the image. With only one of the two, only that one is shown, in its place. With both, the captions are above every speech box.
- Why: readers see captions and dialogue the way a printed comic shows them (#283).
- Proven by: tagged tests

### REQ-283-2 Viewer panels without an image show boxes below the heading

- Status: active
- Statement: on the viewer, a panel without an image shows its captions and then its dialogue as boxes over a decorative placeholder frame, below the (hidden) heading, in reading order, and renders no image.
- Why: a half-finished comic must stay readable in the same style (#283).
- Proven by: tagged tests

### REQ-283-3 Viewer speech boxes label the speaker in bold

- Status: active
- Statement: in a viewer speech box, the character's name is a bold label (`<strong>` or `<b>`) before the text, with no head crop. A line of an unknown character shows the text alone.
- Why: readers need to know who speaks without the editor's head crops (#283).
- Proven by: tagged tests

### REQ-283-4 Viewer panel images fill the width and nearly the height

- Status: active
- Statement: on the viewer, a panel image is as wide as the content area and almost as tall as the viewport, but leaves room so the top of the next panel shows below it, whatever its shape. This applies on screen; printed, REQ-89-1 applies.
- Why: readers see one panel at a time and a hint of the next, as in the reference viewer (#283).
- Proven by: tagged tests

### REQ-283-5 Viewer cover is full width with the title as an inverted caption on it

- Status: active
- Statement: on the viewer, the cover is as wide as the content area, with space below it before the first panel. The comic's title is the page's `<h1>`, shown as a box over the top-left of the cover with the caption box's colours swapped (light text on a dark box in the light scheme). A comic without a cover shows a cover-coloured placeholder frame, sized like a cover image, with the same box over it.
- Why: the cover works as the opening panel of the comic (#283).
- Proven by: tagged tests

### REQ-011 A cover can be generated or replaced

- Status: active
- Statement: on the comic page, the user can generate a new cover (optionally with instructions and the current cover as reference); it replaces the old one. It has the variants the comic's image format asks for, with the same partial-failure rule as REQ-103-3. A "Landscape only" comic gets a landscape cover only; the landing page shows the portrait cover if there is one, otherwise the landscape one.
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
- Statement: the comic page lists characters with the panels they appear in. For a panel whose image has a position for the character but no stored crop of the character yet, it can preview a crop of that character from the panel image.
- Why: character consistency across panels.
- Proven by: tagged tests

### REQ-101-1 The comic page shows each character's stored images

- Status: active
- Statement: on the comic page, each character's section shows the head crop of each stored character image, one per panel that still exists, in panel order (the most recent one if a panel image was generated more than once). Each crop's alt text names the character and the panel ("<name> in panel <n>: <editorial title>"). Activating a head crop shows that image's full-body crop. A character with no stored images shows "No images yet".
- Why: to check that a character looks the same across panels, all of a character's images must be visible in one place.
- Proven by: tagged tests

### REQ-219-1 A character crop can be fixed with AI

- Status: active
- Statement: on the comic page, every head crop in a character's gallery whose panel has an image offers a "Fix crop" button inside its expanded `<details>`. Activating it asks the AI for new head and full-body boxes for that character in the panel's current image, and replaces both stored crops of that character image. The gallery still shows one crop for the panel, and the panel page shows the fixed head next to that character's dialogue.
- Why: a crop is sometimes off (for example only part of the face), and the user shouldn't have to regenerate the panel image to correct it.
- Proven by: tagged tests

### REQ-219-2 A crop fix can be undone one step

- Status: active
- Statement: after a crop fix, that crop offers "Undo crop fix", which puts the previous head and full-body crops back. It survives a reload. Fixing the same crop again replaces the stored previous version, so undo always goes back exactly one step. After an undo, the undo button is gone.
- Why: a fix can make the crop worse; it must be reversible without losing the earlier crop.
- Proven by: tagged tests

### REQ-219-3 Crop fixes leave no stray files

- Status: active
- Statement: an undo removes the fixed crop's image files. A second fix removes the files of the version it replaces as "previous". Deleting the panel or restoring its image (REQ-049) also removes the previous-version files of the crops it drops.
- Why: image files never leak (REQ-025).
- Proven by: tagged tests

### REQ-219-4 A failed crop fix changes nothing

- Status: active
- Statement: if the crop fix fails (an AI provider error, or a response whose boxes are invalid or outside the image), the usual error is shown, both crops stay unchanged and no undo is offered.
- Why: a failed fix must never damage a crop the user already has.
- Proven by: tagged tests

### REQ-047 Deleting a panel removes its character images

- Status: active
- Statement: deleting a panel also removes every character image (head and full crop) taken from that panel, and their image files. The characters stay, as do their images from other panels.
- Why: the comic must not keep crops of a panel that no longer exists, and the files must not stay on disk (REQ-025).
- Proven by: tagged tests

## Panel page

### REQ-015 A panel image can be generated

- Status: active
- Statement: on a panel without an image, the user can generate one (optionally with instructions, and with character references from other panels as in REQ-100-1).
- Why: the comic's visuals.
- Proven by: tagged tests

### REQ-100-1 A panel image form offers character references from other panels

- Status: active
- Statement: on a panel's image form (generate or replace), for each character in that panel's dialogue that has a stored crop from a different panel, the user can choose one of those panels as the character's reference, or none (the default); characters without such a crop aren't listed, and if no character qualifies the picker isn't shown.
- Why: characters stay consistent across panels (same clothes, hair colour, face).
- Proven by: tagged tests

### REQ-100-2 Chosen character references are sent to the image model

- Status: active
- Statement: generating a panel image with chosen character references sends each chosen character's full-body crop to the image model together with the prompt (and the current image, if "include current image" is ticked); with no reference chosen, the request is the same as today.
- Why: the model can only keep a character consistent if it sees the earlier look.
- Proven by: tagged tests

### REQ-016 A panel image can be replaced

- Status: active
- Statement: on a panel with an image, the user can generate a new image that replaces it.
- Why: users iterate on panels.
- Proven by: tagged tests

### REQ-172-1 The current-image preview has valid dimension attributes

- Status: active
- Statement: the current-image preview on the panel image form (panel page) is an `<img>` whose `width` and `height` attributes are the bare integers `50` and `75` (the 2:3 ratio of generated portrait images), and it renders 50 CSS px wide. It uses the portrait variant if the panel image has one (also for "include current image"); otherwise it uses the landscape variant with `width="75"` and `height="50"`, rendered 75 CSS px wide.
- Why: `50px` and `auto` are invalid HTML, so the browser drops `height` and can't reserve space before the image loads.
- Proven by: tagged tests

### REQ-103-2 A panel image is generated once per variant the image format asks for

- Status: active
- Statement: generating a panel image makes one image request per variant the comic's image format asks for: portrait first, then landscape with the new portrait image as reference (no reference if the portrait failed); a portrait-only or landscape-only comic makes one request. Each variant is stored, so the panel page shows the portrait and the landscape image of a "Portrait and landscape" comic and only the chosen one otherwise. Every other rule for panel images (REQ-015, REQ-016, REQ-025, REQ-185-1, REQ-185-2, REQ-049, REQ-162-1) applies per variant.
- Why: each screen shape gets an image made for it, and the landscape one matches the portrait one (#103).
- Proven by: tagged tests

### REQ-103-3 A panel image keeps the variant that succeeded

- Status: active
- Statement: if one variant's request fails (after the REQ-185-1 retry) and the other succeeds, the successful variant is saved and the error region says which variant couldn't be created; if all fail, nothing is saved.
- Why: one failed request shouldn't throw away a paid-for image (#103).
- Proven by: tagged tests

### REQ-103-4 The panel page labels each stored variant of the panel image

- Status: active
- Statement: the panel page shows every stored variant of the panel image, each with a visible "Portrait" or "Landscape" caption.
- Why: the user must see which variants a panel has (#103).
- Proven by: tagged tests

### REQ-103-5 The viewer shows the variant that fits the screen

- Status: active
- Statement: in the viewer (`/comic/<id>/view`) a panel with both variants is a `<picture>` that shows the landscape image when the viewport is landscape and the portrait image otherwise; a panel with one variant shows that one at every size.
- Why: readers get an image that fits their screen (#103).
- Proven by: tagged tests

### REQ-279-1 A panel page offers to create a missing image variant

- Status: active
- Statement: on the panel page, when the comic's image format asks for a variant the panel image lacks (images made before #103, a partial failure, or a format changed later), a "Create landscape image" or "Create portrait image" button generates only that variant, using the existing variant as reference, and keeps the existing one. No such button is offered when the panel image has every variant the format asks for, or when the panel has no image. A failed request shows the error and leaves the panel image unchanged.
- Why: users shouldn't have to replace a whole image to get the variant they lack (#279).
- Proven by: tagged tests

### REQ-279-2 Either variant of a panel image can be removed alone

- Status: active
- Statement: on the panel page, a panel image with two variants offers "Remove portrait image" and "Remove landscape image"; removing one keeps the other and deletes the removed file from OPFS (REQ-025). With one variant left, "Remove image" (REQ-017) applies. Neither makes a restore point (REQ-048).
- Why: users can drop the variant they don't want without losing the other (#279).
- Proven by: tagged tests

### REQ-279-3 Character crops follow the variant that is created or removed

- Status: active
- Statement: creating a missing portrait variant replaces the character crops taken from the landscape one with crops from the new portrait image; removing the portrait variant of a panel image with both moves its crops to the landscape one (REQ-018). The replaced crop files are deleted (REQ-025).
- Why: crops come from the portrait variant if there is one, otherwise from the landscape one (#103, #279).
- Proven by: tagged tests

### REQ-280-1 The comic page shows, creates and removes cover variants

- Status: active
- Statement: the comic page shows every stored cover variant with a visible "Portrait" or "Landscape" caption. When the comic's image format asks for a variant the cover lacks (an example comic, a partial failure, or a format changed later), "Create portrait cover" or "Create landscape cover" generates only that variant, using the existing one as reference, and keeps the existing one. A cover with two variants offers "Remove portrait cover" and "Remove landscape cover"; removing one keeps the other and deletes the removed file from OPFS (REQ-025). With one variant left, "Delete Cover" (REQ-012) applies.
- Why: users see which variants a cover has and can add or drop one without losing the other (#280).
- Proven by: tagged tests

### REQ-280-2 The viewer shows the cover variant that fits the screen

- Status: active
- Statement: in the viewer (`/comic/<id>/view`) a cover with both variants is a `<picture>` that shows the landscape cover when the viewport is landscape and the portrait cover otherwise; a cover with one variant shows that one at every size.
- Why: readers get a cover that fits their screen (#280).
- Proven by: tagged tests

### REQ-017 A panel image can be removed

- Status: active
- Statement: removing a panel image leaves the panel without an image and offers to generate one.
- Why: users can start a panel image over.
- Proven by: tagged tests

### REQ-018 Generated panel images produce character crops

- Status: active
- Statement: generating a panel image also stores head and full-body crops for each known character in it, and the head crop is shown next to that character's dialogue. Crops are cut from the portrait variant if the panel image has one, otherwise from the landscape one (also for REQ-014 previews and crop fixes).
- Why: character references for later images.
- Proven by: tagged tests

### REQ-048 A replaced panel image can be restored

- Status: active
- Statement: after a panel image is replaced, the panel page offers "Restore previous image", which brings back the image shown just before the latest replacement, with all the variants it had. It is a single step: once restored, or once the panel image is replaced again, removed, or the panel or comic deleted, only the newest previous image or none is kept. It survives a reload. A panel image that was never replaced offers nothing to restore.
- Why: a worse new image shouldn't destroy the one the user had.
- Proven by: tagged tests

### REQ-049 Restoring a panel image drops the crops of the replaced image

- Status: active
- Statement: restoring a previous panel image removes the character crops created from the replaced image and keeps the crops from earlier images, so dialogue heads match the image that's shown.
- Why: crops of an image that is gone would be stray files and wrong references.
- Proven by: tagged tests

### REQ-162-1 Dialogue heads show the crop from the current panel image

- Status: active
- Statement: after a panel image is replaced, the head crop shown next to each dialogue line is the one created from the current panel image, not one from an earlier image of that panel.
- Why: the head must match the image that's shown.
- Proven by: tagged tests

### REQ-176-1 Focus moves to "Generate new image" after restoring a panel image

- Status: active
- Statement: after "Restore previous image" succeeds on the panel page, keyboard focus moves to that panel's "Generate new image" button instead of falling to the document body. If the restore fails, nothing changes and focus stays on the restore button.
- Why: WCAG 2.4.3 (Focus Order); the restore button unmounts, and keyboard and screen-reader users must keep their place.
- Proven by: tagged tests

### REQ-176-2 Focus moves to "Add image" after removing a panel image

- Status: active
- Statement: after "Remove Image" succeeds on the panel page, keyboard focus moves to that panel's "Add image" button instead of falling to the document body. If the removal fails, nothing changes and focus stays on the remove button.
- Why: WCAG 2.4.3 (Focus Order); the image block is replaced by the "Add image" form, and keyboard and screen-reader users must keep their place.
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

### REQ-021 A generated panel can be inserted after any panel or before the first

- Status: active
- Statement: from the panel list on the panel page, the user can generate a new panel and insert it after any panel, or before the first panel; each insertion point is offered exactly once.
- Why: users extend the story, and a duplicate button for the same position only adds noise.
- Proven by: tagged tests

### REQ-237-1 "Add Panel after panel N" inserts at position N+1

- Status: active
- Statement: generating a panel with "Add Panel after panel N" inserts the new panel at position N+1 (it becomes panel N+1, the old panel N+1 moves to N+2), and the order survives a reload.
- Why: the button used to insert before panel N, so a panel could not be added at the end.
- Proven by: tagged tests

### REQ-190-1 A panel without a title still has a named navigation link

- Status: active
- Statement: in the panel list on the panel page, a panel whose `editorialTitle` is empty has a navigation link named "Panel <number>", so the page has no axe `link-name` violation.
- Why: a link with no text is unusable for screen-reader users; generated panels can have empty titles.
- Proven by: tagged tests

### REQ-238-1 Each panel in the panel list is a card with an image and a title

- Status: active
- Statement: in the panel list on the panel page, each panel is a card whose single link shows the panel's stored image (an `<img>` with empty alt) or, without one, a same-size CSS placeholder hidden from assistive technology (no text, no `<img>`), and the panel's number and title; the link is named "Panel <number> <title>" ("Panel <number>" alone when the title is empty, REQ-190-1).
- Why: users recognise a panel by its picture faster than by a text link; the number and title already name the link, so the image adds no screen-reader noise.
- Proven by: tagged tests

### REQ-238-2 The panel list is a vertical sidebar from 48em and a horizontal row below

- Status: active
- Statement: on the panel page, from 48em the panel list is one vertical column in a sidebar beside the panel; below 48em it is one horizontal row above the panel that scrolls inside its own box (the document never gets wider than the viewport). At every width the current panel's card is scrolled into view on load and is the only link marked `aria-current="page"`, and a card focused by keyboard is scrolled into view.
- Why: a long story would otherwise push the panel itself far down the page, and the user must see which panel they are on.
- Proven by: tagged tests

### REQ-298-1 The panel page shows the panel's position above its heading

- Status: active
- Statement: the panel page shows "Panel <number> of <total>" above a heading that is the panel's title ("Panel <number>" when the title is empty).
- Why: the user sees where they are in the story and what the panel is called (#298).
- Proven by: tagged tests

### REQ-298-2 The panel page links to the previous and next panel

- Status: active
- Statement: the panel page has a "Prev" link to the previous panel and a "Next" link to the next one (arrows are decorative and hidden from assistive tech); on the first (last) panel, Prev (Next) is shown but is not a link and is marked `aria-disabled="true"`.
- Why: stepping through panels should not need the panel list (#298).
- Proven by: tagged tests

### REQ-298-3 The panel page links to the reader

- Status: active
- Statement: the panel page has a "Read comic" link to `/comic/<id>/view`.
- Why: the user can go from editing a panel to reading the comic in one step (#298).
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
- Statement: on `/settings` or in the start page's welcome section (REQ-234-1), the user enters an OpenAI API key; it is stored (HTTP-only cookie) only after the provider accepts it. A rejected key shows an error and keeps any previous key.
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

### REQ-234-1 A new visitor is welcomed with the key form on the start page

- Status: active
- Statement: when no API key is stored and every comic in the library is a bundled example, `/` shows a welcome section above the comic list with one sentence on why a key is needed and the API key form; the comic list stays below it.
- Why: a new visitor otherwise doesn't know that nothing works until a key is added in Settings (#234).
- Proven by: tagged tests

### REQ-234-2 The welcome section hides once it has served its purpose

- Status: active
- Statement: when an API key is stored, or the library holds at least one comic the user created, `/` shows no welcome section.
- Why: the section is for users who can't create a comic yet; others don't need it (#234).
- Proven by: tagged tests

### REQ-234-3 A key can be saved from the welcome section

- Status: active
- Statement: saving an accepted key in the welcome section replaces the form with "Key saved. You can now create a comic." and a "Create new comic" link; a rejected key shows the invalid-key message and keeps the form.
- Why: the user can go straight from the first visit to creating a comic (#234).
- Proven by: tagged tests

### REQ-234-4 Settings shows whether a key is saved

- Status: active
- Statement: the "OpenAI API key" card heading on `/settings` has a text badge, "Key saved" when a key is stored and "No key yet" otherwise (same text at every width). When a key is stored, `/settings` also shows "A key is saved. Enter a new one to replace it." above the key field as helper text; without a key it doesn't. The key itself is never shown.
- Why: users can't otherwise tell whether a key is already stored (#234).
- Proven by: tagged tests

### REQ-234-5 Settings uses plain labels

- Status: active
- Statement: on `/settings` the key card is headed "OpenAI API key" and its field is labelled "OpenAI API key", as on the start page (placeholder "sk-…") with a hint on where the key is stored and where to get one, the key button is "Save key", the "AI models" card has "Text model" and "Image model" selects, each with a helper, and a "Save models" button, when no key is stored the card shows "Add your API key above to choose models.", and the instructions card's button is "Save instructions". The copy is in both locales.
- Why: "BYOK", "Add" and "Config" don't say what they mean (#234).
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
- Statement: while a form submission runs (except panel image generation, which shows the overlay of REQ-301-1 instead), the global loader shows an indeterminate progress bar (a `<progress>` with no value, named by the label) and a label naming the action, e.g. "Generating panel image...".
- Why: AI calls take seconds to half a minute; users can't tell what is running or whether it is stuck.
- Proven by: tagged tests

### REQ-042 A running submission shows the seconds elapsed

- Status: active
- Statement: while a form submission runs (except panel image generation, REQ-301-1), the global loader shows the whole seconds elapsed since submit ("0 s", "1 s", …), updated every second; the bar, label and timer disappear when the submission finishes, whether it succeeds or fails.
- Why: a ticking counter shows the action is alive and how long it has taken.
- Proven by: tagged tests

### REQ-043 Screen readers hear the start and the end, not the ticks

- Status: active
- Statement: a screen reader hears the action's label when a submission starts (panel image generation: the overlay's announcement, REQ-301-5) and "Done" when it succeeds; the elapsed seconds are not inside a live region, and "Done" is not announced when the submission fails (the error is).
- Why: a counter inside a live region would be read out every second.
- Proven by: tagged tests

## Security

### REQ-033 Routes accept only the actions their forms use

- Status: active
- Statement: each page accepts POSTs only to the form actions its own forms use (the start page: delete and the key form); any other action name returns 404.
- Why: limits what a crafted request can trigger (e.g. no AI generation from the settings page).
- Proven by: tagged tests

## Generation API

### REQ-71-1 Generation steps are available as stateless JSON endpoints

- Status: active
- Statement: `POST /api/generate/comic`, `/api/generate/cover-image`, `/api/generate/panel` and `/api/generate/panel-image` accept a JSON body with the same fields as the matching form contract and return the same result as the matching form action, as JSON with status 200; they store nothing on the server.
- Why: scripts (e.g. a nightly comic, #230) need to drive generation without the UI (#71).
- Proven by: tagged tests

### REQ-71-2 Generation endpoints take the OpenAI key only from the Authorization header

- Status: active
- Statement: each generation endpoint reads the OpenAI key only from an `Authorization: Bearer <key>` header; a request without one (or with a non-Bearer one, even with a key cookie) gets 401 with a JSON `{ code, message }` and no AI request is made, and the key never appears in a response.
- Why: no server key or cookie fallback, so nobody can spend someone else's credits, and a cross-site page can't trigger generation (#71).
- Proven by: tagged tests

### REQ-71-3 Generation endpoint failures are readable JSON

- Status: active
- Statement: generation endpoint failures are JSON `{ code, message }` (plus `fieldErrors` for invalid input) with the same codes and HTTP statuses as the form actions (400 `invalid_input`, 401 `provider_auth`, 429 `rate_limited`, 502 `ai_no_image` / `invalid_ai_response`, 502 for unexpected provider failures), never HTML, raw provider JSON or "Internal Error".
- Why: scripts need stable codes to react to, and the failures must stay as readable as in the forms (#71).
- Proven by: tagged tests

## Accessibility

### REQ-035 Every view passes an axe scan

- Status: active
- Statement: every view (landing, create, comic, view, panel, raw, not found, settings) has no axe violations, in both the light and the dark colour scheme: each has a page title, a main landmark, labelled form controls and sufficient colour contrast.
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
- Statement: at a viewport 320 CSS px wide, no view (landing, create, comic, view, panel, raw, not found, settings) scrolls horizontally: the document is no wider than the viewport, and long content such as the raw JSON wraps or scrolls inside its own box. On the comic page only the panel strip scrolls sideways, inside its card.
- Why: WCAG 1.4.10 (Reflow); users on narrow screens or at high zoom must not have to scroll in two directions.
- Proven by: tagged tests

## Appearance

### REQ-044 Every view except the viewer follows the OS/browser colour scheme

- Status: active
- Statement: every view except the viewer (REQ-299-1) follows the colour scheme the OS or browser asks for (`prefers-color-scheme`). With a dark preference it shows light text on a dark background and native controls render dark (`color-scheme`); it updates when the preference changes, without a reload. With a light (or no) preference it shows dark text on a light background. There is no toggle and nothing is stored. The viewer and the downloaded file are always dark (`color-scheme: dark`) in both schemes on screen; printed, they use white paper (REQ-89-2).
- Why: users with a dark system setting otherwise get a bright white page; the reader is a dark stage by design (#299).
- Proven by: tagged tests

### REQ-294-1 Every view has a header with the Tusch wordmark

- Status: active
- Statement: every view except the viewer has a header (`<header>` banner landmark, outside `<main>`) holding a "Tusch" link that leads to `/`. The viewer has its own header instead (REQ-299-1); REQ-294-2 to REQ-294-4 don't apply to it.
- Why: users can always get back to the start, and the header is the shared frame of the design (#294).
- Proven by: tagged tests

### REQ-294-2 The header has main navigation on wide screens

- Status: active
- Statement: at 48em and wider the header has a navigation landmark with a "Comics" link (`/`) and a "Settings" link (`/settings`); the link for the current page has `aria-current="page"` and the other has none. On `/` the header also has a "Create New Comic" link to `/comic/create`.
- Why: the main places are one activation away from every view, and the current place is announced (#294).
- Proven by: tagged tests

### REQ-294-3 The header switches language on wide screens

- Status: active
- Statement: at 48em and wider the header has a language navigation landmark with EN and SV links (accessible names "English" and "Swedish"). Activating one shows the same page in that language, and the link for the current language has `aria-current="true"`.
- Why: the language was reachable only by editing the URL (#294).
- Proven by: tagged tests

### REQ-294-4 The header shows icon links on narrow screens

- Status: active
- Statement: below 48em the header shows only the wordmark, a "Create New Comic" icon link and a "Settings" icon link; the navigation and language links are hidden. The icons are hidden from assistive technology and the links are named by `aria-label`. Both links can be reached with Tab and lead to `/comic/create` and `/settings`.
- Why: a full navigation doesn't fit at 320 px, but the two main actions must stay reachable (#294).
- Proven by: tagged tests

### REQ-294-5 Fonts load from the app's own origin

- Status: active
- Statement: no view makes a request to a host other than the app's, so fonts are self-hosted.
- Why: a third-party font host sees every visitor's IP address, adds a render-blocking request and fails offline in a local-first app (#294).
- Proven by: tagged tests

### REQ-294-6 Form fields are at least 16 px on narrow screens

- Status: active
- Statement: at a viewport 320 CSS px wide, every text input, textarea and select on the create and settings views has a computed font size of at least 16 CSS px.
- Why: smaller field text makes iOS Safari zoom the page when a field gets focus (#294).
- Proven by: tagged tests

## Performance

### REQ-039 Core views meet the web vitals budget

- Status: active
- Statement: the landing, comic and panel views, audited by Lighthouse (desktop preset) on the production build, meet LCP ≤ 2.5 s, CLS ≤ 0.1 and TBT ≤ 200 ms (median of 3 runs). A view that exceeds a budget fails the check, and the failure names the view and the metric.
- Why: nothing else stops a change from making the app slow or visually unstable. TBT is the lab proxy for INP, which Lighthouse navigation audits can't measure.
- Proven by: tagged tests

### REQ-296-1 The create page links back to the comics

- Status: active
- Statement: the create page has a "Back to comics" link to `/` between the header and the `<h1>`, at every width.
- Why: users who opened the form by mistake need a way out that is visible on the page.
- Proven by: tagged tests

### REQ-296-2 The create form ends with a key note, Settings and Cancel links and a submit button

- Status: active
- Statement: the create form ends with a "Needs an OpenAI key" note with a "Settings" link to `/settings`, a "Cancel" link to `/` (creating no comic) and a "Create comic" submit button; below 48em the Cancel/Create row is sticky at the bottom of the viewport, so the button is visible without scrolling at 390 px.
- Why: the form's exits and the key requirement are visible where users finish the form, and on a phone the submit stays in reach.
- Proven by: tagged tests

### REQ-296-3 The URL and story fields have their own helper text

- Status: active
- Statement: the URL and story fields each have their own helper text as their accessible description, and both labels say "(optional)".
- Why: each field explains itself, and users see that neither is required on its own.
- Proven by: tagged tests

### REQ-299-1 The viewer has its own sticky header

- Status: active
- Statement: the viewer has one sticky header (`<header>` banner landmark) with a "Back to editing" link to `/comic/<id>`, the comic title (or "Untitled comic") as plain text, not a heading, on one line with an ellipsis, and a "Download comic" link (`<a download>`). It has no "Tusch" wordmark and no main navigation, and stays visible at the top while scrolling. Below 48em both links are 44 px icon links named by `aria-label`, with the icons hidden from assistive technology.
- Why: the reader is a stage of its own; the way out and the download stay in reach on a long comic (#299).
- Proven by: tagged tests

### REQ-299-2 The viewer ends with an ending block

- Status: active
- Statement: after the last panel the viewer shows an ending block with "The end", the panel count ("1 panel" / "N panels"), and the links "Download comic" (the same file as the header link), "Back to editing" (`/comic/<id>`) and "All comics" (`/`). A decorative "·" and arrow are hidden from assistive technology.
- Why: readers reach an end and know where to go next (#299).
- Proven by: tagged tests

### REQ-300-1 Model controls are disabled without a key

- Status: active
- Statement: when no key is stored, the text and image model selects and "Save models" on `/settings` are disabled, and each select is described (`aria-describedby`) by the no-key hint; with a key stored they are enabled.
- Why: a user without a key can't choose a model, so the controls say so instead of offering an empty list (#300).
- Proven by: tagged tests

### REQ-300-2 Global instructions show a live character counter

- Status: active
- Statement: the global instructions field on `/settings` shows a counter "<n> of 1000" that follows what is typed, is linked to the field with `aria-describedby` and is not a live region; above 1000 it uses the danger colour (saving is still rejected, REQ-052).
- Why: users see how much of the limit they have used before saving (#300).
- Proven by: tagged tests

### REQ-301-1 Generating a panel image opens a progress dialog

- Status: active
- Statement: starting a panel image generation ("Generate new image", "Create portrait image" or "Create landscape image") opens a modal dialog named "Generating image…" with the subtitle "Panel <n>", the panel title (omitted if empty) and the variants being made, an `mm:ss` timer counting up from 0:00 once a second, a progress bar named "Generating image", a note and a "Cancel generation" button. No global loader bar, label or seconds timer shows meanwhile. The dialog closes when the request succeeds or fails; a failure shows the error as before.
- Why: a panel image takes 1-2 minutes; the user needs to see progress, what is being made and a way out (#301).
- Proven by: tagged tests

### REQ-301-2 The dialog holds focus and ignores Escape

- Status: active
- Statement: while the dialog is open the panel page behind it can't be focused or activated, Tab stays inside the dialog and Escape does nothing. When it closes, focus returns to the button that started it, or to the panel heading if that button is gone.
- Why: a stray key must not throw away a paid image, and keyboard users keep their place (#301).
- Proven by: tagged tests

### REQ-301-3 Cancel generation aborts the request and keeps the panel as it was

- Status: active
- Statement: "Cancel generation" aborts the request in the browser and closes the dialog: the panel image, its variants and the restore point (REQ-048) are unchanged and no error is shown.
- Why: the user can back out of a long wait without losing anything (#301). The server's call is not stopped (#315).
- Proven by: tagged tests

### REQ-301-4 Leaving the panel page aborts the generation

- Status: active
- Statement: leaving the panel page while the dialog is open (in-app navigation or browser Back) aborts the request with no prompt; back on the panel, nothing from that request was saved.
- Why: the generation belongs to the page that started it; a prompt would add friction for no gain (#301).
- Proven by: tagged tests

### REQ-301-5 Screen readers hear one announcement, not the timer

- Status: active
- Statement: a screen reader hears "Generating image. This can take a couple of minutes." once when the dialog opens; the timer (`role="timer"`) is not inside a live region.
- Why: a ticking counter in a live region would be read out every second (REQ-043).
- Proven by: tagged tests

### REQ-301-6 Reduced motion slows the spinner and stills the bar

- Status: active
- Statement: with `prefers-reduced-motion: reduce` the dialog's spinner turns once per 2.4 s and the progress bar has no animation.
- Why: motion-sensitive users get a calmer indicator that still shows work is running (#301).
- Proven by: tagged tests

### REQ-306-1 The comic style is a radio group of cards

- Status: active
- Statement: on `/comic/create` the comic style is a required radio group (`<fieldset>` with legend "Comic style") of eleven cards, Anime, Classic Marvel, Franco-Belgian, Manga, Noir, Newspaper strip, Watercolour storybook, Webtoon, Pop art, Ukiyo-e and Custom in that order, each with its name and a one-line description; Anime is checked by default and the checked card has a visibly thicker dark border. Arrow keys move the choice and Tab leaves the group in one stop.
- Why: the styles are compared side by side, with native radio semantics and keyboard behaviour (#306).
- Proven by: tagged tests

### REQ-306-2 The style cards form a full-width grid

- Status: active
- Statement: the style cards are a grid of three per row at every width, filling the form's width with a gap between them; the eleven cards make rows of 3, 3, 3 and 2, each row filling the form's width from its first column; the checked style is sent as `style` and the created comic has that style.
- Why: more styles are coming, so the cards wrap instead of changing layout (#306).
- Proven by: tagged tests

### REQ-307-1 The story field shows a live character counter

- Status: active
- Statement: the story field on `/comic/create` shows a counter "<n> of 10,000" (sv-se "<n> av 10 000", numbers grouped by locale) to the right of its label, starting at 0. It follows what is typed or pasted, is linked to the field with `aria-describedby` after the helper text, and is not a live region (neither it nor an ancestor has `role="status"` or `aria-live`; the label's accessible name doesn't include the count). Above 10,000 it uses the danger colour, and submitting is still rejected (REQ-007).
- Why: users see the story limit before they submit (#307).
- Proven by: tagged tests

### REQ-89-1 Printing uses A4 portrait pages with one panel per page

- Status: active
- Statement: printing the viewer or the downloaded file uses A4 portrait pages: the cover with its title box on page 1, then each panel on a page of its own, scaled to fit within the page with its caption and speech boxes still over the image. No cover or panel is split across pages.
- Why: readers can print a comic on paper so it looks like a printed comic (#89).
- Proven by: tagged tests

### REQ-89-2 Printed pages are white with dark text

- Status: active
- Statement: printed, the viewer and the downloaded file have a white page background and dark text, images in colour, caption and speech boxes with their screen look, and cover or panel placeholders drawn as an outlined frame with no fill.
- Why: white paper and no fills save ink and stay readable (#89).
- Proven by: tagged tests

### REQ-89-3 Printing hides the viewer's chrome

- Status: active
- Statement: printed, the viewer's sticky header and the ending block's links are hidden; "The end" and the panel count are still printed. There is no print control (REQ-87-3); users print with the browser.
- Why: screen controls mean nothing on paper (#89).
- Proven by: tagged tests

### REQ-89-4 Printing shows the portrait variant

- Status: active
- Statement: printed, a cover or panel with both variants shows the portrait one, in the viewer and the downloaded file, whatever the page orientation.
- Why: the pages are portrait, so the portrait image fits them (#89).
- Proven by: tagged tests

### REQ-311-1 The nested comic views show a breadcrumb in the header

- Status: active
- Statement: the comic overview (`/comic/<id>`) and the panel page (`/comic/<id>/<panel>`) show a breadcrumb in the header as a second row under the wordmark row at every width: a `<nav aria-label="Breadcrumb">` holding an `<ol>`. The overview reads "Comics / <title>", the panel page "Comics / <title> / Panel <position>" (1-based, as in the panel list). "Comics" links to `/`, the title (when not current) links to `/comic/<id>`, and the last item is bold plain text, not a link, with `aria-current="page"`. The "/" separators are `aria-hidden`.
- Why: users see where they are and can go up a level (#311).
- Proven by: tagged tests

### REQ-311-2 A breadcrumb title is one line, and an empty title is named

- Status: active
- Statement: a breadcrumb title is cut to one line with an ellipsis and the full title stays its accessible name; an empty title shows "Untitled comic".
- Why: a long title must not push the header taller or off the 320 px screen (#311).
- Proven by: tagged tests

### REQ-311-3 Other views have no breadcrumb

- Status: active
- Statement: `/`, `/comic/create`, `/settings`, the viewer and the not-found page have no "Breadcrumb" navigation.
- Why: they are top level, one level below home with their own back link, or have their own header (#311).
- Proven by: tagged tests

### REQ-311-4 The panel page has no "Back to Comic" link

- Status: active
- Statement: the panel page has no "Back to Comic" link; the breadcrumb's title link replaces it.
- Why: one way up, not two (#311).
- Proven by: tagged tests

### REQ-93-1 The app has a web app manifest and icons

- Status: active
- Statement: every page links a web app manifest (`<link rel="manifest">`, plus a `theme-color` meta) with name and short name "Tusch", `display: standalone`, start URL `/`, theme and background colours, and 192 px, 512 px and maskable PNG icons and an SVG icon, each of which returns an image.
- Why: the browser offers to install Tusch as an app (#93).
- Proven by: tagged tests

### REQ-93-2 The app opens offline after one online visit

- Status: active
- Statement: a service worker caches the built app shell and static files on install, so after one online visit the landing page, a comic, a panel page and the viewer load and show stored comics, their titles, panels and images, with the network off.
- Why: Tusch is local-first, so reading comics must not need a network (#93).
- Proven by: tagged tests

### REQ-93-3 The service worker leaves other requests to the network

- Status: active
- Statement: the service worker handles only same-origin `GET` requests for build and static files, page navigations and the `__data.json` of pages outside `/settings` and `/api` (network first, the last online copy as fallback; it holds only the `hasKey` flag, never the key). Form posts (`?/…`), `/api/…`, `/settings` and every other request go to the network untouched, so an AI action offline shows the existing error and leaves the comic unchanged, and `page.route` mocks still apply.
- Why: the API key and AI results must never be cached or touched by the worker (REQ-029), and tests must be able to mock requests (#93).
- Proven by: tagged tests

### REQ-93-4 A new service worker takes over and deletes old caches

- Status: active
- Statement: a new service worker takes over on the next load without a prompt and deletes the caches of older versions, so only the current version's cache exists.
- Why: a deploy must not leave stale files or unbounded storage behind (#93).
- Proven by: tagged tests

### REQ-97-1 Custom style shows a described text area with a counter

- Status: active
- Statement: when the Custom style card is checked on `/comic/create`, a required text area "Describe your style" appears below the style cards with a live counter "<n> of 500" that works like the story's (REQ-307-1). It is hidden, and its text is not sent, while a preset style is checked; switching back to a preset creates a comic with that style and no description.
- Why: users can describe their own style in words (#97).
- Proven by: tagged tests

### REQ-97-2 A custom style description must be 10 to 500 characters

- Status: active
- Statement: submitting with Custom checked and a description that is empty, shorter than 10 or longer than 500 characters (after trimming) shows a field error on the text area ("Describe your style in at least 10 characters" or "Keep the description to 500 characters or fewer") and sends no generation request.
- Why: a useful, bounded description reaches the prompt (#97).
- Proven by: tagged tests

### REQ-97-3 A custom style replaces the preset rules in every generation

- Status: active
- Statement: a comic created with Custom stores the description (`style: 'custom'`, `customStyle`), and the description replaces the preset style rules in the prompt of every generation for that comic: create comic, cover, panel images and insert panel, including images made later. Global instructions (REQ-051) still follow it.
- Why: every image of the comic follows the user's own style (#97).
- Proven by: tagged tests

### REQ-97-4 A custom style is shown as Custom with its description

- Status: active
- Statement: a comic with a custom style shows "Custom" as its style on its library card (REQ-295-1) and in "Comic settings" on its page, where the description is shown under it. It can't be edited there.
- Why: users see which style a comic has (#97).
- Proven by: tagged tests
