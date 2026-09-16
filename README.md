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

게시글·회원·업로드 파일을 저장하고 관리자 로그인을 처리합니다.
설정 전에는 **데모 모드**로 동작해서 입력한 내용이 그 브라우저에만 남습니다.

**설정 절차와 보안 규칙은 [FIREBASE.md](FIREBASE.md) 에 따로 정리했습니다.**
콘솔 작업 순서, 붙여넣을 규칙, 자주 막히는 곳까지 들어 있습니다.

요약하면 이렇습니다.

1. Firebase 프로젝트를 만들고 웹 앱을 등록해 설정값 6개를 `.env` 에 넣습니다
2. Firestore 를 **프로덕션 모드**, 위치 **asia-northeast3(서울)** 로 만듭니다
3. Storage 를 만듭니다
4. Authentication 에서 이메일/비밀번호를 켜고 관리자 계정을 만듭니다
5. Firestore 의 `admins` 컬렉션에 그 계정의 **UID** 로 문서를 만듭니다
6. Firestore·Storage 의 **보안 규칙**을 붙여넣고 게시합니다

`.env` 는 `.gitignore` 에 있어 저장소에 올라가지 않습니다. 호스팅에 올릴 때는
각 서비스의 환경 변수 설정에 같은 값을 넣어야 합니다.

> 설정값(API 키 등)은 비밀이 아닙니다. 브라우저에 실려 나가는 공개 식별자이고
> 실제 보안은 보안 규칙이 담당합니다. **규칙을 게시하는 단계를 빠뜨리지 마세요.**

## 오시는 길의 약도 (선택)

**기본은 주소 안내판입니다.** 협회는 지도 키 없이 주소만으로 운영하기로 했고,
방문객은 「주소 복사」와 「카카오맵·네이버 지도에서 보기」로 길찾기를 이어 갑니다.
키를 발급받을 필요가 없습니다.

나중에 그 자리에 실제 약도를 띄우고 싶으면 카카오맵 키를 넣으면 됩니다.
절차는 이렇습니다.

1. [developers.kakao.com](https://developers.kakao.com) 에 카카오 계정으로 로그인합니다
2. **내 애플리케이션 → 애플리케이션 추가하기** 로 앱을 하나 만듭니다
   (앱 이름 `한국관악협회`, 사업자명 `한국관악협회` 정도면 됩니다)
3. 만든 앱을 누르고 **앱 키** 에서 **JavaScript 키** 를 복사합니다
4. 왼쪽 **앱 설정 → 플랫폼 → Web 플랫폼 등록** 에서 사이트 도메인에
   `https://kbaband.kr` 을 넣습니다. **이걸 빠뜨리면 지도가 뜨지 않습니다.**
5. 복사한 키를 `REACT_APP_KAKAO_MAP_KEY` 로 넣습니다
   - 로컬: `.env`
   - 운영: Cloudflare 대시보드 → 해당 Worker → **Settings → Build →
     Variables and secrets** 에 추가한 뒤 다시 배포

주소는 `src/data/site.js` 의 `org.address` 를 그대로 읽어 좌표를 찾습니다.
좌표를 코드에 적어 두지 않으므로 사무국이 이사하면 주소만 고치면 됩니다.

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
- `branchList` / `branchSummary` / `branchTotals` — 지회·지부
- `instruments`, `regions`, `resourceCategories` — 선택 항목 목록

게시판을 늘리거나 이름을 바꾸려면 **`src/data/boards.js`** 에 항목을 추가하면 됩니다.
목록·상세 화면과 관리자 화면이 이 정의를 그대로 따라갑니다.

「오시는 길」의 교통 안내는 `src/data/site.js` 의 `directions` 입니다.
`지하철` / `버스` / `자가용` 중 채워 넣은 것만 화면에 나옵니다.
약도를 띄우는 방법은 위의 [오시는 길의 약도](#오시는-길의-약도-선택) 항목을 보세요.

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

도메인은 **kbaband.kr** 입니다.

```bash
cp .env.example .env     # 값을 채운 뒤
npm run build            # build/ 에 정적 파일 생성
```

`build/` 를 정적 호스팅에 올리면 됩니다. Cloudflare Workers, Netlify, Vercel,
Firebase Hosting 모두 무료 한도로 충분합니다.

### 지금 쓰는 곳 — Cloudflare Workers

저장소를 연결해 두어 커밋이 올라가면 자동으로 빌드·배포됩니다.

| | |
| --- | --- |
| Worker 이름 | `delicate-water-gs22y51` |
| 빌드 명령 | `npm run build` |
| 배포 명령 | `npx wrangler deploy` (운영 브랜치가 아니면 `wrangler versions upload`) |
| 설정 파일 | `wrangler.jsonc` |

**환경 변수는 저장소가 아니라 대시보드에 넣습니다.** Settings → Build →
Variables and secrets 에 `.env` 와 같은 `REACT_APP_*` 값을 넣어야 하며,
빠지면 빌드는 성공하지만 **데모 모드**로 올라가 가입 신청이 사무국에 닿지 않습니다.
값을 고친 뒤에는 다시 빌드해야 반영됩니다(Deployments → 해당 빌드 → Retry build,
또는 커밋을 하나 올리면 자동으로 돕니다).

운영 브랜치(기본 `main`)에서 올라온 것만 실제 주소에 반영되고, 다른 브랜치는
미리보기 주소로만 올라갑니다.

### SSL(https)

위 호스팅들은 도메인을 연결하면 **무료 인증서를 자동으로 발급·갱신**합니다.
따로 인증서를 구매하거나 설치할 필요가 없고, 넣을 자리도 없습니다.

구매한 인증서는 카페24·가비아 같은 전통 웹호스팅이나 직접 운영하는 서버에서만 씁니다.
이 사이트는 정적 파일이라 그런 호스팅을 쓸 이유가 없습니다.

### 주소 방식

기본은 `kbaband.kr/about/intro` 처럼 깔끔한 주소를 씁니다.
이 방식은 서버가 **"없는 주소는 index.html 을 주라"** 고 동작해야 하며,
설정 파일을 미리 넣어 두었습니다.

| 호스팅 | 설정 파일 | 별도 작업 |
| --- | --- | --- |
| Cloudflare Workers | `wrangler.jsonc` 의 `not_found_handling` | 없음 |
| Vercel | `vercel.json` | 없음 |
| Netlify | — | `public/_redirects` 에 `/*  /index.html  200` 을 새로 만들어야 합니다 |
| Firebase Hosting | — | `firebase.json` 에 `"rewrites": [{"source": "**", "destination": "/index.html"}]` |
| 일반 웹호스팅(카페24 등) | — | 설정이 어려우면 `.env` 에 `REACT_APP_ROUTER=hash` |

`REACT_APP_ROUTER=hash` 로 두면 주소에 `#` 이 붙지만 서버 설정 없이 동작합니다.

Cloudflare Workers 에는 `_redirects` 를 두지 않습니다. 같은 규칙을
`not_found_handling` 이 이미 처리하는데, 파일이 함께 있으면 Workers 가
`/* → /index.html` 을 무한 반복으로 판단해 업로드 자체를 거부합니다.

### 검색 노출과 링크 공유

`npm run build` 가 끝나면 `scripts/postbuild.js` 가 자동으로 처리합니다.

- `index.html` 의 공유 정보(og 태그)에 실제 주소를 채웁니다 — 카카오톡·네이버·페이스북에
  링크를 붙였을 때 제목·설명·이미지가 보입니다. 이미지는 `public/og-image.png` 입니다.
- `sitemap.xml` 과 `robots.txt` 를 만듭니다. 관리자 화면은 색인에서 제외합니다.
- 메뉴에 있는 화면을 하나씩 미리 그려 `build/about/intro.html` 처럼 진짜 HTML 로
  저장합니다(`scripts/prerender.js`). 아래 「자바스크립트 없이도 읽히게」 참고.

배포 후 [네이버 서치어드바이저](https://searchadvisor.naver.com)와
[구글 서치콘솔](https://search.google.com/search-console)에 사이트와 `sitemap.xml` 을
등록하면 검색에 나오기 시작합니다.

**소유 확인은 메타 태그로 합니다.** `public/index.html` 의 `<head>` 에 네이버와
구글 태그가 들어 있습니다. 비밀값이 아니라 이 사이트가 협회 계정 것임을 알리는
표식이라 저장소에 그대로 둡니다. **지우면 소유 확인이 풀립니다.**

> 구글이 주는 `public/google....html` 파일 방식은 이 호스팅에서 잘 안 됩니다.
> Cloudflare Workers 의 정적 파일 기본 설정(`html_handling`)이 `/이름.html` 요청을
> 확장자 없는 주소로 넘기기 때문에, 구글이 그 주소를 그대로 읽지 못하고
> "확인 파일에 잘못된 콘텐츠가 있습니다" 로 실패합니다. 파일은 남겨 두었지만
> **소유 확인은 메타 태그(HTML 태그) 방식으로 하세요.**

#### 자바스크립트 없이도 읽히게 (프리렌더)

이 홈페이지는 자바스크립트가 화면을 그리는 방식(SPA)입니다. 그대로 두면 서버가
주는 HTML 에는 `<div id="root"></div>` 한 줄뿐이라, **네이버 크롤러(Yeti)처럼
자바스크립트를 돌리지 않는 검색엔진에게는 읽을 글자가 없습니다.**

그래서 빌드 마지막에 `scripts/prerender.js` 가 메뉴에 있는 화면 27개를 미리 한 번
그려서 `build/<주소>.html` 로 저장합니다.

- Cloudflare Workers 가 `/about/intro` 요청에 `about/intro.html` 을 내주므로
  `sitemap.xml` 에 적은 주소 모양과 정확히 맞습니다.
- 브라우저로 들어온 사람에게는 React 가 같은 자리를 다시 그립니다. **보이는 화면은
  전과 똑같습니다.**
- 여기서 문제가 생기면 경고만 남기고 빌드는 그대로 끝납니다. 예전처럼 SPA 로
  배포될 뿐, 홈페이지가 안 열리지는 않습니다.

화면별 제목과 설명은 `src/data/seo.js` 한 곳에 있습니다. 프리렌더와 화면(`src/App.js`
의 `applyMeta`)이 같은 값을 써서, 주소가 바뀔 때마다 `<title>`·설명·대표 주소
(`canonical`)가 함께 바뀝니다.

`public/index.html` 에는 "이 사이트는 한국관악협회라는 단체의 공식 홈페이지"임을
기계가 읽는 형식으로 적은 부분(`application/ld+json`)이 있습니다. 구글이 단체 정보를
묶고 이름으로 찾을 때 공식 홈페이지를 가려내는 데 씁니다.

> 게시판 목록처럼 내용이 수시로 바뀌는 쪽은 미리 그린 HTML 에 **그 시점의 글**만
> 들어갑니다. 새 글은 사람이 볼 때 자바스크립트가 채워 넣고, 검색엔진에는 다음
> 배포 때 반영됩니다.

## 폴더 구조

```
src/
  data/
    site.js           협회 정보·문구·메뉴 (여기만 고치면 내용이 바뀝니다)
    boards.js         게시판 정의 (공지사항·보도자료·정보공개·소식·채용)
    seo.js            화면별 제목·설명 (검색 결과와 공유 카드에 쓰입니다)
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
