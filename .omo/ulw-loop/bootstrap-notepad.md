No ulw-loop-capable omo executable found.

Observed on 2026-07-16:

- `omo` is not on PATH.
- Cached OMO plugin contains `skills/ulw-loop/SKILL.md`.
- Cached OMO plugin does not contain `components/ulw-loop/dist/cli.js`.
- `components/ultrawork/dist/cli.js ulw-loop help` exits with usage for `omo-ultrawork hook user-prompt-submit`, not ulw-loop.

Fallback: continue the requested Expo preparation work from
`EXPO_MOBILE_ARCHITECTURE.md` without hand-editing ULW goal state.
