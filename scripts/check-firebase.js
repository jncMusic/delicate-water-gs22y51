/**
 * .env 에 적은 Firebase 프로젝트가 어디까지 준비됐는지 확인한다.
 * 콘솔에서 Firestore / Storage / Authentication 을 켰는지만 본다.
 * 데이터는 읽지 않고, 규칙이 막아 주는지도 같이 확인한다.
 */
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const projectId = env.REACT_APP_FIREBASE_PROJECT_ID;
const apiKey = env.REACT_APP_FIREBASE_API_KEY;
const bucket = env.REACT_APP_FIREBASE_STORAGE_BUCKET;

if (!projectId || !apiKey) {
  console.error(".env 에 REACT_APP_FIREBASE_PROJECT_ID / REACT_APP_FIREBASE_API_KEY 가 없습니다.");
  console.error("FIREBASE.md 2단계를 먼저 끝내세요.");
  process.exit(1);
}

async function body(url, init) {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* 본문이 JSON 이 아닐 수 있다 */ }
    return { status: res.status, message: (json && json.error && json.error.message) || text.slice(0, 120) };
  } catch (e) {
    return { status: 0, message: e.message };
  }
}

function line(name, ok, detail) {
  console.log(`${ok ? "  켜짐  " : "  아직  "} ${name.padEnd(16)} ${detail}`);
  return ok;
}

(async () => {
  console.log(`\n프로젝트: ${projectId}\n`);

  const fsRes = await body(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/notices?pageSize=1`
  );
  // 규칙이 바깥에서 오는 접근을 막고 있다는 뜻이라 PERMISSION_DENIED 가 정상이다.
  const firestoreOk = fsRes.status === 403 || fsRes.status === 200;
  line("Firestore", firestoreOk, firestoreOk ? "데이터베이스 있음 (규칙이 막고 있음)" : fsRes.message);

  let storageOk = false;
  let storageDetail = "REACT_APP_FIREBASE_STORAGE_BUCKET 이 비어 있습니다";
  if (bucket) {
    const stRes = await body(`https://firebasestorage.googleapis.com/v0/b/${bucket}/o?maxResults=1`);
    storageOk = stRes.status !== 404;
    storageDetail = storageOk ? "버킷 있음" : "버킷 없음 — Storage 시작하기를 누르세요";
  }
  line("Storage", storageOk, storageDetail);

  const auRes = await body(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 존재하지 않는 계정으로 물어본다. 로그인하려는 게 아니라 켜졌는지만 본다.
      body: JSON.stringify({ email: "check@example.invalid", password: "check-check", returnSecureToken: true }),
    }
  );
  const authOk = auRes.message !== "CONFIGURATION_NOT_FOUND";
  line("Authentication", authOk, authOk ? "이메일/비밀번호 로그인 준비됨" : "아직 시작하지 않음");

  const done = firestoreOk && storageOk && authOk;
  console.log(done
    ? "\n세 가지 모두 준비됐습니다. npm start 로 확인하세요.\n"
    : "\n아직 남은 항목은 FIREBASE.md 3~5단계를 보세요.\n");
  process.exit(done ? 0 : 1);
})();
