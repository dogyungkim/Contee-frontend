# Frontend–Backend API 계약 정합성 개선안

## 1. 목적

현재 Contee 프론트엔드가 사용하는 API 계약과 백엔드 구현 사이의 차이를 정리하고, 백엔드에서 필요한 변경 사항과 완료 조건을 정의한다.

이 문서는 현재 백엔드 작업 트리의 Controller, Request/Response DTO 및 `docs/api.md`를 기준으로 작성했다.

## 2. 범위

### 포함

- 팀 곡(`TeamSong`) 응답 계약
- 팀 곡 생성 시 송폼 저장
- 공통 오류 응답 계약
- OpenAPI 문서 생성 오류

---

## 3. 필수 변경 사항

## 3.1
이미 완료함

## 3.2 `TeamSongResponse`에 식별 및 시간 필드 추가

### 현재 상태

현재 백엔드 응답:

```json
{
  "id": "team-song-uuid",
  "title": "주의 은혜라",
  "artist": "마커스워십",
  "keySignature": "D",
  "bpm": 72,
  "isFavorite": false,
  "note": "팀 메모",
  "youtubeUrl": "https://...",
  "sheetMusicUrl": "https://...",
  "ccliNumber": "1234567"
}
```

프론트엔드는 팀 곡이 어느 팀에 속하는지 식별하고 mutation 이후 정확한 Query cache를 갱신하기 위해 `teamId`를 필요로 한다. 또한 모델 계약상 생성·수정 시각을 사용 가능한 데이터로 기대한다.

### 변경 요청

`TeamSongResponse`에 다음 필드를 추가한다.

```java
public record TeamSongResponse(
        UUID id,
        UUID teamId,
        UUID songId,
        String title,
        String artist,
        String keySignature,
        Integer bpm,
        boolean isFavorite,
        String note,
        String youtubeUrl,
        String sheetMusicUrl,
        String ccliNumber,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
```

권장 응답:

```json
{
  "id": "team-song-uuid",
  "teamId": "team-uuid",
  "songId": null,
  "title": "주의 은혜라",
  "artist": "마커스워십",
  "keySignature": "D",
  "bpm": 72,
  "isFavorite": false,
  "note": "팀 메모",
  "youtubeUrl": "https://...",
  "sheetMusicUrl": "https://...",
  "ccliNumber": null,
  "createdAt": "2026-07-02T12:00:00",
  "updatedAt": "2026-07-02T12:00:00"
}
```

`songId`는 커스텀 팀 곡처럼 전역 `Song`과 연결되지 않은 경우 `null`이어야 한다.

### 적용 대상

동일한 `TeamSongResponse`를 반환하는 모든 엔드포인트에 적용한다.

- `GET /api/v1/teams/{teamId}/songs`
- `POST /api/v1/teams/{teamId}/songs`
- `GET /api/v1/teams/{teamId}/songs/{teamSongId}`
- `PATCH /api/v1/teams/{teamId}/songs/{teamSongId}`

### 완료 조건

- 모든 팀 곡 응답에 `teamId`, `songId`, `createdAt`, `updatedAt`이 일관되게 포함된다.
- 커스텀 곡의 `songId`와 `ccliNumber`는 `null`을 허용한다.
- 목록, 생성, 상세, 수정 응답의 JSON 구조가 동일하다.
- `docs/api.md`와 OpenAPI schema가 함께 갱신된다.

---

## 3.3 팀 곡 생성 시 송폼을 함께 저장

### 현재 상태

프론트엔드의 곡 추가 화면은 기본 정보와 송폼을 한 번에 입력한다.

프론트 요청 예시:

```json
{
  "title": "주의 은혜라",
  "artist": "마커스워십",
  "keySignature": "D",
  "bpm": 72,
  "note": "팀 메모",
  "youtubeUrl": "https://...",
  "sheetMusicUrl": "https://...",
  "songForm": [
    {
      "partType": "INTRO",
      "customPartName": "Intro",
      "repeatCount": 1,
      "barCount": 4
    },
    {
      "partType": "VERSE",
      "customPartName": "V1",
      "repeatCount": 1,
      "barCount": 8
    }
  ]
}
```

현재 `CreateTeamSongRequest`에는 `songForm`이 없으므로 생성 요청에 포함된 송폼이 저장되지 않는다.

### 변경 요청

`CreateTeamSongRequest`에 송폼 필드를 추가한다.

```java
public record CreateTeamSongRequest(
        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 200)
        String artist,

        @Size(max = 20)
        String keySignature,

        @Positive
        Integer bpm,

        Boolean isFavorite,

        @Size(max = 1000)
        String note,

        @Size(max = 500)
        @URL
        String youtubeUrl,

        @Size(max = 500)
        @URL
        String sheetMusicUrl,

        @Valid
        List<SongFormPartRequest> songForm
) {
}
```

`TeamSongService.createTeamSong`에서 팀 곡 생성과 송폼 저장을 하나의 트랜잭션으로 처리한다.

### 동작 규칙

- `songForm` 생략 또는 `null`: 빈 송폼으로 저장한다.
- `songForm: []`: 빈 송폼으로 저장한다.
- 유효하지 않은 송폼 파트가 하나라도 있으면 팀 곡도 생성하지 않는다.
- 송폼 파트 순서는 요청 배열 순서를 유지한다.
- 기존 `PUT /api/v1/teams/{teamId}/songs/{teamSongId}/form`은 별도 수정 API로 유지한다.

### 완료 조건

- 곡 생성 직후 송폼 GET API에서 동일한 송폼이 조회된다.
- 곡과 송폼이 하나의 트랜잭션으로 저장된다.
- 송폼 validation 실패 시 팀 곡이 생성되지 않는다.
- 생성 요청/응답 예제가 `docs/api.md`와 OpenAPI에 반영된다.

---

## 4. 권장 변경 사항

## 4.1 공통 오류 응답 구조 통일

### 현재 상태

성공 응답은 다음 envelope를 사용한다.

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

비즈니스 예외와 validation 예외는 별도 구조를 사용한다.

```json
{
  "status": 400,
  "message": "잘못된 요청입니다",
  "timestamp": "2026-07-02T12:00:00+09:00"
}
```

이 때문에 클라이언트가 성공과 실패에 서로 다른 transport type을 사용해야 하며, 문서에 적힌 공통 응답 규칙과 실제 오류 응답이 일치하지 않는다.

### 변경 요청

오류 응답도 공통 envelope로 통일하는 것을 권장한다.

```json
{
  "success": false,
  "message": "잘못된 요청입니다",
  "data": null,
  "error": {
    "code": "INVALID_INPUT_VALUE",
    "status": 400,
    "timestamp": "2026-07-02T12:00:00+09:00",
    "fieldErrors": []
  }
}
```

최소 변경안으로는 현재 `ErrorResponse`에 `success: false`, `code`, `data: null`을 추가할 수 있다.

### 완료 조건

- 인증, validation, 비즈니스, 서버 오류가 동일한 최상위 구조를 사용한다.
- 클라이언트가 안정적으로 분기할 수 있는 문자열 `code`가 제공된다.
- validation 오류는 가능하면 필드별 오류 정보를 포함한다.
- 실제 오류 schema가 OpenAPI에 등록된다.

---

## 4.2 OpenAPI 문서 생성 오류 수정

### 현재 상태

로컬 백엔드의 다음 요청이 HTTP 500을 반환한다.

```http
GET /v3/api-docs
```

확인된 응답:

```json
{
  "status": 500,
  "message": "서버 에러입니다",
  "timestamp": "2026-07-02T23:19:26.163359+09:00"
}
```

따라서 현재 실행 중인 서버에서 생성된 OpenAPI 계약을 프론트와 자동 비교하거나 Swagger UI에서 검증할 수 없다.

### 변경 요청

- `/v3/api-docs` 생성 시 발생하는 서버 로그의 root cause를 확인한다.
- Spring Boot와 `springdoc-openapi` 버전 호환성을 확인한다.
- Controller parameter 또는 DTO schema 중 OpenAPI 변환에 실패하는 타입을 확인한다.
- CI에서 `/v3/api-docs` 생성 또는 애플리케이션 context test를 실행한다.

### 완료 조건

- `/v3/api-docs`가 HTTP 200과 유효한 OpenAPI JSON을 반환한다.
- Swagger UI에서 전체 API가 표시된다.
- 팀 곡 생성 요청과 응답의 변경된 schema가 표시된다.
- 인증이 필요한 API에 Bearer 인증 schema가 적용된다.

---

## 5. 백엔드 변경 대상이 아닌 항목

아래 항목은 현재 백엔드 정책과 구현이 일치하므로, 백엔드 권한을 완화하지 않고 프론트엔드를 수정해야 한다.

### 콘티 삭제 권한

- 백엔드 정책: `OWNER`, `ADMIN`
- 현재 프론트 문제: `MEMBER`에게도 삭제 메뉴 노출
- 조치 주체: 프론트엔드

### 멤버 역할 변경 권한

- 백엔드 정책: `OWNER`만 가능
- 현재 프론트 문제: `ADMIN`에게도 역할 변경 메뉴 노출
- 조치 주체: 프론트엔드

### 팀 곡 목록 페이지네이션

- 백엔드: Spring `Page<TeamSongResponse>`와 검색 조건 제공
- 현재 프론트 문제: 첫 페이지의 `content`만 사용하고 페이지 정보를 버림
- 조치 주체: 프론트엔드

### 지원되지 않는 팀 곡 요청 필드

프론트 DTO에는 `songId`, `ccliNumber`가 팀 곡 생성/수정 요청 필드로 정의되어 있으나 현재 UI와 백엔드 도메인 정책상 사용하지 않는다.

- 백엔드에서 무조건 지원하기보다 프론트 요청 DTO에서 제거하는 것을 우선 권장한다.
- 전역 `Song` 연결 기능이 제품 요구사항으로 확정될 때 별도 API 계약을 설계한다.

---

## 6. 권장 구현 순서

2. `TeamSongResponse` 계약 확장
3. 팀 곡 생성과 송폼 저장 통합
4. 공통 오류 응답 구조 통일
5. OpenAPI 500 오류 수정 및 계약 문서 갱신