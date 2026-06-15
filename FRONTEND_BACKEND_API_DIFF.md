# Frontend / Backend API 차이

> 비교일: 2026-06-15
> Frontend: `FRONTEND_API.md` 및 현재 프론트엔드 코드
> Backend: 첨부된 `Contee API Guide`

## 결론

현재 계약에는 실제 기능 장애로 이어질 수 있는 차이가 있다.

가장 먼저 확인하거나 수정해야 할 항목은 다음 네 가지다.

1. 프론트엔드가 호출하는 팀 곡 생성·상세·삭제·전역 검색 API가 백엔드에 없다.
2. ~~팀 생성 및 상세 응답의 `members` 계약 차이~~ (프론트 수정 완료)
3. 송폼 API는 백엔드가 raw response를 반환하지만 프론트는 `ApiResponse<T>`로 해석한다.
4. ~~사용자 ID 타입이 백엔드 UUID 문자열과 일치하지 않음~~ (프론트 수정 완료)

---

## 1. 즉시 장애 가능성이 높은 차이

### 1.1 프론트에만 있는 팀 곡 API

| Method | Endpoint | 프론트 상태 | 백엔드 가이드 |
|---|---|---|---|
| `GET` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 사용 중 | 없음 |
| `POST` | `/api/v1/teams/{teamId}/songs` | 사용 중 | 없음 |
| `DELETE` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 사용 중 | 없음 |
| `GET` | `/api/v1/songs?q={query}` | 사용 중 | 없음 |

백엔드에 명시된 Team Song API는 아래 두 개뿐이다.

- `GET /api/v1/teams/{id}/songs`
- `PATCH /api/v1/teams/{id}/songs/{teamSongId}`

영향:

- 팀 곡 상세 화면
- 팀 곡 신규 생성
- 팀 곡 삭제
- 마스터 곡 검색

위 기능은 실제 서버에서 `404` 또는 `405`가 발생할 가능성이 높다.

관련 프론트 코드:

- `src/domains/song/api/song.api.ts`
- `src/domains/song/hooks/use-songs.ts`

### 1.2 팀 응답의 `members` 차이 (수정 완료)

백엔드 팀 생성·상세 응답에는 다음 필드가 있다.

```ts
{
  id: string;
  name: string;
  shortCode: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}
```

기존 프론트의 `TeamResponseDto`는 `members: TeamMember[]`를 필수로 요구했다.

```ts
export interface TeamResponseDto {
  // ...
  members: TeamMember[];
}
```

또한 mapper가 방어 처리 없이 아래 코드를 실행했다.

```ts
members: dto.members.map(toTeamMemberModel)
```

기존 영향:

- `POST /api/v1/teams` 성공 후 `Cannot read properties of undefined (reading 'map')`
- `GET /api/v1/teams/{id}` 성공 후 동일 오류

적용한 수정:

- `TeamResponseDto`와 `Team`에서 `members`를 제거했다.
- `toTeamModel`의 `members.map(...)` 처리를 제거했다.
- 멤버 목록은 기존 전용 API `/api/v1/teams/{teamId}/members`로 계속 조회한다.

관련 프론트 코드:

- `src/domains/team/api/team.dto.ts`
- `src/domains/team/api/team.mapper.ts`

### 1.3 송폼 응답 envelope 차이

백엔드:

```json
{
  "teamSongId": "team-song-uuid",
  "parts": []
}
```

프론트:

```ts
apiClient.get<ApiResponse<SongFormResponse>>(url)
return data.data
```

백엔드 송폼 API는 `ApiResponse<T>` 없이 raw `SongFormResponse`를 반환하므로, 프론트의 `data.data`는 `undefined`가 된다.

대상:

- `GET /api/v1/teams/{teamId}/songs/{teamSongId}/form`
- `PUT /api/v1/teams/{teamId}/songs/{teamSongId}/form`

현재 이 API 함수들은 호출처가 없어 잠복 상태지만, 연결하는 즉시 문제가 발생한다.

관련 프론트 코드:

- `src/lib/api/song-form.ts`

### 1.4 사용자 ID 타입 차이 (수정 완료)

백엔드는 사용자 ID를 UUID 문자열로 반환한다.

```json
{ "id": "user-uuid" }
```

기존 프론트는 사용자 ID를 `number`로 선언했다.

```ts
interface UserDto {
  id: number;
}
```

기존에는 일부 코드에서 `String(currentUserId)`로 변환해 비교하고 있었다.

적용한 수정:

- `UserDto.id`, `User.id`, `UserResponse.id`를 모두 `string`으로 변경했다.
- 팀 멤버 권한 비교의 `currentUserId`를 `string`으로 변경하고 불필요한 문자열 변환을 제거했다.

관련 프론트 코드:

- `src/domains/auth/api/auth.dto.ts`
- `src/domains/auth/models/auth.ts`

---

## 2. 요청 형식 차이

### 2.1 콘티 곡 순서 변경

백엔드가 요구하는 요청:

```ts
{
  contiSongIds: string[];
}
```

프론트가 보내는 요청:

```ts
{
  songOrders: {
    contiSongId: string;
    order: number;
  }[];
  contiSongIds: string[];
}
```

필수인 `contiSongIds`는 포함되어 있어 Jackson의 unknown property 설정에 따라 동작할 수 있지만, `songOrders`는 백엔드 계약에 없는 필드다.

권장 수정:

- 프론트 요청을 `{ contiSongIds }`로 단순화한다.

관련 프론트 코드:

- `src/domains/conti/api/conti.dto.ts`
- `src/domains/conti/hooks/use-conti.ts`

### 2.2 콘티 곡 `orderIndex`

백엔드 생성·수정 예시는 첫 곡에 `orderIndex: 0`을 사용한다.

프론트는 첫 곡부터 `orderIndex: 1`을 전송한다.

```ts
orderIndex: idx + 1
```

백엔드 문서에 인덱스 기준이 명시적으로 설명되어 있지는 않으므로, 0-based인지 1-based인지 확인이 필요하다.

관련 프론트 코드:

- `src/domains/conti/hooks/use-new-conti-form.ts`

### 2.3 팀 곡 수정의 `ccliNumber`

프론트 수정 DTO에는 `ccliNumber`가 있지만 백엔드 수정 요청에는 해당 필드가 없다.

```ts
// Frontend
{
  ccliNumber?: string;
}
```

백엔드가 알 수 없는 필드를 무시하면 영향이 없지만, 값을 수정하려 해도 저장되지 않을 수 있다.

### 2.4 콘티 곡 추가의 `ccliNumber`

프론트의 콘티 곡 추가 DTO에는 `ccliNumber`가 있지만 백엔드 가이드의 신규 팀 곡 생성 필드에는 없다.

백엔드 DTO가 실제로 이 필드를 받는지 추가 확인이 필요하다.

### 2.5 토큰 갱신 및 로그아웃 Body

백엔드는 두 API 모두 Request Body가 없다고 명시한다.

- `POST /api/v1/auth/refresh`: 프론트가 빈 객체 `{}`를 전송해 계약상 차이가 남아 있다.
- `POST /api/v1/auth/logout`: Body 없이 요청하도록 수정 완료했다.

Refresh 요청의 빈 객체는 대부분의 Spring 구현에서 문제가 없지만 계약상 차이다.

---

## 3. 응답 타입 차이

### 3.1 `/users/me`의 `provider`

프론트 `UserDto`는 `provider: string`을 필수로 요구한다.

백엔드 가이드의 `GET /api/v1/users/me` 응답에는 `provider`가 없다. 반면 refresh 응답의 사용자에는 `provider`가 있다.

영향:

- `/users/me` 결과를 매핑하면 `user.provider`가 `undefined`일 수 있다.

권장 수정:

- 백엔드 `/users/me`에 `provider`를 포함하거나,
- 프론트에서 `provider?: string`으로 구분한다.

### 3.2 Team Song 응답 필드

프론트 `TeamSong` 모델은 아래 필드를 필수로 요구한다.

```ts
{
  teamId: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
```

백엔드 가이드의 `TeamSongResponse`에는 `teamId`, `createdAt`, `updatedAt`이 없다.

백엔드 실제 JSON도 가이드와 같다면 프론트 모델에는 `undefined`가 들어간다.

특히 프론트는 즐겨찾기 수정 시 `teamSong.teamId`를 API path에 사용하므로 데이터 출처에 따라 잘못된 URL이 만들어질 수 있다.

### 3.3 Dashboard 전용 응답

백엔드 대시보드의 `recentContis`는 축약 응답이다.

```ts
{
  id;
  title;
  worshipDate;
  status;
  updatedAt;
  songCount;
}
```

프론트는 이를 전체 `ContiResponseDto`로 선언하고 공통 `toContiModel` mapper에 전달한다. 따라서 `teamId` 등 일부 필드가 `undefined`가 된다.

백엔드 대시보드의 `songs`도 축약 응답인데, 프론트는 일반 `Song` 타입으로 선언해 `createdAt`, `updatedAt`을 필수로 기대한다.

권장 수정:

- 대시보드 전용 `RecentContiDto`, `DashboardSongDto`를 별도로 만든다.

### 3.4 송폼 파트의 nullable 필드

백엔드 송폼 응답 예시에서 `id`, `partOrder`는 `null`일 수 있다.

프론트는 두 필드를 `number`로만 선언한다.

```ts
id: number;
partOrder: number;
```

권장 수정:

```ts
id: number | null;
partOrder: number | null;
```

### 3.5 콘티의 `publishedAt`

백엔드 콘티 응답에는 `publishedAt`이 있지만 프론트 DTO와 모델에는 없다.

현재 화면에서 사용하지 않는다면 기능 장애는 없지만, publish 시각을 표시하려면 타입과 mapper에 추가해야 한다.

---

## 4. 백엔드에만 있는 API

| Method | Endpoint | 설명 | 프론트 상태 |
|---|---|---|---|
| `PUT` | `/api/v1/users/me` | 내 정보 수정 | 미구현 |
| `DELETE` | `/api/v1/users/me` | 회원 탈퇴 | 미구현 |
| `GET` | `/api/v1/teams/{teamId}/contis` | 팀별 콘티 목록 | 미사용 |

현재 프론트는 팀별 콘티 API 대신 아래 요청으로 최대 100개를 가져온 뒤 클라이언트에서 `teamId`를 필터링한다.

```http
GET /api/v1/contis?page=0&size=100
```

권장 수정:

- `GET /api/v1/teams/{teamId}/contis`를 사용해 불필요한 전체 조회와 클라이언트 필터링을 제거한다.

---

## 5. 프론트에만 있는 API

### 현재 사용 중

| Method | Endpoint | 예상 영향 |
|---|---|---|
| `GET` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 팀 곡 상세 실패 |
| `POST` | `/api/v1/teams/{teamId}/songs` | 팀 곡 생성 실패 |
| `DELETE` | `/api/v1/teams/{teamId}/songs/{teamSongId}` | 팀 곡 삭제 실패 |
| `GET` | `/api/v1/songs?q={query}` | 마스터 곡 검색 실패 |

### 현재 정의만 존재

| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/dashboard/summary` |
| `GET` | `/api/v1/dashboard/contis/recent` |
| `GET` | `/api/v1/dashboard/songs` |
| `GET` | `/api/v1/dashboard/activities` |

현재 대시보드 화면은 백엔드에도 존재하는 아래 통합 API를 사용하므로 즉시 영향은 없다.

```http
GET /api/v1/teams/{teamId}/dashboard
```

### 별도 확인 필요

`/oauth2/authorization/google`은 백엔드 API 가이드의 기준 컨트롤러 목록에 없지만 Spring Security 설정에서 제공될 수 있다. 가이드 누락만으로 미구현이라고 단정할 수 없다.

---

## 6. 동작 방식 차이

### 6.1 Access token이 없으면 로그아웃 API를 호출하지 않음 (수정 완료)

백엔드는 access token 없이도 logout 요청을 처리하고 refresh token cookie를 삭제할 수 있다.

기존 프론트는 access token이 없으면 즉시 반환했다.

```ts
if (!accessToken) return;
```

기존 영향:

- 로컬 access token만 사라지고 refresh token cookie가 남은 상태에서 로그아웃하면 서버 세션 쿠키가 제거되지 않는다.
- 이후 앱을 다시 열 때 세션 복구가 될 수 있다.

적용한 수정:

- `logout` 함수의 access token 매개변수와 조기 반환을 제거했다.
- access token 유무와 관계없이 logout API를 호출해 refresh token cookie 삭제를 시도한다.
- 저장된 access token이 있으면 공통 Axios interceptor가 Authorization header를 자동으로 추가한다.

### 6.2 팀 곡 페이지 응답

백엔드는 Spring `Page<TeamSongResponse>`를 반환한다.

프론트는 아래 두 형태를 모두 처리하므로 목록 표시 자체는 가능하다.

- `TeamSongResponse[]`
- `{ content: TeamSongResponse[] }`

다만 `totalPages`, `totalElements` 등의 페이지 정보는 버려지므로 실제 페이지네이션 구현에는 사용할 수 없다.

### 6.3 팀 곡 정렬 Query

백엔드는 pageable의 `sort` 파라미터를 지원하지만 프론트 `TeamSongSearchParamsDto`에는 `sort`가 없다.

서버 정렬 기능을 사용하려면 타입에 추가해야 한다.

---

## 7. 일치하는 주요 API

아래 API는 경로와 HTTP method가 일치한다.

- 인증 refresh/logout 및 내 정보 조회
- 팀 생성/목록/상세/수정/삭제
- 팀 가입 및 멤버 관리
- 팀 곡 목록/수정
- 송폼 조회/수정 경로
- 콘티 생성/목록/상세/수정/상태 변경/삭제
- 콘티 곡 추가/수정/순서 변경/삭제
- 팀 대시보드

다만 경로가 일치해도 위에서 설명한 요청·응답 타입 차이는 별도로 수정해야 한다.

## 8. 권장 수정 순서

1. 백엔드에 없는 팀 곡 API 네 개의 구현 여부를 결정한다.
2. ~~`TeamResponseDto.members`와 `toTeamModel`을 백엔드 응답에 맞춘다.~~ (완료)
3. ~~사용자 ID 타입을 `string`으로 통일한다.~~ (완료)
4. 송폼 API에서 raw response를 처리하도록 수정한다.
5. ~~로그아웃을 access token 없이도 호출하도록 변경한다.~~ (완료)
6. 콘티 순서 변경 요청을 `{ contiSongIds }`로 통일한다.
7. 대시보드 전용 DTO를 분리한다.
8. `/teams/{teamId}/contis`를 사용하도록 콘티 목록 조회를 변경한다.
