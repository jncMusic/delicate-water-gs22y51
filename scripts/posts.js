/**
 * 공개된 게시글을 읽어 온다. RSS(feed.js)와 프리렌더(prerender.js)가 함께 쓴다.
 *
 * 한 번만 읽어 두 곳에 넘긴다. 빌드 때마다 저장소를 두 번 부를 이유가 없다.
 *
 * 협회가 직접 쓴 게시판만 다룬다 — 공지사항·보도자료·정보공개.
 * 예술계·관악계 소식은 남의 기사 제목과 링크라서 넣지 않는다. 그런 쪽을 미리
 * 그려 두면 검색엔진이 보기에 「내용이 얇은 쪽」이 수십 개 생기는 셈이고,
 * 협회 이름을 단 RSS 에 남의 글이 실려 나가서도 안 된다.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** 다룰 게시판. path 는 상세 주소를 만들 때 쓴다. */
const PUBLIC_BOARDS = [
  { collection: "notices", path: "/community/notice", label: "공지사항" },
  { collection: "press", path: "/community/press", label: "보도자료" },
  { collection: "disclosure", path: "/community/disclosure", label: "정보공개" },
];

/** Firestore 가 돌려주는 값 한 칸을 평범한 자바스크립트 값으로 바꾼다. */
function fromValue(value) {
  if (!value || typeof value !== "object") return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromValue);
  if ("mapValue" in value) return fromFields(value.mapValue.fields || {});
  return undefined;
}

function fromFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) out[key] = fromValue(value);
  return out;
}

/**
 * 한 게시판의 공개 글을 읽어 온다.
 *
 * 홈페이지가 브라우저에서 읽는 것과 같은 길(공개 읽기)이라 따로 로그인하지
 * 않는다. 숨긴 글은 여기서 걸러낸다.
 */
async function readBoard(board, { projectId, apiKey }) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/` +
    `${board.collection}?pageSize=100&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return (data.documents || [])
    .map((doc) => ({ ...fromFields(doc.fields || {}), id: doc.name.split("/").pop() }))
    .filter((post) => !post.hidden);
}

/** 홈페이지와 함께 배포하는 기본 게시물. 저장소를 못 읽어도 이건 있다. */
async function readBuiltin() {
  const esbuild = require("esbuild");
  const bundle = await esbuild.build({
    stdin: {
      contents: `module.exports = require("./src/data/posts").builtinPosts;`,
      resolveDir: ROOT,
      loader: "js",
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    target: "node18",
    loader: { ".js": "jsx", ".png": "dataurl", ".svg": "dataurl" },
    logLevel: "silent",
  });

  const file = path.join(ROOT, "node_modules", ".cache", "kba-posts.js");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bundle.outputFiles[0].text);
  return require(file);
}

/**
 * 게시판별 공개 글 목록을 돌려준다.
 *
 * 한 게시판이 막혀도 나머지는 계속한다. 저장소를 아예 못 읽으면 기본 게시물만
 * 남는다. 빌드를 멈추지는 않는다.
 *
 * @returns {{ boards: typeof PUBLIC_BOARDS, byBoard: Object, all: Array }}
 *   byBoard 는 컬렉션 이름 -> 글 목록(저장소 것 + 기본 게시물, 최근 것부터).
 *   all 은 게시판 정보를 붙여 한 줄로 편 것.
 */
async function readPublicPosts() {
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || "";
  const apiKey = process.env.REACT_APP_FIREBASE_API_KEY || "";

  let builtin = {};
  try {
    builtin = await readBuiltin();
  } catch (err) {
    console.warn(`[posts] 기본 게시물을 읽지 못했습니다: ${err.message}`);
  }

  if (!projectId || !apiKey) {
    console.warn("[posts] Firebase 설정이 없어 기본 게시물만 씁니다.");
  }

  const byBoard = {};
  for (const board of PUBLIC_BOARDS) {
    let stored = [];
    if (projectId && apiKey) {
      try {
        stored = await readBoard(board, { projectId, apiKey });
      } catch (err) {
        console.warn(`[posts] ${board.label} 을 읽지 못했습니다: ${err.message}`);
      }
    }

    // 저장소에 같은 id 가 있으면 저장소 쪽을 남긴다. store.js 의 withBuiltin 과
    // 같은 규칙이라, 미리 그린 쪽과 사람이 보는 쪽이 어긋나지 않는다.
    const taken = new Set(stored.map((post) => post.id));
    const mine = (builtin[board.collection] || []).filter(
      (post) => !post.hidden && !taken.has(post.id)
    );

    byBoard[board.collection] = [...stored, ...mine].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }

  const all = PUBLIC_BOARDS.flatMap((board) =>
    byBoard[board.collection].map((post) => ({ ...post, board }))
  ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return { boards: PUBLIC_BOARDS, byBoard, all };
}

module.exports = { PUBLIC_BOARDS, readPublicPosts, fromFields, fromValue };
