#!/usr/bin/env node
/**
 * 관악계·예술계 소식 자동 수집.
 *
 * scripts/arts-sources.json 에 적은 곳에서 최근 소식을 받아, 관악·문화예술과
 * 관계있는 것만 골라 Firestore 에 넣는다.
 *
 * 어느 게시판으로 갈지는 출처마다 board 로 정한다. 관악 이야기는 관악계 소식
 * (sceneNews), 문화예술 전반은 예술계 소식(artsNews)으로 간다. 연주회 소식과
 * 회원동향은 회원·단체의 소식이라 사무국이 직접 올린다.
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

/** board 를 적어 두지 않은 출처가 갈 곳. */
const DEFAULT_BOARD = "artsNews";

/**
 * 한 곳에서 가져올 최대 개수.
 * 첫 수집 때 8로 두었더니 정책 한 곳에서만 8건이 들어와, 사무국이 볼 것이
 * 한꺼번에 쌓였다. 비슷한 기사를 걷어내고도 남는 것만 이만큼 담는다.
 */
const PER_SOURCE_LIMIT = 4;
/** 이보다 오래된 것은 담지 않는다(일). */
const MAX_AGE_DAYS = 14;

const sourcesFile = path.join(__dirname, "arts-sources.json");
const { sources, excludeAlways = [] } = JSON.parse(fs.readFileSync(sourcesFile, "utf8"));

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

/**
 * 버릴 것 걸러내기.
 *
 * '관악' 은 음악 말고 서울 관악구·관악갑 이라는 지명이기도 하다. 첫 수집에서
 * 선거구 기사가 그대로 딸려 들어왔다. 이런 말이 보이면 관악 음악 이야기가
 * 아니라고 보고 버린다.
 */
function excluded(item, source) {
  const haystack = `${item.title} ${item.summary}`;
  return [...excludeAlways, ...(source.exclude || [])].some((word) =>
    haystack.includes(word)
  );
}

/**
 * 제목을 보고 분류를 다시 정한다.
 *
 * 분류를 출처마다 하나로 고정해 두었더니 '공모·지원' 으로 검색한 자리에
 * 연주회 소식이 들어와도 공모로 붙었다. 제목이 더 정확한 단서다.
 * 짚이는 것이 없으면 출처에 적어 둔 분류를 그대로 쓴다.
 */
const CATEGORY_HINTS = {
  artsNews: [
    ["공모·지원", ["공모", "모집", "접수", "선정", "지원사업", "공고", "지원 대상", "장학"]],
    ["공연", ["연주회", "공연", "축제", "무대", "콘서트", "리사이틀", "정기연주", "개막", "성료"]],
    ["정책", ["정책", "예산", "장관", "위원회", "문체부", "제도", "법안", "계획 발표"]],
  ],
  // 관악계 소식은 어디 이야기인지로 나눈다. 해외를 먼저 보는 이유는
  // '일본 고교 밴드' 같은 소식이 학교보다 해외 쪽에 더 맞기 때문이다.
  sceneNews: [
    // '세계' 는 넣지 않는다. 언론사 이름(세계일보·로컬세계)에 걸려 국내 소식이
    // 해외로 분류된 일이 있었다. 태백관악대축제가 '해외' 로 붙었다.
    ["해외", ["해외", "국제", "미국", "일본", "중국", "유럽", "독일", "프랑스", "아시아"]],
    ["학교", ["초등", "중학교", "고등학교", "대학교", "학생", "교육청", "관악부", "밴드부"]],
    ["국내", []],
  ],
};

function classify(item, source) {
  // 제목만 본다. 구글 뉴스의 요약은 제목과 언론사 이름을 되풀이할 뿐이라,
  // 같이 보면 언론사 이름이 분류를 틀어 놓는다.
  const haystack = item.title;
  for (const [category, words] of CATEGORY_HINTS[boardOf(source)] || []) {
    // 낱말이 비어 있으면 '나머지는 다 여기' 라는 뜻이다.
    if (words.length === 0 || words.some((word) => haystack.includes(word))) return category;
  }
  return source.category;
}

/** 제목에서 두 글자씩 끊어 모은다. 한국어는 이 방식이 겹침을 잘 잡아낸다. */
function bigrams(title) {
  const clean = title.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const set = new Set();
  for (let i = 0; i < clean.length - 1; i += 1) set.add(clean.slice(i, i + 2));
  return set;
}

function similarity(a, b) {
  const [x, y] = [bigrams(a), bigrams(b)];
  if (x.size === 0 || y.size === 0) return 0;
  let shared = 0;
  x.forEach((gram) => {
    if (y.has(gram)) shared += 1;
  });
  return shared / (x.size + y.size - shared);
}

/**
 * 같은 일을 다룬 기사인지.
 *
 * 겹치는 비율만 본다. 한때 '긴 덩어리가 통째로 겹치면 같은 일' 이라는 규칙을
 * 함께 두었는데, 실제 수집 결과로 맞춰 보니 해로웠다. 길게 겹치는 것은 사건이
 * 아니라 단체·기관 이름이었다. 'FUN윈드오케스트라' 장학금 소식과 연주회 소식이,
 * '문화예술정책자문위원회' 기초예술 분과와 대중문화 분과 회의가 각각 한 건으로
 * 묶여 버렸다.
 *
 * 문턱을 높게 잡아 덜 합치는 쪽을 고른다. 이 글들은 「검토 대기」로 들어가
 * 사무국이 눈으로 고르기 때문이다. 잘못 합치면 사무국이 볼 기회조차 없이 소식이
 * 사라지지만, 덜 합치면 하나 고르고 나머지를 지우면 된다.
 */
function sameStory(a, b) {
  return similarity(a, b) >= 0.45;
}

/**
 * 같은 일을 여러 언론사가 쓴 것을 하나만 남긴다.
 *
 * 첫 수집에서 '관악 공연' 4건이 전부 태백관악대축제 한 행사였다. 링크가 달라
 * id 로는 걸러지지 않는다. 제목이 얼마나 겹치는지로 판단한다.
 */
function dropSimilar(posts) {
  const kept = [];
  for (const post of posts) {
    if (!kept.some((other) => sameStory(post.title, other.title))) kept.push(post);
  }
  return kept;
}

const boardOf = (source) => source.board || DEFAULT_BOARD;

/**
 * 쓸 만한 요약인지.
 *
 * 구글 뉴스의 description 은 <a>제목</a> 언론사 라는 링크 조각이다. 태그를
 * 걷으면 제목만 남아, 그대로 담으면 본문이 제목을 두 번 적은 꼴이 된다.
 * 제목과 겹치는 부분이 대부분이면 요약이 아니라고 본다.
 */
function usefulSummary(summary, title) {
  const text = (summary || "").trim();
  if (text.length < 30) return "";

  const bare = (value) => value.replace(/[^가-힣a-zA-Z0-9]/g, "");
  if (!bare(text).includes(bare(title))) return text;

  // 제목을 품고 있어도, 그 뒤로 할 말이 넉넉히 더 있으면 요약으로 친다.
  // 기사 첫 문장이 제목으로 시작하는 언론사가 적지 않다. 제목을 품었다는
  // 이유만으로 버리면 그런 곳의 요약이 통째로 날아간다.
  return text.length >= title.length + 40 ? text : "";
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
    board: boardOf(source),
    title: item.title.slice(0, 200),
    category: classify(item, source),
    author: item.publisher ? item.publisher.slice(0, 40) : "자동 수집",
    createdAt,
    pinned: false,
    hidden: true, // 사무국이 확인하기 전에는 홈페이지에 나오지 않는다
    views: 0,
    link: item.link,
    source: source.label,
    publisher: item.publisher || "",
    summary: usefulSummary(item.summary, item.title),
  };
}

/**
 * 원문을 한 번 열어 공유용 설명을 가져온다.
 *
 * og:description 은 카카오톡·페이스북에 링크를 붙였을 때 보이라고 언론사가
 * 직접 넣어 둔 한두 문장이다. 기사 본문을 퍼오는 것이 아니라 그 문장만 쓰고,
 * 읽는 사람은 원문으로 보낸다.
 *
 * 덤으로 진짜 주소를 얻는다. 구글 뉴스가 주는 링크는 news.google.com 으로
 * 돌아가는 주소라 사람이 봐도 어디 기사인지 알 수 없다.
 * 다만 문서 id 는 처음 받은 링크로 이미 정해 두었으므로 바뀌지 않는다.
 *
 * 열리지 않는 곳이 있다. 그래도 제목·날짜·링크는 이미 있으니 그대로 둔다.
 */
const DESCRIPTION_TAGS = [
  /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
  /<meta[^>]+name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i,
];

/**
 * HTML 에서 공유용 설명을 뽑는다. 태그 안 순서가 제각각이라 여러 모양을 본다.
 *
 * 여기서는 plain() 을 쓰지 않는다. meta 의 content 는 이미 한 번만 감싼 글이라
 * 엔티티만 풀면 된다. plain() 은 푼 다음 태그를 한 번 더 걷는데, 그러면
 * &lt;제4회 태백관악대축제&gt; 같은 꺾쇠 제목이 태그로 보여 통째로 사라진다.
 */
function pickDescription(html) {
  const found = DESCRIPTION_TAGS.map((re) => html.match(re)?.[1]).find(Boolean);
  return decodeEntities(found || "").replace(/\s+/g, " ").trim();
}

const IMAGE_TAGS = [
  /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
];

/**
 * 기사 대표 사진의 주소를 뽑는다.
 *
 * 사진을 내려받아 협회 저장소에 담지는 않는다. 언론사 사진이므로 주소만 두고
 * 볼 때 그 쪽에서 불러온다. 링크를 붙였을 때 보이라고 내어 둔 사진이라,
 * 출처를 밝히고 원문으로 보내는 선에서 쓴다.
 *
 * 상대 주소로 적어 두는 곳이 있어 기사 주소를 기준으로 절대 주소로 바꾼다.
 */
function pickImage(html, baseUrl) {
  const found = IMAGE_TAGS.map((re) => html.match(re)?.[1]).find(Boolean);
  if (!found) return "";
  try {
    const url = new URL(decodeEntities(found).trim(), baseUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

async function enrich(post) {
  try {
    const res = await fetch(post.link, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; KBA-news-collector/1.0; +https://kbaband.kr)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return post;

    const html = decode(await res.arrayBuffer(), res.headers.get("content-type"));
    const summary = usefulSummary(pickDescription(html), post.title);
    const link = res.url || post.link;

    return {
      ...post,
      link,
      summary: summary || post.summary,
      image: pickImage(html, link),
    };
  } catch {
    return post;
  }
}

/** 화면에 보일 본문. 요약 한 문단과 원문으로 가는 안내만 담는다. */
function withBody(post) {
  return {
    ...post,
    // linked 는 '협회 것이 아니라 남의 자료를 주소로만 걸어 둔 사진' 이라는 표시다.
    // 화면이 이걸 보고 내려받기 단추 대신 출처와 원문 링크를 낸다.
    images: post.image
      ? [{ url: post.image, alt: post.title, linked: true, credit: post.publisher || post.source }]
      : [],
    body:
      (post.summary ? `${post.summary}\n\n` : "") +
      `원문 보기: ${post.link}` +
      (post.publisher ? `\n출처: ${post.publisher}` : ""),
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
  // localId 가 이 계정의 UID 다. admins 에 넣어야 하는 값이라 함께 돌려준다.
  return { idToken: data.idToken, uid: data.localId };
}

/** 자바스크립트 값을 Firestore REST 가 받는 모양으로 바꾼다. */
function toFields(post) {
  const fields = {};
  for (const [key, value] of Object.entries(post)) {
    // id 는 문서 이름, board 는 어느 컬렉션에 넣을지 고르는 값,
    // summary·publisher 는 body 로 합쳐 넣으므로 따로 담지 않는다.
    if (["id", "board", "summary", "publisher", "image"].includes(key)) continue;
    const encoded = toValue(value);
    if (encoded) fields[key] = encoded;
  }
  return fields;
}

/** 값 하나를 Firestore REST 가 받는 모양으로 바꾼다. 목록과 묶음도 다룬다. */
function toValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toValue).filter(Boolean) } };
  }
  if (value && typeof value === "object") {
    const fields = {};
    for (const [key, item] of Object.entries(value)) {
      const encoded = toValue(item);
      if (encoded) fields[key] = encoded;
    }
    return { mapValue: { fields } };
  }
  return null;
}

/**
 * 이미 있는 글은 건드리지 않는다.
 * currentDocument.exists=false 를 붙이면 서버가 "없을 때만 만들라"를 지켜 주므로,
 * 있는 것을 먼저 읽어 볼 필요가 없고 사무국이 고쳐 둔 내용을 덮어쓸 일도 없다.
 */
async function createIfAbsent(post, idToken, projectId) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/` +
    `${post.board}/${post.id}?currentDocument.exists=false`;

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

/** 로그에 컬렉션 이름 대신 사람이 읽는 이름을 쓴다. */
const BOARD_NAMES = { sceneNews: "관악계 소식", artsNews: "예술계 소식" };

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
    process.stdout.write(`▸ ${source.label}  → ${BOARD_NAMES[boardOf(source)] || boardOf(source)}\n`);

    let items;
    try {
      items = parseFeed(await fetchFeed(feedUrl(source)));
    } catch (err) {
      // 한 곳이 막혀도 나머지는 계속한다. 기관 주소는 자주 바뀐다.
      console.log(`    ✗ 실패: ${err.message}`);
      failed += 1;
      continue;
    }

    // 비슷한 기사를 걷어낸 뒤에 개수를 자른다. 먼저 자르면 같은 행사 기사로
    // 자리가 다 차 버린다.
    const picked = dropSimilar(
      items
        .map(splitPublisher)
        .filter((item) => item.title && item.link)
        .filter((item) => withinAge(item.published))
        .filter((item) => matches(item, source.keywords))
        .filter((item) => !excluded(item, source))
        .map((item) => toPost(item, source))
        .filter((post) => !seen.has(post.id) && seen.add(post.id))
    ).slice(0, PER_SOURCE_LIMIT);

    console.log(`    받은 것 ${items.length}건 → 고른 것 ${picked.length}건`);
    picked.forEach((post) => console.log(`      · [${post.category}] ${post.title}`));
    collected.push(...picked);
  }

  // 출처가 달라도 같은 일을 다룬 기사가 있다. 다만 게시판이 다르면 합치지 않는다.
  // 관악계 소식과 예술계 소식은 읽는 자리가 달라서, 한쪽에 있다고 다른 쪽에서
  // 빼 버리면 그 게시판에는 그 소식이 아예 없는 셈이 된다.
  const finalPosts = Object.values(
    collected.reduce((groups, post) => {
      (groups[post.board] = groups[post.board] || []).push(post);
      return groups;
    }, {})
  ).flatMap((group) => dropSimilar(group));

  const merged = collected.length - finalPosts.length;
  const perBoard = finalPosts.reduce((counts, post) => {
    counts[post.board] = (counts[post.board] || 0) + 1;
    return counts;
  }, {});
  const breakdown = Object.entries(perBoard)
    .map(([board, count]) => `${BOARD_NAMES[board] || board} ${count}건`)
    .join(" · ");

  console.log(
    `\n합계 ${finalPosts.length}건` +
      (breakdown ? ` (${breakdown})` : "") +
      (merged > 0 ? ` · 비슷한 기사 ${merged}건 제외` : "") +
      ` · 실패한 곳 ${failed}곳`
  );

  // 원문을 열어 요약을 채운다. 한 건씩 차례로 여는 이유는 한꺼번에 몰아치면
  // 막는 곳이 있어서다. 열리지 않아도 제목·날짜·링크는 이미 있으니 그냥 둔다.
  process.stdout.write("\n원문에서 요약을 가져오는 중");
  const enriched = [];
  for (const post of finalPosts) {
    enriched.push(withBody(await enrich(post)));
    process.stdout.write(".");
  }
  const gotSummary = enriched.filter((post) => post.summary).length;
  const gotImage = enriched.filter((post) => post.images.length > 0).length;
  console.log(
    `\n요약을 얻은 것 ${gotSummary}/${enriched.length}건 · 사진 ${gotImage}/${enriched.length}건`
  );
  enriched.forEach((post) => {
    console.log(
      `  ${post.summary ? "요약" : "  "}${post.images.length ? "사진" : "  "} ${post.title.slice(0, 32)}`
    );
    if (post.summary) console.log(`        ${post.summary.slice(0, 78)}`);
  });

  if (DRY_RUN || enriched.length === 0) {
    if (DRY_RUN) console.log("받아 보기라서 저장하지 않았습니다.");
    // 모든 곳이 실패했으면 눈에 띄게 알린다. 한두 곳 실패는 정상으로 본다.
    if (failed > 0 && enriched.length === 0) process.exitCode = 1;
    return;
  }

  const projectId = env("FIREBASE_PROJECT_ID");
  const { idToken, uid } = await signIn();

  let added = 0;
  let denied = 0;
  for (const post of enriched) {
    try {
      const result = await createIfAbsent(post, idToken, projectId);
      if (result === "새로 담음") added += 1;
    } catch (err) {
      if (err.message.includes("403")) denied += 1;
      console.log(`    ✗ 저장 실패 (${post.title}): ${err.message}`);
    }
  }

  // 403 은 로그인은 됐는데 쓸 권한이 없다는 뜻이다. 보안 규칙이 admins 에
  // 이 계정의 UID 로 된 문서를 요구하므로, 그 값을 찍어 바로 맞춰 볼 수 있게 한다.
  // UID 는 비밀값이 아니다. 이것만으로는 로그인도 쓰기도 되지 않는다.
  if (denied > 0) {
    console.log("");
    console.log("전부 권한 없음(403)으로 막혔습니다. 로그인은 됐으니 비밀번호 문제는 아닙니다.");
    console.log("Firestore 의 admins 컬렉션에 아래 UID 를 '문서 id' 로 하는 문서가 있어야 합니다.");
    console.log("이메일이 아니라 UID 여야 합니다.");
    console.log("");
    console.log(`    봇 계정 UID : ${uid}`);
    console.log(`    프로젝트    : ${projectId}`);
    console.log("");
    return;
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

module.exports = { parseFeed, splitPublisher, toPost, toFields, classify, excluded, dropSimilar, similarity, sameStory, usefulSummary, withBody, pickDescription, pickImage, toValue, plain, withinAge, matches, decode, idFor };
