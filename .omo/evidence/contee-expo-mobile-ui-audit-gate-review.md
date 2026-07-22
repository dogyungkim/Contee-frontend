# Contee Expo mobile UI gate review

- recommendation: **REJECT**
- auditVerdict: **REVISE**
- confidence: **HIGH**
- reviewMode: Read-only current-state mobile UI audit
- sourceChangesMade: None
- reportFallbackReason: `omo ulw-loop status --json` could not run because `omo` is not on PATH; `.omo/ulw-loop/bootstrap-notepad.md:1-10` confirms no usable ulw-loop CLI.

## originalIntent

"지금 모바일 UI 측면에서 보완해야할게 뭐가 있는지 정리해줘"

The user wants a concrete, prioritized account of what the current Contee Expo mobile UI still needs, grounded in the current build rather than speculative redesign advice.

## desiredOutcome

A four-tab Expo mobile shell where `콘티`, `곡`, and `팀` expose the selected team from the top app bar; core lists support pull-to-refresh, skeleton loading, useful empty/retry states, and safe Korean errors; settings covers the specified user-facing account destinations; shared tokens and components respect the radius, target-size, safe-area, and dynamic-type constraints.

## userOutcomeReview

The current UI establishes a legible four-tab shell with coherent neutral tokens, clear active-tab feedback, valid narrow-width reflow, and generally adequate primary-button target sizes. It does not yet deliver the specified team-selection information architecture or production-ready state handling. Current screenshots still read as an internal read-only MVP, and source inspection proves several explicit architecture requirements are absent or contradicted.

## blockers

1. **[product] Selected-team app-bar control is absent**
   - violatedCriterion: `NAV-TEAM-APPBAR` — `EXPO_MOBILE_ARCHITECTURE.md:375-376`
   - observation: The tab navigator only assigns static route titles and icons. The selected team is rendered inside screen content through `TeamSelectionPanel`, not as a tappable top-app-bar control.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/_layout.tsx:8-52`; `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx:41-48`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:40-47`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:52-60`; `/private/tmp/contee-mobile-contis.png`; `/private/tmp/contee-mobile-songs-isolated-390.png`; `/private/tmp/contee-mobile-team.png`.

2. **[product] Raw transport error reaches the user**
   - violatedCriterion: `ERROR-ACTIONABLE-KO` — `EXPO_MOBILE_ARCHITECTURE.md:391`
   - observation: `error.message` is appended directly, producing `팀 목록을 불러오지 못했습니다. Network Error` in the rendered UI.
   - evidencePointer: `apps/mobile/src/components/team-selection-panel.tsx:29-35`; `/private/tmp/contee-mobile-320-contis.png`; `/private/tmp/contee-mobile-songs-isolated-320.png`; `/private/tmp/contee-mobile-320-team.png`; `/private/tmp/contee-mobile-songs-isolated-390.png`.

3. **[product] Required list refresh and skeleton states are missing**
   - violatedCriterion: `LIST-STATE-BEHAVIOR` — `EXPO_MOBILE_ARCHITECTURE.md:384`
   - observation: Conti, song, and member lists are plain `ScrollView` + mapped children with no `RefreshControl`; pending states are text-only rather than explicit layout-shaped skeletons.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx:36-78`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:35-73`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:47-101`; `/private/tmp/contee-mobile-contis.png`; `/private/tmp/contee-mobile-team.png`; `/private/tmp/contee-mobile-320-contis.png`.

4. **[product] The no-team workflow is framed and non-actionable**
   - violatedCriterion: `NO-TEAM-EMPTY` — `EXPO_MOBILE_ARCHITECTURE.md:379`
   - observation: The source renders a disabled combined `팀 만들기 / 초대 코드로 참여` button inside the tab placeholder. The requirement calls for an unframed empty state with two actionable paths.
   - evidencePointer: `apps/mobile/src/components/team-selection-panel.tsx:49-63`; `apps/mobile/src/app/(app)/(tabs)/contis/index.tsx:19-30`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:18-29`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:24-40`; current 320 captures `/private/tmp/contee-mobile-320-contis.png`, `/private/tmp/contee-mobile-songs-isolated-320.png`, and `/private/tmp/contee-mobile-320-team.png` do not contain a successful no-team state, which is an evidence gap in addition to the source-proven product gap.

5. **[product] Settings does not match the specified user-facing information architecture**
   - violatedCriterion: `SETTINGS-SCOPE` — `EXPO_MOBILE_ARCHITECTURE.md:369`
   - observation: The settings screen exposes development diagnostics (`API base URL`, auth bypass/access-token state), leaves legal links disconnected, and has no profile or delete-account destination.
   - evidencePointer: `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx:66-138`; `/private/tmp/contee-mobile-320-settings.png`; `/private/tmp/contee-mobile-settings.png`.

6. **[product] Card radii exceed the phase-1 limit**
   - violatedCriterion: `CARD-RADIUS` — `EXPO_MOBILE_ARCHITECTURE.md:397`
   - observation: User-facing cards use 14-16 point radii; list rows/info blocks use 12-14. The requirement caps card radii at 8.
   - evidencePointer: `apps/mobile/src/components/conti-read-card.tsx:100-108,146-175`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:134-141`; `apps/mobile/src/app/(app)/(tabs)/team/index.tsx:214-220,250-260`; `apps/mobile/src/app/(app)/(tabs)/settings/index.tsx:202-209`; `/private/tmp/contee-mobile-settings.png`.

7. **[evidence] Dynamic-type compliance is not demonstrated on either platform**
   - violatedCriterion: `DYNAMIC-TYPE` — `EXPO_MOBILE_ARCHITECTURE.md:371,401`
   - observation: All eight supplied captures show default-size text. No iOS/Android large-accessibility-font capture or manual result proves that headers, tab labels, status rows, badges, and fixed-height controls remain readable and unclipped.
   - evidencePointer: `apps/mobile/src/theme/typography.ts:1-26`; `apps/mobile/src/app/(app)/(tabs)/_layout.tsx:13-18`; `apps/mobile/src/app/(app)/(tabs)/songs/index.tsx:99-105`; all supplied screenshot paths listed below.

## prioritizedFindings

### P0 — fix before calling the shell spec-compliant

- `[product]` Move team identity/selection into the top app bar on `콘티`, `곡`, and `팀`, preserving a clear active tab and avoiding the duplicated app-bar title + in-body title hierarchy.
- `[product]` Map transport failures to finite Korean UX messages; never concatenate Axios/backend text. Keep retry as the recovery action.
- `[product]` Add pull-to-refresh and layout-shaped loading skeletons to all three data-list surfaces.
- `[product]` Replace the disabled combined no-team action with separate working `팀 만들기` and `초대 코드로 참여` actions in the specified unframed state.
- `[product]` Replace developer diagnostics in Settings with the promised account/profile/legal/logout/delete-account destinations, or clearly quarantine diagnostics to a development-only surface.

### P1 — design-system and visual coherence

- `[product]` Reduce card/list container radii to 8 or less. The current 14-16 point shells visibly conflict with the mobile architecture and make the UI read more like generic prototype cards.
- `[product]` Remove user-facing `Read-only MVP`, `API base URL`, `endpoint`, and access-token copy from production-facing hierarchy. The screenshots show implementation status competing with the actual task labels.
- `[product]` Rebalance placeholder composition. Centering the state inside the full remaining viewport creates a large empty band and duplicates route titles (`콘티`/`곡`/`팀`) between navigation header and body; see the 320 and 390 loading/error captures.
- `[product]` Promote empty states from single text lines to concise task-oriented states with the next valid action where one exists.

### P2 — evidence and maintainability

- `[evidence]` Capture the complete state matrix at default and large accessibility type on both iOS and Android: loading skeleton, populated list, empty, offline, service unavailable, retrying, no-team, selected-team sheet, and long Korean/team-name content.
- `[evidence]` Add interaction evidence for pull-to-refresh, team-switch opening/selection, retry in-flight behavior, tab targets, and screen-reader announcements.
- `[note]` The direct `programming`/`remove-ai-slops` pass found no test-overfit pattern in the six existing core tests; none tests the reviewed UI rendering. `team/index.tsx` is 306 pure LOC and `settings/index.tsx` is 251 pure LOC, over the 250-LOC review threshold, and retry/card styles are repeated across screens. This is maintenance burden and consistency risk, but not a blocker independent of the explicit UI criteria above.

## whatIsGood

- Four bottom tabs are present in the required order with visible Korean labels and Lucide React Native icons: `_layout.tsx:21-52`.
- Active/inactive tab states are visually legible in every screenshot.
- The supplied 320- and 390-wide captures show no document-level horizontal overflow; default-size Korean wrapping has no obvious clipping or one-character orphan.
- Primary retry/logout/team controls use 48-52 point minimum heights, while the tab bar uses a 64 point minimum: `team-selection-panel.tsx:130-163`, the three screen retry styles, `settings/index.tsx:245-252`, and `_layout.tsx:14-18`.
- Press feedback exists on actionable conti cards and logout, and accessible roles are present on explicit buttons.
- Spacing and neutral color usage is mostly token-driven and visually consistent.
- Screenshot files are valid PNGs and are newer than the reviewed source files.

## directSkillPerspectiveChecks

### remove-ai-slops / overfit pass

- No branch diff was supplied and `git diff -- apps/mobile EXPO_MOBILE_ARCHITECTURE.md` is empty, so there is no changed-code overfit claim to validate.
- Six tests exist under `apps/mobile/tests`; they target API/network/auth/team-selection core logic, not requested removals or UI prose. No deletion-only, tautological, implementation-mirroring, or requested-removal test was found in the reviewed UI scope.
- Production notes: repeated per-screen retry/card styles, raw magic radii/colors, and two oversized screen modules add maintenance burden. No unnecessary parsing/normalization extraction was found in the listed UI files.

### programming pass

- Reviewed strict TypeScript surfaces for escape hatches, needless wrappers, broad catch-and-swallow behavior, and oversized modules.
- No `any`, type assertions, `@ts-ignore`, non-null assertions, or swallowed catch appeared in the listed files.
- `team/index.tsx` and `settings/index.tsx` exceed 250 pure LOC; record as maintenance notes because file size alone is not one of the user's stated mobile UI success criteria.

## checkedArtifactPaths

### Specification and source

- `EXPO_MOBILE_ARCHITECTURE.md:360-401`
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
- `.omo/ulw-loop/bootstrap-notepad.md`

### Screenshots

- `/private/tmp/contee-mobile-320-contis.png` — 320x700
- `/private/tmp/contee-mobile-songs-isolated-320.png` — 320x844
- `/private/tmp/contee-mobile-320-team.png` — 320x700
- `/private/tmp/contee-mobile-320-settings.png` — 320x700
- `/private/tmp/contee-mobile-contis.png` — 390x844
- `/private/tmp/contee-mobile-songs-isolated-390.png` — 390x844
- `/private/tmp/contee-mobile-team.png` — 390x844
- `/private/tmp/contee-mobile-settings.png` — 390x844

## exactEvidenceGaps

- No large-accessibility-font screenshots or results on iOS and Android.
- No interaction capture for pull-to-refresh, top-app-bar team selection, retry transitions, pressed/focused states, or screen-reader behavior.
- No populated-list, successful empty-list, successful no-team, offline-banner, or service-unavailable-banner screenshot.
- `/private/tmp/contee-mobile-songs-isolated-320.png` is 320x844, not 320x700; width coverage is valid, but the named 320x700 matrix is incomplete for the songs tab.
- No executor evidence bundle, code-review report, manual QA matrix, changed-files list, or notepad path was supplied with the request. The available `.omo/ulw-loop/bootstrap-notepad.md` was inspected. Their absence is not an additional blocker for this current-state audit because the listed source and screenshots directly prove the product blockers above.
- No exact visual target exists, so this report makes no pixel-fidelity claim.

## finalGate

**REJECT / REVISE.** Approval requires, at minimum, clearing blockers 1-6 in production code and supplying evidence for blocker 7. Preserve the four-tab order, safe-area behavior, clear active state, narrow-width reflow, and primary control sizing while revising.
