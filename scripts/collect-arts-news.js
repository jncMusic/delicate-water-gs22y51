#!/usr/bin/env node
/**
 * 예술계 소식 자동 수집.
 *
 * scripts/arts-sources.json 에 적은 곳에서 최근 소식을 받아, 관악·문화예술과
 * 관계있는 것만 골라 Firestore 의 artsNews 에 넣는다.
 *
 * 저작권 때문에 본문은 담지 않는다. 제목·날짜·한 줄 요약·원문 링크·출처만
 * 담고, 읽는 사람은 원문으로 보내 준다.
 *
 * 넣을 때는 hidden: true 로 넣는다. 그래서 홈페이지에는 바로 나오지 않고,
 * 사무국이 관리자 화면에서 보고 「공개」로 바꾼 것만 나온다. 남의 기사 제목이
 * 협회 이름을 달고 저절로 나가는 일이 없도록 하기 위해서다.
 *
 * 쓰는 법
 *   node scripts/collect-arts-news.js --dry-run   받아 보기만 하고 저장하지 않음
 *   node scripts/collect-arts-news.js             저장까지 함
 *
 * 필요한 환경변수 (GitHub Actions 의 Secrets 로 넣는다)
 *   FIREBASE_API_KEY      웹 API 키 (비밀값이 아니지만 저장소에 두지 않는다)
 *   FIREBASE_PROJECT_ID   프로젝트 id
 *   KBA_BOT_EMAIL         수집 전용 계정
 *   KBA_BOT_PASSWORD      그 계정 비밀번호
 * --dry-run 일 때는 넷 다 없어도 된다.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DRY_RUN = process.argv.includes("--dry-run");
const COLLECTION = "artsNews";

/** 한 곳에서 가져올 최대 개수. 너무 많으면 검토가 일이 된다. */
const PER_SOURCE_LIMIT = 8;
/** 이보다 오래된 것은 담지 않는다(일). */
const MAX_AGE_DAYS = 14;

const sourcesFile = path.join(__dirname, "arts-sources.json");
const { sources } = JSON.parse(fs.readFileSync(sourcesFile, "utf8"));

/* ───────────────────────────── 받아오기 ───────────────────────────── */

/**
 * 글자 깨짐 막기.
 * 국내 기관 사이트는 아직 EUC-KR 로 주는 곳이 있어서, 헤더나 XML 선언에 적힌
 * 인코딩을 보고 맞춰 푼다. 모르는 인코딩이면 UTF-8 로 본다.
 */
function decode(buffer, contentType) {
  const head = Buffer.from(buffer.slice(0, 200)).toString("latin1");
  const declared =
    (contentType || "").match(/charset=([\w-]+)/i)?.[1] ||
    head.match(/encoding=["']([\w-]+)["']/i)?.[1] ||
    "utf-8";

  const label = declared.toLowerCase();
  if (label === "utf-8" || label === "utf8") return Buffer.from(buffer).toString("utf8");
  try {
    return new TextDecoder(label).decode(buffer);
  } catch {
    console.warn(`    · ${declared} 를 풀지 못해 UTF-8 로 읽습니다`);
    return Buffer.from(buffer).toString("utf8");
  }
}

async function fetchFeed(url) {
  const res = await fetch(url, {
    headers: {
      // 사람이 보는 브라우저와 비슷하게 밝혀 둔다. 이것이 없으면 막는 곳이 있다.
      "user-agent": "Mozilla/5.0 (compatible; KBA-news-collector/1.0; +https://kbaband.kr)",
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  return decode(buffer, res.headers.get("content-type"));
}

/* ───────────────────────────── 읽어내기 ───────────────────────────── */

const stripCdata = (value) =>
  value.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " " };

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, name) => {
    const key = name.toLowerCase();
    if (ENTITIES[key]) return ENTITIES[key];
    if (key.startsWith("#x")) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(parseInt(key.slice(1), 10));
    return whole;
  });
}

/**
 * 태그와 엔티티를 걷어내 사람이 읽는 글자만 남긴다.
 *
 * 푸는 순서가 중요하다. RSS 의 description 은 HTML 을 &lt;p&gt; 처럼 한 번 더
 * 감싸서 주는 곳이 많다. 태그를 먼저 걷어내면 그때는 아직 &lt;p&gt; 라서 걸리지
 * 않고, 나중에 엔티티를 풀면 <p> 가 본문에 그대로 남는다.
 * 그래서 푼다 → 태그를 걷는다 → 한 번 더 푼다 의 차례로 한다.
 */
function plain(value) {
  const unwrapped = decodeEntities(stripCdata(value || ""));
  return decodeEntities(unwrapped.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

const tagOf = (block, name) => {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
};

/**
 * RSS 2.0 과 Atom 을 함께 읽는다.
 * 라이브러리를 쓰지 않는 이유는, 이 일 하나 때문에 의존성을 늘리면 설치와
 * 보안 점검 부담이 계속 따라오기 때문이다. 피드는 모양이 단순해서 이 정도면 된다.
 */
function parseFeed(xml) {
  const blocks = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) || [];
  return blocks.map((block) => {
    // Atom 의 링크는 <link href="..."/> 모양이라 따로 본다.
    const href = block.match(/<link[^>]*\shref=["']([^"']+)["']/i)?.[1];
    const link = plain(tagOf(block, "link")) || href || "";
    const published =
      plain(tagOf(block, "pubDate")) ||
      plain(tagOf(block, "published")) ||
      plain(tagOf(block, "updated")) ||
      plain(tagOf(block, "dc:date"));

    return {
      title: plain(tagOf(block, "title")),
      link,
      published,
      summary: plain(tagOf(block, "description") || tagOf(block, "summary")).slice(0, 300),
      publisher: plain(tagOf(block, "source")),
    };
  });
}

/* ───────────────────────────── 고르기 ───────────────────────────── */

/**
 * 구글 뉴스는 제목 끝에 " - 언론사" 를 붙여 준다.
 * 그대로 두면 목록이 지저분해서 떼어 내고, 뗀 이름은 출처로 쓴다.
 */
function splitPublisher(item) {
  const m = item.title.match(/^(.*\S)\s+-\s+([^-]{2,30})$/);
  if (!m) return item;
  return { ...item, title: m[1], publisher: item.publisher || m[2] };
}

function withinAge(published) {
  if (!published) return true; // 날짜를 안 주는 곳도 있다. 그럴 땐 통과시킨다.
  const time = Date.parse(published);
  if (Number.isNaN(time)) return true;
  return Date.now() - time <= MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function matches(item, keywords) {
  if (!keywords || keywords.length === 0) return true;
  const haystack = `${item.title} ${item.summary}`;
  return keywords.some((word) => haystack.includes(word));
}

/** 같은 기사를 두 번 담지 않도록, 링크에서 늘 같은 id 를 만든다. */
const idFor = (link) => `auto-${crypto.createHash("sha1").update(link).digest("hex").slice(0, 20)}`;

function toPost(item, source) {
  const time = Date.parse(item.published);
  const createdAt = Number.isNaN(time)
    ? new Date().toISOString()
    : new Date(time).toISOString();

  return {
    id: idFor(item.link),
    title: item.title.slice(0, 200),
    category: source.category,
    author: item.publisher ? item.publisher.slice(0, 40) : "자동 수집",
    createdAt,
    pinned: false,
    hidden: true, // 사무국이 확인하기 전에는 홈페이지에 나오지 않는다
    views: 0,
    link: item.link,
    source: source.label,
    body:
      (item.summary ? `${item.summary}\n\n` : "") +
      `원문 보기: ${item.link}` +
      (item.publisher ? `\n출처: ${item.publisher}` : ""),
  };
}

/* ───────────────────────────── 저장하기 ───────────────────────────── */

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`환경변수 ${name} 가 없습니다`);
  return value;
};

async function signIn() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env("FIREBASE_API_KEY")}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: env("KBA_BOT_EMAIL"),
        password: env("KBA_BOT_PASSWORD"),
        returnSecureToken: true,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`로그인 실패: ${data.error?.message || res.status}`);
  return data.idToken;
}

/** 자바스크립트 값을 Firestore REST 가 받는 모양으로 바꾼다. */
function toFields(post) {
  const fields = {};
  for (const [key, value] of Object.entries(post)) {
    if (key === "id") continue;
    if (typeof value === "string") fields[key] = { stringValue: value };
    else if (typeof value === "number") fields[key] = { integerValue: String(value) };
    else if (typeof value === "boolean") fields[key] = { booleanValue: value };
  }
  return fields;
}

/**
 * 이미 있는 글은 건드리지 않는다.
 * currentDocument.exists=false 를 붙이면 서버가 "없을 때만 만들라"를 지켜 주므로,
 * 있는 것을 먼저 읽어 볼 필요가 없고 사무국이 고쳐 둔 내용을 덮어쓸 일도 없다.
 */
async function createIfAbsent(post, idToken, projectId) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/` +
    `${COLLECTION}/${post.id}?currentDocument.exists=false`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json", authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fields: toFields(post) }),
  });

  if (res.status === 409) return "이미 있음";
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`${res.status} ${data.error?.message || ""}`.trim());
  }
  return "새로 담음";
}

/* ───────────────────────────── 실행 ───────────────────────────── */

function feedUrl(source) {
  if (source.kind === "googleNews") {
    const q = encodeURIComponent(source.query);
    return `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`;
  }
  return source.url;
}

async function main() {
  console.log(DRY_RUN ? "받아 보기만 합니다(저장하지 않음)\n" : "수집해서 저장합니다\n");

  const collected = [];
  const seen = new Set();
  let failed = 0;

  for (const source of sources) {
    if (!source.enabled) continue;
    process.stdout.write(`▸ ${source.label}\n`);

    let items;
    try {
      items = parseFeed(await fetchFeed(feedUrl(source)));
    } catch (err) {
      // 한 곳이 막혀도 나머지는 계속한다. 기관 주소는 자주 바뀐다.
      console.log(`    ✗ 실패: ${err.message}`);
      failed += 1;
      continue;
    }

    const picked = items
      .map(splitPublisher)
      .filter((item) => item.title && item.link)
      .filter((item) => withinAge(item.published))
      .filter((item) => matches(item, source.keywords))
      .slice(0, PER_SOURCE_LIMIT)
      .map((item) => toPost(item, source))
      .filter((post) => !seen.has(post.id) && seen.add(post.id));

    console.log(`    받은 것 ${items.length}건 → 고른 것 ${picked.length}건`);
    picked.forEach((post) => console.log(`      · [${post.category}] ${post.title}`));
    collected.push(...picked);
  }

  console.log(`\n합계 ${collected.length}건 · 실패한 곳 ${failed}곳`);

  if (DRY_RUN || collected.length === 0) {
    if (DRY_RUN) console.log("받아 보기라서 저장하지 않았습니다.");
    // 모든 곳이 실패했으면 눈에 띄게 알린다. 한두 곳 실패는 정상으로 본다.
    if (failed > 0 && collected.length === 0) process.exitCode = 1;
    return;
  }

  const projectId = env("FIREBASE_PROJECT_ID");
  const idToken = await signIn();

  let added = 0;
  for (const post of collected) {
    try {
      const result = await createIfAbsent(post, idToken, projectId);
      if (result === "새로 담음") added += 1;
    } catch (err) {
      console.log(`    ✗ 저장 실패 (${post.title}): ${err.message}`);
    }
  }

  console.log(`새로 담은 것 ${added}건. 관리자 화면에서 확인하고 공개해 주세요.`);
}

// 직접 실행할 때만 돌린다. 다른 파일에서 불러오면 함수만 꺼내 쓸 수 있어,
// 피드를 받지 않고도 읽어내는 부분을 시험할 수 있다.
if (require.main === module) {
  main().catch((err) => {
    console.error(`\n멈췄습니다: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { parseFeed, splitPublisher, toPost, toFields, plain, withinAge, matches, decode, idFor };
