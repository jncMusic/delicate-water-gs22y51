/**
 * .env 에 적은 Firebase 프로젝트가 어디까지 준비됐는지 확인한다.
 *
 * 켜졌는지만 보는 게 아니라, 보안 규칙이 게시됐고 의도대로 막고 있는지까지 본다.
 * 공개돼야 할 것은 열려 있는지, 가려져야 할 것은 막혀 있는지 양쪽을 다 확인한다.
 */
const env = require("./env")();
const projectId = env.REACT_APP_FIREBASE_PROJECT_ID;
const apiKey = env.REACT_APP_FIREBASE_API_KEY;
const bucket = env.REACT_APP_FIREBASE_STORAGE_BUCKET;

if (!projectId || !apiKey) {
  console.error(".env 에 REACT_APP_FIREBASE_PROJECT_ID / REACT_APP_FIREBASE_API_KEY 가 없습니다.");
  console.error("FIREBASE.md 2단계를 먼저 끝내세요.");
  process.exit(1);
}

async function probe(url, init) {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* 본문이 JSON 이 아닐 수 있다 */ }
    return { status: res.status, message: (json && json.error && json.error.message) || "" };
  } catch (e) {
    return { status: 0, message: e.message };
  }
}

const fsUrl = (p) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${p}&key=${apiKey}`;
const stUrl = (p) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${p}`;

let failed = false;

function report(name, ok, detail) {
  if (!ok) failed = true;
  console.log(`  ${ok ? "정상" : "확인"}  ${name.padEnd(24)} ${detail}`);
}

(async () => {
  console.log(`\n프로젝트: ${projectId}\n`);

  // --- Firestore ---
  const notices = await probe(fsUrl("notices?pageSize=1"));
  const members = await probe(fsUrl("members?pageSize=1"));

  if (notices.status === 200) {
    report("공지 읽기(방문자)", true, "열려 있음");
  } else if (notices.status === 403) {
    report("공지 읽기(방문자)", false, "막혀 있음 — Firestore 규칙을 게시하세요");
  } else if (notices.status === 404) {
    report("Firestore", false, "데이터베이스가 없습니다 — FIREBASE.md 3단계");
  } else {
    report("공지 읽기(방문자)", false, `${notices.status} ${notices.message}`);
  }

  // 회원 명단이 열려 있으면 개인정보가 새는 것이라 가장 위험하다.
  report("회원 명단 보호", members.status === 403,
    members.status === 403 ? "막혀 있음" : `열려 있습니다 (${members.status}) — 규칙을 다시 확인하세요`);

  // --- Storage ---
  if (!bucket) {
    report("Storage", false, "REACT_APP_FIREBASE_STORAGE_BUCKET 이 비어 있습니다");
  } else {
    // 없는 파일이라 404 가 정상이다. 403 이면 규칙이 읽기를 막고 있다는 뜻.
    const open = await probe(stUrl("resources%2F_check.txt"));
    const shut = await probe(stUrl("_nosuchfolder%2F_check.txt"));
    const upload = await probe(
      `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=resources/_check.txt`,
      { method: "POST", headers: { "Content-Type": "text/plain" }, body: "check" });

    if (open.status === 404) report("자료실 읽기(방문자)", true, "열려 있음");
    else if (open.status === 403) report("자료실 읽기(방문자)", false, "막혀 있음 — Storage 규칙을 게시하세요");
    else report("Storage", false, `버킷 없음 또는 ${open.status} — FIREBASE.md 4단계`);

    report("엉뚱한 폴더 차단", shut.status === 403,
      shut.status === 403 ? "막혀 있음" : `열려 있습니다 (${shut.status})`);
    report("비로그인 업로드 차단", upload.status === 403,
      upload.status === 403 ? "막혀 있음" : `올라갔습니다 (${upload.status}) — 규칙을 다시 확인하세요`);
  }

  // --- Authentication ---
  // 없는 계정으로 물어본다. 로그인하려는 게 아니라 켜졌는지만 본다.
  const auth = await probe(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "check@example.invalid", password: "check-check", returnSecureToken: true }),
    }
  );
  const authOn = auth.message !== "CONFIGURATION_NOT_FOUND";
  report("관리자 로그인", authOn, authOn ? "켜져 있음" : "아직 켜지 않음 — FIREBASE.md 5단계");

  console.log(failed
    ? "\n위에서 '확인' 으로 나온 항목을 FIREBASE.md 에서 찾아 마저 해주세요.\n"
    : "\n전부 정상입니다. npm start 로 확인하세요.\n");
  process.exit(failed ? 1 : 0);
})();
