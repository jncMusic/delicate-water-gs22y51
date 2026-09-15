# Firebase 설정

게시글·회원·업로드 파일을 저장하고 관리자 로그인을 처리하는 곳입니다.
설정 전에는 **데모 모드**로 돌아가서, 입력한 내용이 그 브라우저에만 남고 사무국에서 볼 수 없습니다.

전부 [Firebase 콘솔](https://console.firebase.google.com/)에서 하는 작업이고, 20분 정도 걸립니다.

---

## 1. 프로젝트 만들기

1. 콘솔에서 **프로젝트 추가**
2. 이름은 `kba-homepage` 처럼 알아보기 쉬운 것으로
3. Google 애널리틱스는 **사용 안 함**으로 두어도 됩니다 (나중에 켤 수 있습니다)

## 2. 웹 앱 등록하고 설정값 받기

1. 프로젝트 개요 화면에서 **웹 아이콘(`</>`)** 클릭
2. 앱 닉네임은 아무거나 (`kbaband`), **호스팅 설정은 체크하지 않음**
3. 다음 화면에 나오는 `firebaseConfig` 값을 복사해 둡니다

```js
const firebaseConfig = {
  apiKey: "AIza...",              // ← REACT_APP_FIREBASE_API_KEY
  authDomain: "....firebaseapp.com",  // ← REACT_APP_FIREBASE_AUTH_DOMAIN
  projectId: "kba-homepage",      // ← REACT_APP_FIREBASE_PROJECT_ID
  storageBucket: "....firebasestorage.app",  // ← REACT_APP_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",    // ← REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123...:web:abc...",   // ← REACT_APP_FIREBASE_APP_ID
};
```

> **이 값들은 비밀이 아닙니다.** 브라우저에 그대로 실려 나가는 공개 식별자이고,
> 실제 보안은 아래 **보안 규칙**이 담당합니다. 규칙을 제대로 넣는 것이 핵심입니다.

`storageBucket` 은 프로젝트를 만든 시점에 따라 `....firebasestorage.app` 또는
`....appspot.com` 으로 나옵니다. **콘솔에 나온 값을 그대로** 넣으면 됩니다.

`measurementId` 가 같이 나오더라도 `.env` 에 넣지 않습니다.
Google 애널리틱스는 켜지 않았고(코드에서도 초기화하지 않습니다),
켜려면 방문자 추적 사실을 **개인정보 처리방침에 먼저 고지**해야 합니다.

`.env` 파일에 옮겨 적습니다.

```bash
cp .env.example .env
```

```bash
REACT_APP_SITE_URL=https://kbaband.kr

REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=kba-homepage.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=kba-homepage
REACT_APP_FIREBASE_STORAGE_BUCKET=kba-homepage.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123...:web:abc...
```

`.env` 는 `.gitignore` 에 있어 저장소에 올라가지 않습니다.
호스팅(Cloudflare Pages·Netlify·Vercel)에 올릴 때는 각 서비스의
**환경 변수** 설정에 같은 값을 넣어야 합니다.

## 3. Firestore Database

1. 좌측 메뉴 **Firestore Database** → **데이터베이스 만들기**
2. 시작 모드는 **프로덕션 모드**를 고르세요.
   테스트 모드는 30일 동안 **누구나 읽고 쓸 수 있고** 이후 전부 막힙니다.
3. 위치는 **asia-northeast3 (서울)** — **나중에 바꿀 수 없습니다.**
4. 만들어지면 **규칙** 탭에서 [아래 규칙](#firestore-보안-규칙)을 붙여넣고 **게시**

## 4. Storage (자료실 파일·배너 이미지)

1. 좌측 메뉴 **Storage** → **시작하기**
2. 위치는 Firestore 와 같게
3. **규칙** 탭에 [아래 규칙](#storage-보안-규칙)을 붙여넣고 **게시**

> 프로젝트를 만든 시점에 따라 Storage 가 **종량제(Blaze) 요금제 전환**을 요구할 수 있습니다.
> 카드 등록이 필요하지만 협회 규모에서는 무료 한도 안이라 실제 청구는 거의 0원입니다.
> 안심하시려면 결제 → 예산 및 알림에서 **월 예산 알림**을 걸어 두세요.

## 5. Authentication (관리자 로그인)

1. 좌측 메뉴 **Authentication** → **시작하기**
2. **Sign-in method** 탭에서 **이메일/비밀번호** 사용 설정
3. **Users** 탭 → **사용자 추가** 로 사무국 관리자 계정을 직접 만듭니다
   (가입 화면이 따로 없습니다. 관리자 계정은 콘솔에서만 만듭니다.)
4. 만들어진 사용자의 **UID** 를 복사해 둡니다
5. **Settings → 승인된 도메인**에 `kbaband.kr` 을 추가합니다.
   이걸 빠뜨리면 실제 도메인에서 로그인이 막힙니다.

## 6. 관리자 권한 주기

Authentication 에 계정이 있다고 관리자가 되는 것이 아니라,
Firestore 의 `admins` 목록에 있어야 회원 명단을 볼 수 있습니다.

1. **Firestore Database → 데이터** 탭
2. **컬렉션 시작** → 컬렉션 ID `admins`
3. **문서 ID** 에 5번에서 복사한 **UID** 를 붙여넣습니다
4. 필드는 없어도 되지만, 알아보기 쉽게 `name` / `email` 정도 넣어 두세요

관리자를 늘리려면 5번(계정 추가)과 6번(UID 문서 추가)을 반복하고,
권한을 뺄 때는 `admins` 의 문서를 지우면 됩니다.

## 7. 확인

```bash
npm install
npm start
```

- 관리자 로그인 화면이 **이메일 + 비밀번호**로 바뀌어 있으면 연결된 것입니다
  (데모 모드일 때는 통과 코드 한 칸만 나옵니다)
- 관리자 페이지 위의 노란 **데모 모드** 안내가 사라집니다
- 공지 한 건을 올려 보고 Firestore 콘솔의 `notices` 에 문서가 생기는지 확인하세요

### 어디까지 됐는지 터미널에서 확인하기

브라우저를 열지 않고도 세 가지가 켜졌는지 바로 볼 수 있습니다.
`.env` 를 채운 뒤 프로젝트 폴더에서 실행하세요.

```bash
npm run check:firebase
```

| 항목 | 아직 안 된 상태 | 된 상태 |
| --- | --- | --- |
| Firestore | `NOT_FOUND` (DB 없음) | `PERMISSION_DENIED` — 규칙이 막고 있다는 뜻이라 **정상** |
| Storage | `Not Found.` | 빈 목록(`{}`) 또는 권한 오류 |
| Authentication | `CONFIGURATION_NOT_FOUND` | `EMAIL_NOT_FOUND` / `INVALID_LOGIN_CREDENTIALS` |

Firestore 가 `PERMISSION_DENIED` 로 나오는 것은 잘못된 게 아닙니다.
데이터베이스가 있고 규칙이 바깥에서 오는 접근을 막고 있다는 뜻입니다.

---

## Firestore 보안 규칙

콘솔 **Firestore Database → 규칙** 에 그대로 붙여넣고 게시하세요.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // admins 목록에 문서가 있는 계정만 관리자다
    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isBoard(name) {
      return name in ['notices', 'press', 'disclosure',
                      'sceneNews', 'concertNews', 'jobs'];
    }

    // 방문자가 올릴 수 있는 것은 숫자 하나뿐이고, 그것도 1씩만 늘릴 수 있다
    function bumpsOnly(field) {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly([field])
        && request.resource.data[field] == resource.data[field] + 1;
    }

    // 게시판 6종 — 누구나 읽고, 쓰기는 관리자만. 조회수만 예외.
    match /{board}/{doc} {
      allow read: if isBoard(board);
      allow create, delete: if isAdmin() && isBoard(board);
      allow update: if isBoard(board) && (isAdmin() || bumpsOnly('views'));
    }

    match /resources/{doc} {
      allow read: if true;
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || bumpsOnly('downloads');
    }

    match /events/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /banners/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 가입 신청은 누구나 넣을 수 있다. 다만 아무 값이나 넣지는 못하게 막는다.
    // 특히 스스로 '승인' 상태로 만들 수 없어야 한다.
    match /members/{doc} {
      allow create: if request.resource.data.status == '대기'
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() < 100
        && request.resource.data.phone is string
        && request.resource.data.phone.size() < 30
        && request.resource.data.email is string
        && request.resource.data.email.size() < 200
        && request.resource.data.keys().size() < 30;
      allow read, update, delete: if isAdmin();
    }

    match /admins/{uid} {
      allow read: if isAdmin();
      allow write: if false;   // 콘솔에서만 추가·삭제합니다
    }
  }
}
```

**이 규칙이 지키는 것**

| | 방문자 | 관리자 |
| --- | --- | --- |
| 게시글·자료·행사·배너 읽기 | O | O |
| 게시글·자료·행사·배너 쓰기 | X | O |
| 조회수·다운로드수 1 올리기 | O | O |
| 가입 신청 넣기 | O (대기 상태로만) | O |
| **회원 명단 읽기** | **X** | O |
| 회원 정보 수정·삭제 | X | O |

## Storage 보안 규칙

콘솔 **Storage → 규칙** 에 붙여넣고 게시하세요.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{folder}/{file} {
      // 자료실 파일과 배너 이미지는 공개
      allow read: if folder in ['resources', 'banners'];
      // 올리기는 로그인한 계정만, 한 번에 20MB 까지
      allow write: if request.auth != null
        && folder in ['resources', 'banners']
        && request.resource.size < 20 * 1024 * 1024;
    }
  }
}
```

Storage 규칙에서는 Firestore 의 `admins` 문서를 조회할 수 없어 "로그인 여부"까지만 확인합니다.
관리자 계정만 만들어 두면 실질적으로 사무국만 업로드할 수 있습니다.

---

## 자주 막히는 곳

| 증상 | 원인 |
| --- | --- |
| 관리자 로그인이 통과 코드 한 칸으로 나온다 | `.env` 값이 비어 있거나 개발 서버를 다시 시작하지 않음 |
| 실제 도메인에서만 로그인이 안 된다 | Authentication → Settings → 승인된 도메인에 `kbaband.kr` 미등록 |
| 로그인은 되는데 회원 목록이 비어 있다 | `admins` 에 그 계정의 UID 문서가 없음 |
| 파일 업로드가 실패한다 | Storage 미생성, 규칙 미게시, 또는 20MB 초과 |
| 콘솔에 `permission-denied` 가 뜬다 | 규칙을 게시하지 않았거나 테스트 모드 기간이 끝남 |

## 백업

회원 정보는 되살릴 수 없으니 주기적으로 내보내세요.

- **간단한 방법** — 관리자 화면 → 회원 관리 → **엑셀 내려받기**
- **전체 백업** — 콘솔의 Firestore → 가져오기/내보내기 (Blaze 요금제 필요)
