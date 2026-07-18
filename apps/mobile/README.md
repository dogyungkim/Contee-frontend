# Contee Mobile

Expo Router shell for the native Contee app.

This workspace contains the native Contee shell with mobile OAuth wired through
the backend PKCE flow. Bundle identifiers, EAS project metadata, and native file
flows are still not finalized.

## Commands

From the repository root:

```bash
npm run mobile:start
npm run mobile:ios
npm run mobile:android
npm run mobile:web
npm run mobile:typecheck
npm run test:mobile
```

From `apps/mobile`:

```bash
npm run start
npm run typecheck
npm run test
```

## Environment

- `EXPO_PUBLIC_API_BASE_URL`: API origin used by the native API client and
  mobile OAuth endpoints.
- `EXPO_PUBLIC_API_LOG=true`: enables redacted API request/response logging.
- `EXPO_PUBLIC_DEV_AUTH_BYPASS=true`: enables development-only token bypass.
- `EXPO_PUBLIC_DEV_ACCESS_TOKEN`: required when development auth bypass is
  enabled. No default production token is embedded in the app.
- `EXPO_PUBLIC_DEV_REFRESH_TOKEN`: optional development refresh token.
