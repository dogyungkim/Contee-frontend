# 콘티 공유 기능 PRD

## 1. 배경

Contee의 콘티는 현재 팀 내부 사용자를 중심으로 작성, 수정, 열람된다. 실제 예배 준비 과정에서는 찬양팀 내부뿐 아니라 설교자, 예배 인도자, 음향/영상 봉사자, 게스트 세션 등 팀 외부 인원에게도 콘티를 공유해야 하는 경우가 많다.

따라서 공유 기능을 두 가지로 분리한다.

- 팀 공유: 기존 팀원만 볼 수 있는 내부 공유
- 외부 공유: 팀원이 아니어도 링크를 가진 사람이 볼 수 있는 읽기 전용 공유

## 2. 목표

- 콘티 상세 화면에서 팀 공유 링크를 빠르게 복사할 수 있다.
- 콘티 상세 화면에서 외부 공유 링크를 생성, 복사, 비활성화할 수 있다.
- 외부 공유 링크는 인증 없이 접근할 수 있다.
- 외부 공유 화면은 읽기 전용이다.
- 외부 공유 링크는 추측하기 어려운 token 기반 URL을 사용한다.

## 3. 비목표

MVP에서는 아래 기능을 포함하지 않는다.

- 외부 공유 링크별 상세 권한 설정
- 외부 공유 만료일 설정
- 외부 공유 열람 로그
- 비밀번호 보호
- 여러 개의 외부 공유 링크 동시 운영
- PDF 다운로드
- 외부 사용자의 댓글/확인 체크

위 기능은 추후 확장 후보로 둔다.

## 4. 사용자 시나리오

### 4.1 팀 공유

찬양팀 리더가 콘티 상세 화면에서 공유 버튼을 누른다. "팀 공유 링크 복사"를 선택하면 현재 콘티 상세 URL이 클립보드에 복사된다.

복사된 링크 예시:

```text
/dashboard/contis/{contiId}
```

링크를 받은 사용자는 로그인 후 해당 팀 멤버 권한이 있으면 콘티를 볼 수 있다. 팀 멤버가 아니면 접근할 수 없다.

### 4.2 외부 공유

찬양팀 리더가 콘티 상세 화면에서 공유 버튼을 누른다. "외부 공유 링크 만들기"를 선택하면 외부 공유가 활성화되고, token 기반 공유 URL이 생성된다.

복사된 링크 예시:

```text
/share/contis/{shareToken}
```

링크를 받은 외부 사용자는 로그인 없이 콘티를 읽기 전용으로 볼 수 있다.

외부 공유가 이미 활성화되어 있으면 공유 메뉴에서 다음 액션을 제공한다.

- 외부 공유 링크 복사
- 외부 공유 끄기

## 5. 권한 정책

### 5.1 팀 공유

- 기존 콘티 상세 권한 정책을 그대로 따른다.
- 팀 Access 권한이 있는 사용자만 열람 가능하다.
- `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`가 열람 가능하다.
- 편집 가능 여부는 기존 Editor 정책을 따른다.

### 5.2 외부 공유 생성/해제

외부 공유 링크 생성, 복사, 비활성화는 팀 Editor 이상에게 허용하는 것을 제안한다.

허용 역할:

- `OWNER`
- `ADMIN`
- `MEMBER`

대안:

- Manager 이상만 허용: `OWNER`, `ADMIN`

결정 필요:

- 외부 공개 링크 생성 권한을 Editor로 둘지 Manager로 둘지 백엔드/제품 논의 필요

### 5.3 외부 공유 열람

- 인증 불필요
- 링크 token 필요
- 링크가 비활성화되었거나 존재하지 않으면 접근 불가
- 콘티 삭제 시 외부 공유 링크도 접근 불가

## 6. 외부 공유 화면 노출 정보

MVP에서는 콘티 상세의 읽기 전용 정보를 기본 노출한다.

노출 권장:

- 콘티 제목
- 예배일
- 곡 순서
- 곡 제목
- 아티스트
- Key
- BPM
- YouTube 링크
- 말씀 본문
- 나눔 정보

논의 필요:

- 콘티 메모 노출 여부
- 곡별 콘티 메모 노출 여부
- 악보 링크 노출 여부

초기 제안:

- 콘티 메모와 곡별 메모는 노출한다.
- 악보 링크는 노출한다.
- 단, 저작권/접근권한 이슈가 있으면 외부 공유에서 악보 링크를 제외할 수 있도록 추후 옵션화한다.

## 7. 프론트 UX 요구사항

### 7.1 공유 버튼

콘티 상세 화면의 기존 "공유" 버튼을 실제 기능으로 연결한다.

공유 버튼 클릭 시 메뉴 또는 다이얼로그를 표시한다.

외부 공유 비활성 상태:

- 팀 공유 링크 복사
- 외부 공유 링크 만들기

외부 공유 활성 상태:

- 팀 공유 링크 복사
- 외부 공유 링크 복사
- 외부 공유 끄기

### 7.2 외부 공유 생성 확인

외부 공유 생성 전 확인 문구를 표시한다.

```text
외부 공유를 켜면 링크를 가진 누구나 이 콘티를 볼 수 있습니다.
```

확인 버튼:

```text
외부 공유 켜기
```

### 7.3 외부 공유 해제 확인

외부 공유 해제 전 확인 문구를 표시한다.

```text
외부 공유를 끄면 기존 링크로 더 이상 콘티를 볼 수 없습니다.
```

확인 버튼:

```text
외부 공유 끄기
```

### 7.4 읽기 전용 외부 페이지

URL:

```text
/share/contis/{shareToken}
```

외부 공유 페이지에는 아래 요소를 숨긴다.

- 편집 버튼
- 저장 버튼
- 곡 추가
- 곡 삭제
- 순서 변경
- 팀 설정/권한 관련 UI

## 8. 백엔드 API 제안

### 8.1 외부 공유 상태 조회

콘티 상세 응답에 공유 상태를 포함하는 방식을 제안한다.

`GET /api/v1/contis/{id}` 응답 `data`에 추가:

```json
{
  "externalShare": {
    "enabled": true,
    "token": "share-token",
    "url": "https://app.contee.com/share/contis/share-token",
    "createdAt": "2026-06-23T10:00:00",
    "createdById": "user-uuid"
  }
}
```

대안:

- 콘티 상세 응답에는 `externalShareEnabled`만 포함하고, 별도 API로 공유 상태 조회

초기 제안:

- 프론트 UX 단순화를 위해 콘티 상세 응답에 현재 외부 공유 상태를 포함한다.

### 8.2 외부 공유 생성 또는 활성화

```http
POST /api/v1/contis/{id}/external-share
```

Auth:

- 필요

권한:

- Editor 또는 Manager, 결정 필요

동작:

- 외부 공유 링크가 없으면 새 token 생성
- 이미 외부 공유 링크가 있고 활성 상태면 기존 링크 반환
- 기존 링크가 비활성 상태면 재활성화하거나 새 token 발급

초기 제안:

- 비활성 후 다시 켤 때는 새 token을 발급한다.
- 기존에 유출된 링크가 다시 살아나는 것을 방지하기 위함이다.

응답:

```json
{
  "success": true,
  "message": "External share enabled successfully",
  "data": {
    "enabled": true,
    "token": "share-token",
    "url": "https://app.contee.com/share/contis/share-token",
    "createdAt": "2026-06-23T10:00:00"
  }
}
```

### 8.3 외부 공유 비활성화

```http
DELETE /api/v1/contis/{id}/external-share
```

Auth:

- 필요

권한:

- 생성 권한과 동일

동작:

- 외부 공유 링크를 비활성화한다.
- 이후 기존 token으로 접근하면 404 또는 410 계열 에러를 반환한다.

응답:

```json
{
  "success": true,
  "message": "External share disabled successfully",
  "data": null
}
```

### 8.4 외부 공유 콘티 조회

```http
GET /api/v1/share/contis/{token}
```

Auth:

- 불필요

권한:

- token 기반 접근

응답:

```json
{
  "success": true,
  "message": "Shared conti retrieved successfully",
  "data": {
    "id": "conti-uuid",
    "title": "2026.06.14 주일 예배",
    "worshipDate": "2026-06-14",
    "memo": "예배 메모",
    "bibleVerse": "시편 23편",
    "sharingInfo": "공유 문구",
    "contiSongs": [
      {
        "id": "conti-song-uuid",
        "teamSongId": "team-song-uuid",
        "title": "곡 제목",
        "artist": "Artist",
        "orderIndex": 0,
        "key": "G",
        "bpm": 70,
        "note": "전주 짧게",
        "youtubeUrl": "https://...",
        "sheetMusicUrl": "https://...",
        "songForm": []
      }
    ]
  }
}
```

응답 DTO는 내부 `ContiResponse`를 재사용할 수 있으나, 외부 노출 필드를 제어하기 위해 별도 `SharedContiResponse`를 권장한다.

## 9. 데이터 모델 제안

MVP에서는 콘티당 활성 외부 공유 링크 1개를 권장한다.

별도 테이블 방식:

```text
ContiShareLink
- id: UUID
- contiId: UUID
- token: String, unique
- enabled: boolean
- createdById: UUID
- createdAt: LocalDateTime
- disabledAt: LocalDateTime nullable
- expiresAt: LocalDateTime nullable
```

제약:

- `token`은 unique
- 활성 링크는 콘티당 1개

token:

- UUID v4, ULID, 또는 충분한 entropy를 가진 random string
- URL에 직접 노출되므로 추측 불가능해야 한다.

## 10. 에러 정책 제안

외부 공유 생성/해제:

- `CONTI_NOT_FOUND`
- `TEAM_ACCESS_DENIED`
- `INVALID_INPUT_VALUE`

외부 공유 조회:

- token이 없거나 잘못됨: `SHARE_LINK_NOT_FOUND`
- 비활성화됨: `SHARE_LINK_DISABLED` 또는 `SHARE_LINK_NOT_FOUND`
- 만료됨: `SHARE_LINK_EXPIRED`

MVP 제안:

- 보안상 token 상태를 자세히 노출하지 않고 404 성격의 `SHARE_LINK_NOT_FOUND`로 통일해도 된다.

## 11. 프론트 구현 범위

백엔드 API 확정 후 프론트에서 구현할 항목:

- 콘티 상세 공유 버튼 메뉴 연결
- 팀 공유 링크 복사
- 외부 공유 생성 API 연동
- 외부 공유 링크 복사
- 외부 공유 해제 API 연동
- 외부 공유 상태 표시
- `/share/contis/{token}` 페이지 추가
- 외부 공유 콘티 조회 API 추가
- 외부 공유 읽기 전용 컴포넌트 구성

## 12. 결정 필요 항목

- 외부 공유 생성/해제 권한: Editor vs Manager
- 외부 공유 조회 응답 DTO: 내부 `ContiResponse` 재사용 vs 별도 `SharedContiResponse`
- 외부 공유에 노출할 필드 범위
- 악보 링크 외부 노출 여부
- 비활성 후 재활성화 시 기존 token 재사용 vs 새 token 발급
- 비활성/만료 token 접근 시 에러 코드
- 외부 공유 URL의 최종 path

## 13. MVP 권장안

- 팀 공유는 기존 `/dashboard/contis/{id}` 링크 복사로 처리
- 외부 공유는 token 기반 `/share/contis/{token}` 사용
- 외부 공유 생성/해제 권한은 Manager 이상으로 시작
- 외부 공유는 읽기 전용
- 콘티당 활성 외부 공유 링크는 1개
- 외부 공유를 끄고 다시 켜면 새 token 발급
- 외부 조회 응답은 별도 `SharedContiResponse` 사용
- 악보 링크는 MVP에서 포함하되, 이후 옵션화 검토
