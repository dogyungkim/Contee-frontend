# Frontend API 호출 명세

> 기준일: 2026-06-15
> 기준 코드: `src/domains/*/api`, `src/lib/api`, `src/lib/api/*`

프론트엔드에 구현된 외부 API 호출을 도메인별로 정리한 문서다.

- **사용 중**: 현재 Hook 또는 UI 호출 체인에 연결된 API
- **정의만 존재**: API 함수는 있지만 현재 프론트엔드 호출처가 없는 API
- Path의 `{id}` 값은 모두 동적으로 전달된다.

## 공통 설정

| 항목 | 내용 |
|---|---|
| HTTP Client | Axios |
| Base URL | `NEXT_PUBLIC_API_URL` |
| 현재 로컬 설정 | `http://localhost:8080` |
| 기본 Content-Type | `application/json` |
| 쿠키 전송 | `withCredentials: true` |
| Access Token | Zustand의 `accessToken`을 `Authorization: Bearer {token}`으로 자동 첨부 |
| Mock 전환 | `NEXT_PUBLIC_USE_MOCK=true` |
| API 로그 | 개발 환경 또는 `NEXT_PUBLIC_API_LOG=true` |

일반 API 응답은 아래 envelope를 사용한다.

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

페이지 응답은 다음 형태다.

```ts
interface PageDto<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}
```

### 401 자동 갱신

일반 API 요청이 `401`을 반환하면 Axios interceptor가 아래 API를 직접 호출한다.

```http
POST /api/v1/auth/refresh
Cookie: refresh token cookie
```

갱신에 성공하면 새 access token으로 원래 요청을 한 번 재시도한다. 갱신 실패 시 인증 상태를 초기화하고 `/login`으로 이동한다.

---

## 인증

구현: `src/domains/auth/api/auth.api.ts`

| 상태 | Method | Endpoint | 용도 |
|---|---|---|---|
| 사용 중 | Browser Redirect | `/oauth2/authorization/google` | Google OAuth 로그인 시작 |
| 사용 중 | `POST` | `/api/v1/auth/logout` | 로그아웃 |
| 사용 중 | `POST` | `/api/v1/auth/refresh` | refresh token cookie로 access token 갱신 |
| 사용 중 | `GET` | `/api/v1/users/me` | 현재 로그인 사용자 조회 |

### Google 로그인

`NEXT_PUBLIC_API_URL + /oauth2/authorization/google`로 브라우저 전체 페이지 이동을 수행한다.

### 로그아웃

```http
POST /api/v1/auth/logout
```

Request Body는 없다. Access token 유무와 관계없이 요청하며 refresh token cookie 삭제를 시도한다. Access token이 저장되어 있다면 공통 Axios interceptor가 Authorization header를 자동으로 추가한다.

### 토큰 갱신

```http
POST /api/v1/auth/refresh
Content-Type: application/json
Cookie: refresh token cookie

{}
```

응답 데이터:

```ts
interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}
```

OAuth callback, 앱 최초 세션 복구, 401 interceptor에서 호출된다.

### 내 정보 조회

```http
GET /api/v1/users/me
Authorization: Bearer {accessToken}
```

응답 사용자 필드: `id`, `email`, `name`, `profileImageUrl`, `provider`

---

## 팀

구현: `src/domains/team/api/team.api.ts`

| 상태 | Method | Endpoint | 용도 |
|---|---|---|---|
| 사용 중 | `POST` | `/api/v1/teams` | 팀 생성 |
| 사용 중 | `GET` | `/api/v1/teams` | 내가 속한 팀 목록 조회 |
| 사용 중 | `GET` | `/api/v1/teams/{teamId}` | 팀 상세 조회 |
| 정의만 존재 | `PUT` | `/api/v1/teams/{teamId}` | 팀 정보 수정 |
| 정의만 존재 | `DELETE` | `/api/v1/teams/{teamId}` | 팀 삭제 |
| 사용 중 | `GET` | `/api/v1/teams/{teamId}/members` | 팀 멤버 목록 조회 |
| 정의만 존재 | `POST` | `/api/v1/teams/{teamId}/members` | 팀 멤버 직접 추가 |
| 정의만 존재 | `POST` | `/api/v1/teams/join` | 초대 코드로 팀 가입 |
| 사용 중 | `DELETE` | `/api/v1/teams/{teamId}/members/{userId}` | 팀 멤버 제거 |
| 사용 중 | `PUT` | `/api/v1/teams/{teamId}/members/{userId}/role` | 팀 멤버 역할 변경 |

주요 요청:

```ts
// POST /api/v1/teams
{ name: string; description?: string }

// PUT /api/v1/teams/{teamId}
{ name?: string; description?: string }

// POST /api/v1/teams/{teamId}/members
{ userId: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' }

// POST /api/v1/teams/join
{ shortCode: string }

// PUT /api/v1/teams/{teamId}/members/{userId}/role
{ role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' }
```

팀 응답의 주요 필드: `id`, `name`, `shortCode`, `description`, `createdAt`, `updatedAt`, `memberCount`

팀 멤버는 팀 응답에 포함되지 않으며 `/api/v1/teams/{teamId}/members`에서 별도로 조회한다.

---

## 대시보드

구현: `src/domains/dashboard/api/dashboard.api.ts`

| 상태 | Method | Endpoint | 용도 |
|---|---|---|---|
| 정의만 존재 | `GET` | `/api/v1/dashboard/summary` | 대시보드 요약 조회 |
| 정의만 존재 | `GET` | `/api/v1/dashboard/contis/recent` | 최근 콘티 조회 |
| 정의만 존재 | `GET` | `/api/v1/dashboard/songs` | 대시보드 곡 목록 조회 |
| 정의만 존재 | `GET` | `/api/v1/dashboard/activities` | 최근 활동 조회 |
| 사용 중 | `GET` | `/api/v1/teams/{teamId}/dashboard` | 선택 팀의 통합 대시보드 조회 |

현재 화면은 개별 대시보드 API 네 개가 아니라 통합 API 한 개만 호출한다.

통합 응답 데이터:

```ts
interface DashboardDataDto {
  summary: {
    nextServiceLabel: string;
    nextServiceDateLabel: string;
    thisWeekContiCount: number;
    totalSongCount: number;
  };
  recentContis: ContiResponseDto[];
  songs: SongResponseDto[];
  activities: {
    id: string;
    timeLabel: string;
    message: string;
  }[];
}
```

---

## 팀 곡과 곡 검색

구현: `src/domains/song/api/song.api.ts`

| 상태 | Method | Endpoint | 용도 |
|---|---|---|---|
| 사용 중 | `GET` | `/api/v1/teams/{teamId}/songs` | 팀 곡 목록 조회 및 검색 |
| 사용 중 | `GET` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 팀 곡 상세 조회 |
| 사용 중 | `POST` | `/api/v1/teams/{teamId}/songs` | 팀 곡 생성 |
| 사용 중 | `PATCH` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 팀 곡 수정 |
| 사용 중 | `DELETE` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 팀 곡 삭제 |
| 사용 중 | `GET` | `/api/v1/songs?q={query}` | 마스터 곡 검색 |

### 팀 곡 목록 Query

| 이름 | 타입 | 설명 |
|---|---|---|
| `q` | `string` | 제목/아티스트 검색어 |
| `key` | `string` | 조성 필터 |
| `bpmMin` | `number` | 최소 BPM |
| `bpmMax` | `number` | 최대 BPM |
| `isFavorite` | `boolean` | 즐겨찾기 여부 |
| `page` | `number` | 페이지 번호 |
| `size` | `number` | 페이지 크기 |

프론트엔드는 팀 곡 목록 응답에 대해 배열과 `{ content: [] }` 형태를 모두 허용한다.

### 팀 곡 생성

```ts
{
  songId?: string;
  title: string;
  artist?: string;
  customKeySignature?: string;
  customBpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  songForm?: SongFormPartRequestDto[];
}
```

### 팀 곡 수정

```ts
{
  title?: string;
  artist?: string;
  customKeySignature?: string;
  customBpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  isFavorite?: boolean;
}
```

---

## 곡 구성

구현: `src/lib/api/song-form.ts`

| 상태 | Method | Endpoint | 용도 |
|---|---|---|---|
| 정의만 존재 | `GET` | `/api/v1/teams/{teamId}/songs/{teamSongId}/form` | 팀 곡 구성 조회 |
| 정의만 존재 | `PUT` | `/api/v1/teams/{teamId}/songs/{teamSongId}/form` | 팀 곡 구성 전체 수정 |

수정 요청:

```ts
{
  parts: {
    partType:
      | 'INTRO'
      | 'VERSE'
      | 'PRE_CHORUS'
      | 'CHORUS'
      | 'BRIDGE'
      | 'INTERLUDE'
      | 'OUTRO'
      | 'TAG'
      | 'INSTRUMENTAL'
      | 'ENDING'
      | 'CUSTOM';
    customPartName?: string;
    repeatCount: number;
    barCount?: number;
    note?: string;
  }[];
}
```

---

## 콘티

구현: `src/domains/conti/api/conti.api.ts`

| 상태 | Method | Endpoint | 용도 |
|---|---|---|---|
| 사용 중 | `GET` | `/api/v1/contis?page={page}&size={size}` | 콘티 페이지 조회 |
| 사용 중 | `GET` | `/api/v1/contis/{contiId}` | 콘티 상세 조회 |
| 사용 중 | `POST` | `/api/v1/contis` | 콘티 생성 |
| 사용 중 | `PATCH` | `/api/v1/contis/{contiId}` | 콘티 정보 수정 |
| 사용 중 | `PATCH` | `/api/v1/contis/{contiId}/status` | 콘티 상태 변경 |
| 사용 중 | `DELETE` | `/api/v1/contis/{contiId}` | 콘티 삭제 |
| 사용 중 | `POST` | `/api/v1/contis/{contiId}/songs` | 콘티에 곡 추가 |
| 사용 중 | `DELETE` | `/api/v1/contis/{contiId}/songs/{contiSongId}` | 콘티 곡 제거 |
| 사용 중 | `PATCH` | `/api/v1/contis/{contiId}/songs/{contiSongId}` | 콘티 곡 설정 수정 |
| 사용 중 | `PUT` | `/api/v1/contis/{contiId}/songs/order` | 콘티 곡 순서 변경 |

현재 콘티 목록 화면은 `page=0&size=100`으로 전체에 가깝게 조회한 뒤, 응답의 `teamId`를 프론트엔드에서 필터링한다.

### 콘티 생성

```ts
{
  teamId: string;
  title: string;
  worshipDate: string; // YYYY-MM-DD
  memo?: string;
  bibleVerse?: string;
  sharingInfo?: string;
  contiSongs?: ContiSongRequestItemDto[];
}
```

`contiSongs`에는 기존 팀 곡 또는 신규 직접 입력 곡을 함께 전달할 수 있다.

```ts
{
  id?: string;
  teamSongId?: string;
  customTitle?: string;
  artist?: string;
  customKeySignature?: string;
  customBpm?: number;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  orderIndex: number;
  keyOverride?: string;
  bpmOverride?: number;
  contiNote?: string;
  songForm?: ContiSongFormPartRequestDto[];
}
```

### 콘티 수정

```ts
{
  title?: string;
  worshipDate?: string;
  memo?: string;
  bibleVerse?: string;
  sharingInfo?: string;
  contiSongs?: ContiSongRequestItemDto[];
}
```

### 콘티 상태 변경

```ts
{
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
```

### 콘티 곡 추가

```ts
{
  teamSongId?: string;
  customTitle?: string;
  artist?: string;
  customKeySignature?: string;
  customBpm?: number;
  ccliNumber?: string;
  youtubeUrl?: string;
  sheetMusicUrl?: string;
  note?: string;
  keyOverride?: string;
  bpmOverride?: number;
  contiNote?: string;
  songForm?: ContiSongFormPartRequestDto[];
}
```

### 콘티 곡 수정

```ts
{
  keyOverride?: string;
  bpmOverride?: number;
  contiNote?: string;
  songForm?: ContiSongFormPartRequestDto[];
}
```

### 콘티 곡 순서 변경

```ts
{
  songOrders: {
    contiSongId: string;
    order: number; // 1부터 시작
  }[];
  contiSongIds?: string[];
}
```

현재 프론트엔드는 `songOrders`와 `contiSongIds`를 모두 전송한다.

---

## 현재 호출 API 요약

| 구분 | 개수 |
|---|---:|
| 현재 호출 체인에 연결됨 | 27 |
| 정의만 존재 | 10 |
| 전체 외부 endpoint | 37 |

HTTP method별 전체 개수:

| Method | 개수 |
|---|---:|
| Browser Redirect | 1 |
| `GET` | 15 |
| `POST` | 8 |
| `PUT` | 4 |
| `PATCH` | 4 |
| `DELETE` | 5 |

`POST /api/v1/auth/refresh`는 일반 인증 함수와 401 interceptor가 동일 endpoint를 공유하므로 한 개로 계산했다.

## 확인된 주의 사항

1. Mock adapter에는 현재 사용 중인 `GET /api/v1/teams/{teamId}/dashboard`가 없다. 대신 실제 API 코드에서 호출하지 않는 `GET /api/v1/dashboard` mock route가 있다.
2. Mock adapter에는 인증, 팀 상세, 팀 멤버, 팀 곡 상세 조회/삭제, 곡 구성 API 등이 구현되어 있지 않다.
3. Mock adapter에는 실제 API 모듈에 없는 `GET/POST /api/v1/teams/{teamId}/contis`와 `GET /api/v1/contis/{contiId}/songs` route가 남아 있다.
4. `NEXT_PUBLIC_API_LOG = true`처럼 `.env.local`의 등호 주변에 공백이 있다. 일반적으로 파싱되지만 `KEY=value` 형태로 통일하는 편이 안전하다.
5. API 응답의 `success`가 `false`여도 HTTP status가 2xx라면 공통 Axios client는 자동으로 에러 처리하지 않는다.
6. 콘티 목록은 팀별 endpoint가 아니라 전체 `/api/v1/contis`를 조회하고 클라이언트에서 팀을 필터링한다.
