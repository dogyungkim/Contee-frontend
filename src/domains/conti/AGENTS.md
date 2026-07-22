# CONTI DOMAIN

## OVERVIEW

Owns conti listing, draft creation and editing, publishing, team/external sharing,
sheet-music upload/download, and combined PDF export. It coordinates team
permissions and song-library data but keeps the conti workflow authoritative.

## STRUCTURE

| Workflow              | Primary paths                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Existing-conti editor | `hooks/use-conti-editor.ts`, `components/conti-edit-container.tsx`                                |
| New-conti editor      | `hooks/use-new-conti-form.ts`, `src/app/(dashboard)/dashboard/contis/new/page.tsx`                |
| Draft normalization   | `utils/conti-editor.js`, `utils/worship-time.ts`                                                  |
| Sharing               | `hooks/use-conti-sharing.ts`, `components/conti-share-*`, `src/app/share/contis/[token]/page.tsx` |
| PDF/export            | `hooks/use-conti-pdf-download.ts`, `utils/conti-pdf.js`                                           |

## WHERE TO LOOK

- Detail permission and view/edit routing: `components/conti-detail-container.tsx`.
- List filtering, pagination, and edit visibility: `components/conti-list.tsx`.
- Publish/share/export composition: `components/conti-detail-view.tsx`.
- Public-share contract and exposure decisions: `CONTI_SHARE_PRD.md`.
- Behavior tests: `tests/conti-editor.test.mjs`, `tests/conti-sharing.test.mjs`,
  and `tests/conti-pdf.test.mjs`.

## CONVENTIONS

- Existing songs keep persisted IDs; unsaved songs use `draft-song-*`. Requests
  distinguish persisted conti songs, selected `teamSongId` entries, and brand-new
  embedded songs. Always renumber `orderIndex` from current visual order.
- Compare normalized drafts, not object identity. Edit-mode query changes must
  preserve unrelated parameters; Bible verse and worship-time parsing stay in utilities.
- Guard navigation whenever metadata, songs, or staged sheet-music operations differ.
  Cancel resets all three; do not mutate the query-owned `Conti` object in place.
- Save the conti first, resolve new saved song IDs by order, then upload/delete staged
  sheet files. Keep partial-file failure reporting and refetch detail after operations.
- Team links target authenticated `/dashboard/contis/{id}`. External links use a
  token and the separate `SharedConti` model; the public route remains read-only and
  must not expose team, permission, edit, or internal-only fields.
- External sharing requires a published, saved conti. UI manager policy is
  `OWNER`/`ADMIN`; block enablement while editor changes are unsaved.
- PDF source precedence is uploaded `sheetMusicFile.downloadUrl`, conti override,
  then team-song URL. Preserve conti order, safe API URL checks, per-source timeout,
  partial merges, sanitized filenames, and Korean metadata rendering.
- Use `contiKeys`: create invalidates the team list; update sets/refetches detail and
  invalidates its team list; publish sets detail and invalidates its team list;
  external-share mutations patch detail and invalidate the team list; delete clears
  the conti family. Sheet-file mutations explicitly refetch detail.

## ANTI-PATTERNS

- Do not authorize a deep-linked conti from selected context alone. Prefer
  `conti.teamId`, falling back to `selectedTeamId` only before detail resolves.
- Do not share or export stale editor state, expose the internal `Conti` DTO publicly,
  fetch arbitrary sheet URLs, or silently drop failed pages from PDF feedback.
- Do not expand ad hoc song-domain copies. `ContiSong` embeds `TeamSong`, the mapper
  delegates to `toTeamSongModel`, and song-form UI comes from the song domain.
- Do not change song DTO/default precedence without checking editor requests,
  read-only display, sharing text, and PDF source selection together.

## NOTES

- External-share cache updates depend on detail data to discover `teamId`; without it,
  the implementation deliberately invalidates the full conti family.
- New-conti create, optional uploads, and publish are separate failure boundaries;
  preserve navigation to the saved draft when later stages fail.
