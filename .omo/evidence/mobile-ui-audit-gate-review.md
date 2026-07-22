# Contee Expo mobile UI gate review

- recommendation: REJECT
- visualVerdict: REVISE
- confidence: HIGH
- reviewType: Read-only visual fidelity and Korean/CJK precision audit
- reviewedAt: 2026-07-18 KST

## originalIntent

The user asked, “지금 모바일 UI 측면에서 보완해야할게 뭐가 있는지 정리해줘”: identify and prioritize what the current Contee Expo mobile UI needs, grounded in the supplied current-build screenshots and the mobile architecture specification, without modifying application files.

## desiredOutcome

A release-actionable audit covering all four tabs at 320x700 and 390x844, with concrete visual/CJK findings, severity, source line references, screenshot evidence, and an exact blocker list. The expected product outcome is a mobile UI with four visible bottom tabs; selected-team access in the top app bar; pull-to-refresh, skeleton, empty, and retry states; Korean-only actionable errors; radii no greater than 8 per the supplied criterion; 44x44 targets; and dynamic-type-safe Korean layout.

## userOutcomeReview

The current shell is legible and navigable: all four tab icons and labels are visible, selected state is clear, the tested widths show no horizontal clipping, and the visible primary buttons are at least 48 points high. It is not yet ready against the stated mobile UI contract. Team selection is placed in page bodies instead of the app bar; list screens have no pull-to-refresh and use text-only loading; a raw Axios error is rendered; card radii exceed the contract; Settings is a developer/status screen rather than the required account/profile/legal/account-management information architecture; and multiple Korean phrases split unnaturally at 320/390 widths.

## success criteria

- UI-NAV-01: Four bottom tabs with visible labels and Lucide icons.
- UI-TEAM-01: Selected team appears in the top app bar on 콘티, 곡, and 팀 and opens team selection.
- UI-STATE-01: Lists provide pull-to-refresh, explicit skeleton loading, empty state, and retry.
- UI-ERR-01: User errors are actionable Korean and never expose raw backend/Axios errors.
- UI-VIS-01: Radius is no greater than 8 under the user-supplied criterion.
- UI-TARGET-01: Interactive targets are at least 44x44 points.
- UI-TYPE-01: Dynamic type and Korean/CJK wrapping remain usable.
- UI-SETTINGS-01: Settings covers account/profile/legal/logout/delete-account destinations.

## blockers

1. violatedCriterion: UI-ERR-01
   - observation: The team error concatenates `error.message`, producing the visible mixed-language string “팀 목록을 불러오지 못했습니다. Network Error”. This directly exposes a raw Axios/network error.
   - evidencePointer: `apps/mobile/src/components/team-selection-panel.tsx:29-35`; `/private/tmp/contee-mobile-320-contis.png`; `/private/tmp/contee-mobile-songs-isolated-320.png`; `/private/tmp/contee-mobile-320-team.png`; `/private/tmp/contee-mobile-songs-isolated-390.png`.

2. violatedCriterion: UI-TEAM-01
   - observation: The tab header config contains only each route title, while `TeamSelectionPanel` is rendered in the body of all three team-scoped screens. There is no selected-team control in the top app bar.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/_layout.tsx:21-42`; `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx:41-48`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:40-47`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:52-60`; top bars in `/private/tmp/contee-mobile-320-contis.png`, `/private/tmp/contee-mobile-songs-isolated-320.png`, and `/private/tmp/contee-mobile-320-team.png`.

3. violatedCriterion: UI-STATE-01
   - observation: Conti, song, and team lists are plain `ScrollView`s without `RefreshControl`/`refreshControl`; pending states are single `Text` nodes rather than skeletons. Empty and retry states exist, so the criterion is only partially implemented.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx:36-66`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:35-65`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:47-99`; text-only loading in `/private/tmp/contee-mobile-contis.png` and `/private/tmp/contee-mobile-team.png`; architecture `EXPO_MOBILE_ARCHITECTURE.md:382-385`.

4. violatedCriterion: UI-SETTINGS-01
   - observation: Settings exposes developer diagnostics (`Account`, auth bypass, access token, API base URL, endpoint) and a placeholder legal-link status. It has logout, but no profile destination, working legal destinations, or delete-account action required by the tab specification.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx:55-105` and `:107-138`; `/private/tmp/contee-mobile-320-settings.png`; `/private/tmp/contee-mobile-settings.png`; architecture `EXPO_MOBILE_ARCHITECTURE.md:364-370`.

5. violatedCriterion: UI-VIS-01
   - observation: Radius values are systematically above 8: Settings cards use 16; song/team/conti cards use 14; conti song/info blocks use 12. Even visible retry and team controls use 10 under the user-supplied all-radius summary.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx:202-209`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:134-141`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:214-220,250-260`; `apps/mobile/src/components/conti-read-card.tsx:100-108,146-152,170-175`; rounded Settings cards in `/private/tmp/contee-mobile-settings.png`; architecture `EXPO_MOBILE_ARCHITECTURE.md:393-399`.

6. violatedCriterion: UI-TYPE-01
   - observation: Korean wraps at character boundaries into visibly broken semantic units/endings: `볼 / 수 있습니다` at 320, `있습 / 니다` at 390, and Settings splits `세 / 션`, `있습니 / 다`, and `데 / 이터`. These are CJK precision failures at supported widths.
   - evidencePointer: `/private/tmp/contee-mobile-320-contis.png` with copy from `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx:24-28`; `/private/tmp/contee-mobile-songs-isolated-390.png` with copy from `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:23-27`; `/private/tmp/contee-mobile-settings.png` with copy from `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx:60-63,77-81,110-113`; typography/layout at `apps/mobile/src/theme/typography.ts:13-17` and `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx:175-194`.

## prioritized findings

### P0 / release blockers

- [product] Raw `Network Error` is rendered to users. Replace raw exception interpolation with a mapped Korean message and keep technical details out of the view.
- [product] The selected-team control is absent from the top app bar. Move the selected team affordance into the headers for 콘티/곡/팀 and open a selector screen or bottom sheet from it.
- [product] List behavior lacks pull-to-refresh and skeletons. Add native refresh controls and stable skeleton layouts while retaining the existing empty/retry states.

### P1 / high priority

- [product] Settings has the wrong information architecture for end users. Replace environment/auth diagnostics with profile, legal, logout, and delete-account destinations; keep operational diagnostics out of the main customer Settings surface.
- [product] Korean line breaking is visibly poor at both tested widths. Shorten/reflow copy or apply Korean-aware nonbreaking grouping so words and endings do not split into `세/션`, `데/이터`, or orphaned `니다`.
- [product] Radius usage conflicts with the <=8 requirement across core cards and controls. Consolidate radius tokens and cap applicable surfaces at 8.

### P2 / polish

- [product] Hierarchy is duplicated: the native top bar title and page H1 repeat `콘티`, `곡`, `팀`, or `설정`. The unused top-bar space and body-level team selector amplify the duplication. See all eight captures and `_layout.tsx:21-51` plus the title nodes in each screen.
- [product] Empty/error compositions are inconsistent: 콘티/곡 use a vertically centered `ScreenPlaceholder`, while 팀 starts at the top. This causes large dead space in `/private/tmp/contee-mobile-320-contis.png`, `/private/tmp/contee-mobile-songs-isolated-320.png`, and `/private/tmp/contee-mobile-songs-isolated-390.png`, but not `/private/tmp/contee-mobile-320-team.png`. Source: `screen-placeholder.tsx:39-44` versus `team/index.tsx:24-40`.
- [product] Prototype/developer English (`READ-ONLY MVP`, `ACCOUNT`, `API base URL`, `access token`, `endpoint`) weakens Korean product coherence. Source: contis `:22,41,46`; songs `:21,40,45`; team `:30,52,57`; settings `:56,79-102`.

## what is good

- UI-NAV-01 passes in all eight captures: four tabs, visible labels, familiar Lucide icons, and a clear active state. Source: `_layout.tsx:21-51`.
- No document-level horizontal overflow or hard clipping is visible at 320x700 or 390x844. Settings content is vertically scrollable rather than horizontally clipped.
- UI-TARGET-01 passes for the inspected custom controls: retry/team/logout controls use 48-52 point minimum heights; the 28-point network-banner dismiss control adds 8-point hit slop on each side for an effective 44-point vertical target. Source: `team-selection-panel.tsx:130-139,155-163`; contis `:117-125`; songs `:192-200`; team `:306-314`; settings `:245-252`; `network-status-banner.tsx:32-39,87-94`.
- Error states provide a visible retry action, and list branches include empty-state copy.
- Color, spacing, and typography are mostly token-driven through the shared theme.

## evidence trace

- `/private/tmp/contee-mobile-320-contis.png` (PNG RGB, 320x700, captured 2026-07-18 17:20 KST): four-tab shell; duplicate title; large vertical dead space; raw English error; `볼 / 수 있습니다` split.
- `/private/tmp/contee-mobile-songs-isolated-320.png` (PNG RGB, 320x844, 17:31 KST): four-tab shell; duplicate title; centered sparse error state; raw error wraps `Network / Error`.
- `/private/tmp/contee-mobile-320-team.png` (PNG RGB, 320x700, 17:20 KST): four-tab shell; top-aligned body differs from other no-team screens; raw error.
- `/private/tmp/contee-mobile-320-settings.png` (PNG RGB, 320x700, 17:20 KST): dense developer-centric Settings; large rounded cards; technical English; scroll continuation visible.
- `/private/tmp/contee-mobile-contis.png` (PNG RGB, 390x844, 17:10 KST): text-only loading; large blank upper region; no skeleton.
- `/private/tmp/contee-mobile-songs-isolated-390.png` (PNG RGB, 390x844, 17:32 KST): raw error; `있습 / 니다` orphaned ending; four tabs fit.
- `/private/tmp/contee-mobile-team.png` (PNG RGB, 390x844, 17:10 KST): text-only loading; four tabs fit; no selected-team top-bar affordance.
- `/private/tmp/contee-mobile-settings.png` (PNG RGB, 390x844, 17:10 KST): `세 / 션`, `있습니 / 다`, and `데 / 이터` splits; developer/status hierarchy; 16-point cards.

All screenshots are newer than the inspected source files (latest inspected source modification: 2026-07-17 15:26 KST), so they are fresh relative to the scoped source.

## checked artifact paths

- `EXPO_MOBILE_ARCHITECTURE.md:360-399`
- `apps/mobile/src/theme/colors.ts`
- `apps/mobile/src/theme/spacing.ts`
- `apps/mobile/src/theme/typography.ts`
- `apps/mobile/src/app/(app)/(tabs)/_layout.tsx`
- `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx`
- `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx`
- `apps/mobile/src/app/(app)/(tabs)/team/index.tsx`
- `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx`
- `apps/mobile/src/components/screen-placeholder.tsx`
- `apps/mobile/src/components/team-selection-panel.tsx`
- `apps/mobile/src/components/conti-read-card.tsx`
- `apps/mobile/src/components/network-status-banner.tsx`
- All eight screenshot paths listed in the evidence trace.
- Branch diff file list for `main...HEAD`; direct branch diff is clean at review time.
- All six `apps/mobile/tests/*.test.ts` files for direct overfit/slop review.
- `.omo/ulw-loop/bootstrap-notepad.md`.

## direct remove-ai-slops / programming pass

- No deletion-only test, requested-removal-only test, prompt-prose assertion, or production-code implementation-mirroring test was found in the six mobile tests.
- `api-availability.test.ts:10-17` is weakly named/tautological: it calls `clearApiUnavailable()` before claiming to prove the state “starts available”; `:29-38` already tests clear/reset behavior. This is a NOTE, not a blocker.
- No UI test covers top-app-bar team selection, pull-to-refresh, skeletons, raw-error suppression, dynamic type, or Korean wrapping. This creates false confidence but is a NOTE because no stated criterion requires a test artifact.
- `team/index.tsx` measures 306 pure LOC and `settings/index.tsx` 251 pure LOC, exceeding the programming/remove-ai-slops 250-pure-LOC threshold. Repeated retry-state styles and the hardcoded `#b91c1c` error color also add maintenance duplication. These are NOTES because architecture size/duplication is not a stated mobile UI success criterion.
- No unnecessary production parsing/normalization or speculative extraction was found in the scoped UI files.

## exact evidence gaps

- No exact visual reference exists, so this review judges fidelity against the architecture contract and internal consistency, not pixel similarity to a target.
- No populated-list, selected-team, team-selector-open, empty-team action, offline banner, or member-list screenshot was supplied. Source can establish missing/implemented code paths, but visual density and interaction affordance in those states remain unverified.
- No dynamic-type capture (larger accessibility font sizes) was supplied. Source does not disable font scaling, but fixed tab-bar geometry and Korean wrapping under enlarged type remain unverified.
- No interaction recording demonstrates pull-to-refresh, focus/pressed states, scroll reachability, or bottom-sheet navigation.
- No executor evidence packet, code-review report, or manual-QA matrix was present under `.omo`; the direct source/screenshot/test pass supports this rejection independently.
- Independent visual-QA subagent tools were unavailable in this session. The direct Pass B was completed, but there is no second-reviewer artifact.

## exact blockers

UI-ERR-01, UI-TEAM-01, UI-STATE-01, UI-SETTINGS-01, UI-VIS-01, and UI-TYPE-01 must be resolved before approval. UI-NAV-01 and UI-TARGET-01 currently pass.
