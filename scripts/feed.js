/**
 * RSS 만들기.
 *
 * 왜 필요한가
 * -----------
 * 네이버는 제출된 RSS 를 「콘텐츠 피드」로 보고 주기적으로 다시 찾아온다.
 * 사이트맵은 어떤 주소가 있는지만 알려 주는데, RSS 는 무엇이 새로 올라왔는지를
 * 알려 준다. 크롤러가 올 때까지 기다리는 대신 올 이유를 만들어 주는 셈이다.
 * 서치어드바이저에서 이 주소를 한 번 제출해 두면 된다.
 *
 * 무엇을 담는가
 * -------------
 * 협회가 직접 쓴 글만 담는다 — 공지사항·보도자료·정보공개.
 * 예술계/관악계 소식은 담지 않는다. 남의 기사 제목이고, 협회 이름을 단 피드에
 * 남의 글이 실려 나가면 안 된다. 그 게시판은 사무국이 검토해 공개하는 자리다.
 *
 * 실패해도 빌드를 멈추지 않는다
 * -----------------------------
 * 저장소를 못 읽으면 홈페이지에 함께 들어 있는 기본 게시물만으로 만든다.
 * 그것마저 안 되면 경고만 남기고 넘어간다. RSS 가 없다고 홈페이지가
 * 안 열려서는 안 된다.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");

/** 피드에 담을 게시판. 경로는 상세 주소를 만들 때 쓴다. */
const FEED_BOARDS = [
  { collection: "notices", path: "/community/notice", label: "공지사항" },
  { collection: "press", path: "/community/press", label: "보도자료" },
  { collection: "disclosure", path: "/community/disclosure", label: "정보공개" },
];

/** 피드에 담을 최대 개수. 네이버는 최근 것만 보면 된다. */
const MAX_ITEMS = 30;

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
    .map((doc) => ({
      ...fromFields(doc.fields || {}),
      id: doc.name.split("/").pop(),
      board,
    }))
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

  const builtinPosts = require(file);
  return FEED_BOARDS.flatMap((board) =>
    (builtinPosts[board.collection] || [])
      .filter((post) => !post.hidden)
      .map((post) => ({ ...post, board }))
  );
}

/** XML 에 그대로 넣으면 안 되는 글자를 바꾼다. */
const escapeXml = (value) =>
  String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** 본문에서 한 줄 소개를 만든다. 원문을 통째로 싣지 않는다. */
function summarize(post) {
  const text = String(post.body || post.summary || "")
    .replace(/\s+/g, " ")
    .trim();
  // 본문이 없는 글은 제목만으로도 피드에 들어갈 수 있어야 한다.
  if (!text) return post.title || "";
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

/** RSS 는 날짜를 RFC 822 로 적는다. */
function rfc822(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

module.exports = async function buildFeed({ siteUrl }) {
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || "";
  const apiKey = process.env.REACT_APP_FIREBASE_API_KEY || "";

  let posts = [];

  // 1) 기본 게시물 — 늘 있다.
  try {
    posts = await readBuiltin();
  } catch (err) {
    console.warn(`[feed] 기본 게시물을 읽지 못했습니다: ${err.message}`);
  }

  // 2) 저장소의 글 — 한 게시판이 막혀도 나머지는 계속한다.
  if (projectId && apiKey) {
    for (const board of FEED_BOARDS) {
      try {
        posts = posts.concat(await readBoard(board, { projectId, apiKey }));
      } catch (err) {
        console.warn(`[feed] ${board.label} 을 읽지 못했습니다: ${err.message}`);
      }
    }
  } else {
    console.warn("[feed] Firebase 설정이 없어 기본 게시물만 담습니다.");
  }

  if (!posts.length) {
    console.warn("[feed] 담을 글이 없어 rss.xml 을 만들지 않았습니다.");
    return { count: 0, urls: [] };
  }

  // 같은 글이 두 번 들어가지 않게 하고(기본 게시물이 저장소에도 있을 수 있다),
  // 최근 것부터 자른다.
  const seen = new Set();
  const items = posts
    .filter((post) => {
      const key = `${post.board.collection}/${post.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, MAX_ITEMS);

  const links = items.map((post) => `${siteUrl}${post.board.path}/${post.id}`);
  const now = new Date().toUTCString();

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    "  <channel>\n" +
    "    <title>한국관악협회 (KBA)</title>\n" +
    `    <link>${escapeXml(siteUrl)}/</link>\n` +
    "    <description>한국관악협회의 공지사항·보도자료·정보공개입니다.</description>\n" +
    "    <language>ko</language>\n" +
    `    <lastBuildDate>${now}</lastBuildDate>\n` +
    `    <atom:link href="${escapeXml(siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />\n` +
    items
      .map(
        (post, i) =>
          "    <item>\n" +
          `      <title>${escapeXml(post.title)}</title>\n` +
          `      <link>${escapeXml(links[i])}</link>\n` +
          `      <guid isPermaLink="true">${escapeXml(links[i])}</guid>\n` +
          `      <description>${escapeXml(summarize(post))}</description>\n` +
          `      <category>${escapeXml(post.board.label)}</category>\n` +
          `      <pubDate>${rfc822(post.createdAt)}</pubDate>\n` +
          "    </item>"
      )
      .join("\n") +
    "\n  </channel>\n</rss>\n";

  fs.writeFileSync(path.join(BUILD, "rss.xml"), xml);
  return { count: items.length, urls: links };
};
