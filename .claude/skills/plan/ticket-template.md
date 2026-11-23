Keep the whole ticket under about 60 lines. Say each thing once; link
`docs/requirements.md` and the code instead of copying them.

## Problem / idea

<What the user wants and why, in at most three sentences.>

## Requirements

- REQ-0xx (existing; unchanged), one line each, no restating
- Changes REQ-0xx: <new statement> (only if behaviour changes)
- Removes REQ-0xx (only if obsolete)
- REQ-NEW: <one-sentence statement> (the tester assigns the id)

## Acceptance criteria

One line each; each becomes one E2E test tagged with its requirement.

- [ ] Given <state>, when <action>, then <observable result>. (REQ-…)

## Copy

<Only when text changes: a table of key, en, sv-se. Omit otherwise.>

## Views affected

<Views whose screenshot baselines should change, e.g. `landing`. "None" if no UI change.>

## Out of scope

<One line per item.>

## Notes for the tester and developer

<At most 5 pointers: files to start from, mock markers, risks.>
