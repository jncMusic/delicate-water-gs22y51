# 한국관악협회 홈페이지

관악 협회 운영에 필요한 공개 홈페이지와 사무국용 관리 화면을 한 앱에 담았습니다.
React 19 + Tailwind CSS 로 만들었고, 데이터 저장은 Firebase(Firestore · Storage · Authentication)를 씁니다.

## 화면 구성

| 구분 | 경로 | 내용 |
| --- | --- | --- |
| 홈 | `/` | 협회 소개, 최신 공지·행사·자료, 가입 안내 |
| 협회소개 | `/about/intro` 외 | 인사말, 연혁, 조직도, 정관, 오시는 길 |
| 협회소식 | `/news/notice`, `/news/events` | 공지사항(목록·상세·검색·분류), 행사일정 |
| 사업안내 | `/programs` | 경연대회·정기연주회·연수 등 연간 사업 |
| 자료실 | `/resources` | 자료 검색·분류·내려받기 |
| 회원안내 | `/members/guide`, `/members/apply` | 회원 구분·회비·절차, 온라인 가입 신청 |
| 관리자 | `/admin` | 회원 관리, 공지 관리, 자료실 관리, 일정 관리 |

관리자 화면에서 할 수 있는 일

- **회원 관리** — 신청 목록 조회, 이름·소속·연락처 검색, 상태/구분 필터, 다건 선택 일괄 승인,
  개별 정보 수정, 삭제, 현재 필터 결과 그대로 엑셀(.xlsx) 내려받기
- **공지 관리** — 글 작성·수정·삭제, 분류 지정, 상단 고정
- **자료실 관리** — 파일 업로드(분류·설명 포함), 내려받기, 삭제
- **일정 관리** — 행사 일정 추가·수정·삭제

## 실행

```bash
npm install
npm start        # http://localhost:3000
npm run build    # build/ 에 정적 파일 생성
```

`.env` 를 만들지 않아도 바로 실행됩니다. 이때는 **데모 모드**로 동작해서
예시 데이터가 브라우저(localStorage)에만 저장되고, 관리자 로그인은 통과 코드(`admin`)만 확인합니다.
화면과 기능을 먼저 확인한 뒤 Firebase 를 연결하시면 됩니다.

## Firebase 연결

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 만듭니다.
2. **Firestore Database**, **Storage**, **Authentication**(이메일/비밀번호)을 사용 설정합니다.
3. Authentication 에서 사무국 관리자 계정을 직접 추가합니다.
4. Firestore 에 `admins` 컬렉션을 만들고, 문서 ID 를 3번에서 만든 계정의 **UID** 로 하는 빈 문서를 넣습니다.
   (이 문서가 있는 계정만 관리자 권한을 갖습니다.)
5. 프로젝트 설정 → 내 앱 → 웹 앱의 SDK 설정값을 `.env` 에 넣습니다.

```bash
cp .env.example .env
# .env 를 열어 REACT_APP_FIREBASE_* 값을 채웁니다
```

`.env` 는 `.gitignore` 에 있어 저장소에 올라가지 않습니다.
값이 채워지면 앱이 자동으로 Firebase 모드로 전환되고, 관리자 로그인도 Firebase 계정으로 바뀝니다.

### Firestore 보안 규칙

콘솔의 Firestore → 규칙에 아래를 넣으세요. 조회수·다운로드수만 방문자가 올릴 수 있고,
그 밖의 쓰기는 관리자만 가능합니다. 가입 신청은 누구나 넣을 수 있지만 열람은 관리자만 합니다.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function onlyChanges(fields) {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(fields);
    }

    match /notices/{doc} {
      allow read: if true;
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || onlyChanges(['views']);
    }

    match /resources/{doc} {
      allow read: if true;
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || onlyChanges(['downloads']);
    }

    match /events/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 가입 신청은 누구나, 열람·수정·삭제는 관리자만
    match /members/{doc} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /admins/{uid} {
      allow read: if isAdmin();
      allow write: if false;   // 콘솔에서만 추가합니다
    }
  }
}
```

### Storage 보안 규칙

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resources/{file} {
      allow read: if true;                    // 자료실은 공개
      allow write: if request.auth != null;   // 로그인 계정만 업로드
    }
  }
}
```

Storage 규칙에서는 Firestore 의 `admins` 문서를 조회할 수 없어 "로그인 여부"까지만 확인합니다.
관리자 계정만 만들어 두면 실질적으로 사무국만 업로드할 수 있습니다.

## 협회 정보 수정

홈페이지에 보이는 고정 문구는 모두 **`src/data/site.js`** 한 파일에 모여 있습니다.
현재 값은 화면 구성을 보여주기 위한 예시이므로 실제 협회 정보로 바꿔 주세요.

- `org` — 협회명, 주소, 전화·팩스, 이메일, 업무시간, 회비 계좌
- `menus` — 상단 메뉴 구성
- `greeting` — 인사말 본문과 서명
- `history` — 연혁
- `organization` — 조직도와 부서별 담당 업무
- `bylaws` — 정관 조문
- `programs` — 주요 사업
- `memberTypes`, `joinSteps` — 회원 구분·회비·가입 절차
- `instruments`, `regions`, `noticeCategories`, `resourceCategories` — 선택 항목 목록

`src/pages/AboutLocation.js` 의 "지도 영역"은 자리만 잡아 두었습니다.
카카오맵이나 네이버 지도 스크립트를 넣으면 실제 약도가 표시됩니다.

## 배포

`npm run build` 결과인 `build/` 폴더를 정적 호스팅에 올리면 됩니다.
주소에 해시(`#`)를 쓰는 라우터라 서버 리다이렉트 설정 없이도 새로고침과 직접 링크가 동작합니다.

## 폴더 구조

```
src/
  data/site.js        협회 정보·문구 (여기만 고치면 내용이 바뀝니다)
  lib/
    firebase.js       Firebase 초기화 (.env 가 비면 연결하지 않음)
    store.js          Firestore/localStorage 공통 데이터 계층
    auth.js           관리자 로그인
    router.js         해시 기반 라우터
    seed.js           데모 모드 예시 데이터
    useCollection.js  컬렉션 실시간 구독 훅
    download.js       파일 내려받기 도우미
  components/         Header, Footer, 공통 UI 요소
  pages/              각 페이지 (admin/ 아래는 관리자 화면)
```
