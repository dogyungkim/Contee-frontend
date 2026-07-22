## API rules

Use these rules whenever adding or changing an API call.

### Source of truth

- Check `../Contee-backend/docs/api.md` before API work.
- If docs and backend source disagree, verify the controller source under
  `../Contee-backend/src/main/java` and align with the implemented mapping.
- Keep known intentional exceptions explicit. `GET /api/v1/teams/{teamId}/dashboard`
  is a frontend-prepared endpoint and is expected to be added on the backend later.

### Transport

- Use the shared client in `src/lib/api.ts` or `@contee/api-client`.
- Domain-specific calls belong in `src/domains/{domain}/api` or the matching
  package repository. Do not call raw Axios or fetch from UI components.
- Most REST endpoints live under `/api/v1`.
- Most JSON responses use `ApiResponse<T>` with `success`, `message`, and `data`.
- Error responses also include `error.code`, `error.status`, `error.timestamp`,
  and optional `error.fieldErrors`.
- File download endpoints can return binary streams instead of `ApiResponse`.
  Treat sheet-music and profile-image downloads as stream endpoints.

### Auth

- Send access tokens as `Authorization: Bearer {accessToken}` only to trusted
  Contee API origins.
- Web refresh uses the HttpOnly refresh-token cookie and
  `POST /api/v1/auth/refresh`.
- Mobile refresh uses JSON body tokens and the `/api/v1/auth/mobile/*` endpoints.
- Public share endpoints under `/api/v1/share/contis/{token}` do not require auth.
  Do not expose share tokens in logs.

### DTO boundary

- Keep DTOs and mappers at the API boundary.
- Convert backend response DTOs to domain models before hooks/components consume
  them.
- Do not use request fields that are not supported by the backend contract. For
  example, team-song favorites use dedicated `PUT` and `DELETE` `/favorite`
  endpoints, not `PATCH /songs/{teamSongId}`.

### Current backend-aligned endpoint notes

- Team conti list: `GET /api/v1/teams/{id}/contis`.
- Team song favorite add: `PUT /api/v1/teams/{id}/songs/{teamSongId}/favorite`.
- Team song favorite remove:
  `DELETE /api/v1/teams/{id}/songs/{teamSongId}/favorite`.
