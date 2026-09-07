# 한국관악협회 홈페이지

관악 협회 운영에 필요한 공개 홈페이지와 사무국용 관리 화면을 한 앱에 담았습니다.
React 19 + Tailwind CSS 로 만들었고, 데이터 저장은 Firebase(Firestore · Storage · Authentication)를 씁니다.

## 화면 구성

참고하신 한국음악협회 홈페이지의 구조를 따랐습니다. 대메뉴 5개 + 우측 전체메뉴,
서브페이지는 네이비 제목 띠와 박스형 소메뉴 타일, 회원가입은 단계 진행형입니다.

| 대메뉴 | 소메뉴 |
| --- | --- |
| 협회소개 | 사단법인 한국관악협회 · 이사장 인사말 · 협회 연혁 · 역대 이사장 · 조직도 · 임원 소개 · 정관 · CI 다운로드 · 오시는 길 |
| 협회행사 | 주요 사업 · 행사일정 |
| 회원/단체 | 회원 안내 · 가입 신청 · 지회·지부 · 산하단체 |
| 관악정보 | 관악계 소식 · 연주회 소식 · 자료실 · 일자리 정보 |
| 커뮤니티 | 공지사항 · 보도자료 · 정보공개 |

이 밖에 푸터에서 들어가는 회원정보 영역(서비스 이용약관, 개인정보 처리방침,
이메일 무단수집 거부)은 좌측 세로 메뉴 레이아웃을 씁니다.

**홈 화면**

- 상단 배너 슬라이더 (관리자가 등록·교체, 좌우 이동과 자동 넘김)
- 공지사항 · 보도자료 탭 목록
- 지회·지부 · 산하단체 탭 카드
- 협회의 활동, 다가오는 행사, 가입 안내 띠

**회원 가입 신청** — `01 가입확인 → 02 약관동의 → 03 정보입력 → 04 입력확인 → 05 신청완료`
5단계로 진행하며, 01 단계에서 같은 이름·연락처로 이미 접수된 신청이 있으면 걸러 냅니다.

**관리자 화면 (`/admin`)**

- **회원 관리** — 이름·소속·연락처 검색, 상태/구분 필터, 다건 선택 일괄 승인,
  개별 정보 수정·삭제, 현재 필터 결과 그대로 엑셀(.xlsx) 내려받기
- **게시판 관리** — 6개 게시판(공지사항·보도자료·정보공개·관악계 소식·연주회 소식·일자리 정보)을
  한 화면에서 전환하며 글 작성·수정·삭제, 분류 지정, 상단 고정
- **자료실 관리** — 파일 업로드(분류·설명 포함), 내려받기, 삭제
- **일정 관리** — 행사 일정 추가·수정·삭제
- **배너 관리** — 홈 배너 추가·수정·삭제, 이미지 업로드, 연결 페이지·배경색·순서 지정

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

    // 게시판 6종 — 방문자는 조회수만 올릴 수 있다
    match /{board}/{doc} {
      allow read: if board in ['notices', 'press', 'disclosure',
                               'sceneNews', 'concertNews', 'jobs'];
      allow create, delete: if isAdmin()
        && board in ['notices', 'press', 'disclosure',
                     'sceneNews', 'concertNews', 'jobs'];
      allow update: if board in ['notices', 'press', 'disclosure',
                                 'sceneNews', 'concertNews', 'jobs']
        && (isAdmin() || onlyChanges(['views']));
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

    match /banners/{doc} {
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
    match /{folder}/{file} {
      allow read: if folder in ['resources', 'banners'];   // 자료실·배너 이미지는 공개
      allow write: if request.auth != null
        && folder in ['resources', 'banners'];             // 로그인 계정만 업로드
    }
  }
}
```

Storage 규칙에서는 Firestore 의 `admins` 문서를 조회할 수 없어 "로그인 여부"까지만 확인합니다.
관리자 계정만 만들어 두면 실질적으로 사무국만 업로드할 수 있습니다.

## 협회 정보 수정

채워야 할 항목을 화면별로 정리한 목록은 **[CONTENT.md](CONTENT.md)** 에 있습니다.
사무국에 그대로 전달해 취합하시면 됩니다.

홈페이지에 보이는 고정 문구는 모두 **`src/data/site.js`** 한 파일에 모여 있습니다.
현재 값은 화면 구성을 보여주기 위한 예시이므로 실제 협회 정보로 바꿔 주세요.

- `org` — 법인명, 주소, 전화·팩스, 이메일, 업무시간, 회비 계좌, 고유번호
- `menus` — 대메뉴·소메뉴 구성 (여기를 고치면 상단 메뉴, 서브페이지 타일, 전체메뉴가 함께 바뀝니다)
- `greeting` / `overview` — 이사장 인사말, 법인 개요와 주요 활동
- `history` / `pastChairs` / `executives` / `organization` — 연혁, 역대 이사장, 임원, 조직도
- `bylaws` — 정관 조문
- `programs` — 주요 사업
- `memberTypes` / `memberBenefits` / `joinSteps` — 회원 구분·회비·혜택·가입 절차
- `branches` / `affiliates` — 지회·지부, 산하단체
- `instruments`, `regions`, `resourceCategories` — 선택 항목 목록

게시판을 늘리거나 이름을 바꾸려면 **`src/data/boards.js`** 에 항목을 추가하면 됩니다.
목록·상세 화면과 관리자 화면이 이 정의를 그대로 따라갑니다.

`src/pages/AboutLocation.js` 의 "지도 영역"은 자리만 잡아 두었습니다.
카카오맵이나 네이버 지도 스크립트를 넣으면 실제 약도가 표시됩니다.

CI 파일은 `public/ci-logo.svg`(가로형)와 `public/favicon.svg`(심볼)입니다.
협회 실제 로고로 교체하시면 CI 다운로드 페이지에도 그대로 반영됩니다.

## 색상

차콜 잉크(무채색)에 구릿빛 포인트를 쓰는 조합입니다.
`tailwind.config.js` 의 `colors` 두 묶음이 전부이고, 여기만 고치면 사이트 전체가 따라 바뀝니다.

| 토큰 | 쓰임 | 기준 색 |
| --- | --- | --- |
| `brand` (50~950) | 바탕·글자·어두운 띠 | `#2B303A` (900) |
| `accent` (300~600) | 강조·포인트 | `#C2703D` (500) |

색을 바꿀 때 같이 손봐야 하는 곳:

- `public/index.html` 의 `theme-color` (모바일 브라우저 상단 색)
- `public/favicon.svg`, `public/ci-logo.svg` 의 색값
- `src/pages/AboutCI.js` 의 `COLORS` 색상표

홈 배너 배경은 협회 색상 안에서만 조합하므로(짙은 톤 / 밝은 톤 / 금색 톤 / 금색+짙은 톤)
팔레트를 바꾸면 배너도 함께 따라갑니다.

## 글꼴

본문은 **Pretendard**, 제목은 **나눔명조**를 씁니다. 둘 다 `npm` 패키지로 받아
사이트 안에 함께 담기 때문에 외부 CDN 을 타지 않습니다. 학교·관공서 망에서
구글 폰트가 막히거나 느려도 항상 같은 글꼴로 보입니다.

| | 글꼴 | 첫 방문 내려받기 |
| --- | --- | --- |
| 본문·UI (`font-sans`) | Pretendard Variable | 약 250KB (쓰인 글자의 조각만) |
| 제목 (`font-serif`) | 나눔명조 700 | 약 560KB (한글 한 벌) |
| 영문 전용 (`font-display`) | Montserrat 600·800 | 약 20KB (라틴만) |

`font-display` 는 협회 영문명과 서브페이지 제목 위 영문 약칭처럼 **영문만 들어가는 자리**에
씁니다. 한글 글리프가 없으므로 한글에는 쓰지 마세요. 약칭은 `src/data/site.js` 의
`org.abbr` 이며 지금은 예시값입니다.

Pretendard 는 가변 폰트를 자모 단위로 쪼갠 판이라 화면에 실제로 쓰인 글자의
조각만 내려받습니다. 나눔명조는 쪼갠 판이 없어 한글 한 벌을 통째로 받습니다.
`font-display: swap` 이 걸려 있어 글자는 즉시 보이고, 명조가 도착하면 제목만 바뀝니다.

제목도 Pretendard 로 통일해 이 560KB 를 없애려면 `tailwind.config.js` 의
`serif` 를 `sans` 와 같게 두고 `src/index.css` 의 나눔명조 `@import` 두 줄을 지우면 됩니다.

글꼴을 바꾸려면 두 곳만 고치면 됩니다.

- `src/index.css` 맨 위의 `@import` — 어떤 글꼴 파일을 담을지
- `tailwind.config.js` 의 `fontFamily` — `sans`(본문)와 `serif`(제목) 지정

## 배포

`npm run build` 결과인 `build/` 폴더를 정적 호스팅에 올리면 됩니다.
주소에 해시(`#`)를 쓰는 라우터라 서버 리다이렉트 설정 없이도 새로고침과 직접 링크가 동작합니다.

## 폴더 구조

```
src/
  data/
    site.js           협회 정보·문구·메뉴 (여기만 고치면 내용이 바뀝니다)
    boards.js         게시판 정의 (공지사항·보도자료·정보공개·소식·채용)
  lib/
    firebase.js       Firebase 초기화 (.env 가 비면 연결하지 않음)
    store.js          Firestore/localStorage 공통 데이터 계층
    auth.js           관리자 로그인
    router.js         해시 기반 라우터
    seed.js           데모 모드 예시 데이터
    useCollection.js  컬렉션 실시간 구독 훅
    download.js       파일 내려받기 도우미
  components/
    Header.js         대메뉴·타일 드롭다운·전체메뉴·모바일 서랍
    Footer.js         사무국 정보와 약관 링크
    HeroSlider.js     홈 배너 슬라이더
    ui.js             서브페이지 레이아웃(타일형·사이드바형)과 공통 UI 요소
  pages/              각 페이지 (admin/ 아래는 관리자 화면)
    Board.js          모든 게시판이 함께 쓰는 목록·상세 화면
```
