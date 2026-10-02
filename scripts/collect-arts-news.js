#!/usr/bin/env node
/**
 * 관악계·예술계 소식 자동 수집.
 *
 * scripts/arts-sources.json 에 적은 곳에서 최근 소식을 받아, 관악·문화예술과
 * 관계있는 것만 골라 Firestore 에 넣는다.
 *
 * 어느 게시판으로 갈지는 출처마다 board 로 정한다. 관악 이야기는 관악계 소식
 * (sceneNews), 문화예술 전반은 예술계 소식(artsNews), 연주회 기사는 연주회
 * 소식(concertNews), 단원·강사 모집은 일자리 정보(jobs)로 간다. 회원동향만은
 * 회원과 단체의 소식이라 사무국이 직접 올린다.
 *
 * 저작권 때문에 기사를 통째로 담지 않는다. 제목·날짜·첫머리 발췌·원문 링크·
 * 출처만 담고, 읽는 사람은 원문으로 보내 준다. 발췌는 LEAD_LIMIT 글자에서
 * 끊는다.
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
 *
 * 있으면 더 좋은 것 (없어도 돌아간다)
 *   NAVER_API_KEY_ID      NAVER API HUB 키 아이디   ← 지금 발급되는 것
 *   NAVER_API_KEY         그 비밀값
 * 또는 (2026-07-25 이전에 developers.naver.com 에서 받아 둔 키가 있을 때만)
 *   NAVER_CLIENT_ID       네이버 개발자센터 검색 API 키
 *   NAVER_CLIENT_SECRET   그 비밀값
 * 둘 중 하나가 있으면 네이버 뉴스 검색으로 받는다. 구글 뉴스와 달리 언론사
 * 주소와 기사 앞 문장을 그대로 주기 때문에 요약과 사진이 채워진다. 없으면
 * 전처럼 구글 뉴스로 받고, 그때는 제목·날짜·링크만 남는다.
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

/**
 * 네이버 검색 API 를 쓸 수 있는지.
 *
 * 쓸 수 있으면 네이버로 받는다. 구글 뉴스는 기사 주소를 자바스크립트로 넘겨서
 * 받아오면 언론사가 아니라 구글 쪽에서 멈춘다. 그래서 요약도 사진도 못 얻고,
 * 열한 건을 받아 요약 0건·사진 0건이었다. 네이버는 originallink 로 언론사
 * 주소를 그대로 주고 description 으로 기사 앞 문장을 준다.
 *
 * 키가 없으면 전처럼 구글 뉴스로 받는다. 제목·날짜·링크만 남지만, 사무국이
 * 눌러서 원문을 보는 데는 그것으로도 쓸 수 있다.
 *
 * 그 키를 받는 창구가 둘이다.
 *
 * 2026-07-31 부터 developers.naver.com 에서는 검색 API 를 새로 신청할 수 없다.
 * 네이버클라우드의 NAVER API HUB 로 옮겨 갔다. 그래서 애플리케이션 등록 화면의
 * 「사용 API」 목록에 검색이 아예 없다. 개인 아이디든 단체 아이디든 마찬가지다.
 * 예전 키는 2027-06-30 까지만 예전 주소로 돈다.
 *
 * 그래서 어느 키가 들어왔는지 보고 주소와 헤더를 맞춘다. 새로 받는 키는
 * HUB 것뿐이므로 둘 다 있으면 HUB 를 쓴다.
 */
const NAVER_HUB = {
  id: process.env.NAVER_API_KEY_ID || "",
  secret: process.env.NAVER_API_KEY || "",
  url: "https://naverapihub.apigw.ntruss.com/search/v1/news",
  idHeader: "X-NCP-APIGW-API-KEY-ID",
  secretHeader: "X-NCP-APIGW-API-KEY",
  label: "NAVER API HUB",
};

const NAVER_OLD = {
  id: process.env.NAVER_CLIENT_ID || "",
  secret: process.env.NAVER_CLIENT_SECRET || "",
  url: "https://openapi.naver.com/v1/search/news.json",
  idHeader: "X-Naver-Client-Id",
  secretHeader: "X-Naver-Client-Secret",
  label: "네이버 개발자센터",
};

const naverKey = [NAVER_HUB, NAVER_OLD].find((k) => k.id && k.secret) || null;
const hasNaver = Boolean(naverKey);

/**
 * 어느 출처를 돌릴지.
 *
 * when 이 적혀 있으면 네이버 키가 있을 때만 / 없을 때만 돌린다. 같은 주제를
 * 두 곳에서 겹쳐 받지 않기 위한 것이다. when 이 없으면 늘 돌린다.
 */
function sourceEnabled(source) {
  if (!source.enabled) return false;
  if (source.when === "naver") return hasNaver;
  if (source.when === "no-naver") return !hasNaver;
  return true;
}

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

/**
 * 검색한 낱말을 굵게 표시한 <b> 를 먼저 걷어낸다.
 *
 * plain() 에 그대로 맡기면 안 된다. plain() 은 태그를 빈칸으로 바꾸는데,
 * RSS 의 <p>첫째</p><p>둘째</p> 를 붙여 버리지 않으려고 그렇게 해 두었다.
 * 그런데 네이버의 <b> 는 낱말 가운데에 들어온다.
 *
 *   "호서중 <b>관악부</b>, 전국"  →  "호서중 관악부 , 전국"
 *
 * 조사와 쉼표 앞이 벌어진다. 이 태그는 빈칸 없이 지워야 한다.
 */
const unhighlight = (value) => (value || "").replace(/<\/?(b|strong|em)>/gi, "");

/**
 * 네이버 뉴스 검색에서 한 번에 받아 오는 개수.
 * 이 가운데서 낱말로 거르고 비슷한 기사를 걷어낸 다음 PER_SOURCE_LIMIT 만큼만
 * 담으므로, 받는 개수는 넉넉해야 한다.
 */
const NAVER_DISPLAY = 20;

/**
 * 네이버 검색 API 로 뉴스를 받아 피드와 같은 모양으로 돌려준다.
 *
 * 돌려주는 것 가운데 originallink 가 언론사 주소, link 는 네이버 뉴스 주소다.
 * 언론사 주소를 쓴다. 기사가 네이버에서 내려가도 남아 있고, 사진과 요약을
 * 언론사 쪽에서 얻을 수 있고, 읽는 사람도 어디 기사인지 알 수 있다.
 *
 * title 과 description 에는 검색한 낱말이 <b> 로 감싸여 온다. unhighlight 로
 * 먼저 걷어낸 뒤 plain() 에 넘긴다.
 */
async function fetchNaverNews(source) {
  const params = new URLSearchParams({
    query: source.query,
    display: String(NAVER_DISPLAY),
    sort: "date", // 최근 것부터. 아래에서 MAX_AGE_DAYS 로 한 번 더 거른다.
  });

  const res = await fetch(`${naverKey.url}?${params}`, {
    headers: {
      [naverKey.idHeader]: naverKey.id,
      [naverKey.secretHeader]: naverKey.secret,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // 401 은 키가 틀렸거나, 그 키를 다른 창구 주소로 보냈다는 뜻이다.
    // 어느 창구로 보냈는지와 네이버가 적어 준 이유를 함께 보여 준다.
    throw new Error(`HTTP ${res.status} (${naverKey.label}) ${body.slice(0, 200)}`.trim());
  }

  const data = await res.json();

  // HUB 로 옮겨 가며 응답 모양이 달라졌는지는 키를 받아 한 번 돌려 봐야 안다.
  // 달라졌으면 조용히 0건이 되지 않고 여기서 멈춰 실행 기록에 남는다.
  if (!Array.isArray(data.items)) {
    throw new Error(`items 가 없다 (${naverKey.label}): ${JSON.stringify(data).slice(0, 200)}`);
  }

  return data.items.map((item) => ({
    title: plain(unhighlight(item.title)),
    link: item.originallink || item.link || "",
    published: plain(item.pubDate || ""),
    summary: plain(unhighlight(item.description || "")).slice(0, 300),
    publisher: "", // 네이버는 언론사 이름을 주지 않는다. 원문에서 알아낸다.
  }));
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
  // 연주회는 누가 여는 무대인지로 나눈다. 학교를 먼저 보는 이유는 학교
  // 정기연주회가 「정기연주회」 보다 「학교연주회」 로 읽히는 편이 낫기 때문이다.
  concertNews: [
    ["학교연주회", ["초등", "중학교", "고등학교", "대학교", "학생", "관악부", "밴드부", "교육청"]],
    ["정기연주회", ["정기연주회", "정기연주", "정기공연", "정기 연주회"]],
    ["초청공연", ["초청", "내한", "협연", "합동연주", "교류음악회"]],
    ["기타", []],
  ],
  // 일자리는 어디서 뽑는지로 나눈다. 단원 모집이 가장 또렷해서 먼저 본다.
  jobs: [
    ["연주단체", ["교향악단", "오케스트라", "필하모닉", "악단", "단원", "윈드오케스트라", "브라스밴드"]],
    ["강사", ["강사", "레슨", "지도자", "코치", "지도교사"]],
    ["학교", ["초등", "중학교", "고등학교", "대학교", "학교", "교육청", "교원", "교사"]],
    ["기타", []],
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

/**
 * 기사 첫머리를 조금 더 가져온다.
 *
 * og:description 은 한두 문장뿐이라, 제목만 보고 들어갈지 말지 가늠하기에
 * 모자랐다. 그래서 기사 첫 문단들을 LEAD_LIMIT 글자까지만 받아 온다.
 *
 * 여기서도 기사를 통째로 옮기지 않는다. 앞머리만 끊어 싣고 출처를 밝힌 뒤
 * 원문으로 보내는, 인용의 선을 지킨다. 그래서 글자 수에 못을 박아 두고
 * 문장이 끝나는 자리에서 자른다.
 */
const LEAD_LIMIT = 400;

/** 기사 본문이 담기는 자리. 언론사마다 이름이 달라 여러 모양을 본다. */
const BODY_TAGS = [
  /<[^>]+itemprop=["']articleBody["'][^>]*>([\s\S]*?)<\/(?:div|article|section)>/i,
  /<article[^>]*>([\s\S]*?)<\/article>/i,
  /<div[^>]+(?:id|class)=["'][^"']*(?:article|news)[-_]?(?:body|content|txt|view)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
];

/**
 * 본문에 섞여 있지만 기사가 아닌 줄. 사진 설명·기자 서명·저작권 문구다.
 * 앞머리에 이런 것이 끼면 읽는 사람에게 도움이 되지 않는다.
 */
const NOT_ARTICLE =
  /^(?:\[[^\]]*\]\s*)?(?:사진|이미지|그래픽|자료|영상)\s*[=＝:]|기자\s*$|^[\w.+-]+@[\w.-]+|저작권자|무단\s*전재|재배포\s*금지|^\S+\s*기자\s*=|ⓒ/;

/**
 * JSON-LD 의 articleBody. 뉴스 사이트가 검색 엔진에 주려고 넣어 둔 것이라
 * 태그가 섞이지 않은 깨끗한 글이다. 있으면 이것을 가장 먼저 쓴다.
 */
function ldArticleBody(html) {
  const blocks = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const block of blocks || []) {
    const json = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      continue; // 깨진 JSON-LD 를 넣어 두는 곳이 있다. 다음 것을 본다.
    }
    // @graph 로 여러 개를 묶어 두기도 한다. 평평하게 펴서 훑는다.
    const list = [].concat(data, data?.["@graph"] || []).filter(Boolean);
    for (const item of list) {
      if (typeof item?.articleBody === "string" && item.articleBody.trim()) {
        return item.articleBody;
      }
    }
  }
  return "";
}

/** 본문 자리에서 문단만 골라 잇는다. */
function paragraphs(inner) {
  const found = inner.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi) || [];
  return joinLines(found.length ? found.map((one) => plain(one)) : plain(inner).split(/(?<=다\.)\s+/));
}

/**
 * 끊긴 문장으로 끝나지 않게, 마지막 마침표까지만 남긴다.
 * 자를 곳이 없으면 말줄임표를 붙여 더 있다는 것을 알린다.
 */
function trimToSentence(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const end = Math.max(cut.lastIndexOf("다."), cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  // 너무 앞에서 끊기면 차라리 글자 수대로 자르고 말줄임표를 붙인다.
  if (end > limit * 0.5) return cut.slice(0, end + 1).trim();
  return `${cut.replace(/\s+\S*$/, "")}…`;
}

/** 줄을 골라 잇는다. 사진 설명·기자 서명·저작권 문구는 뺀다. */
function joinLines(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length >= 10 && !NOT_ARTICLE.test(line))
    .join(" ");
}

/**
 * 첫 문장 앞의 발신지와 기자 서명을 떼어 낸다.
 *
 * 「[서울=뉴시스] 홍길동 기자 = 문화체육관광부는…」 처럼, 국내 기사는 첫
 * 문장 머리에 이것이 붙어 온다. 줄째로 버리면 기사 첫 문장까지 같이 날아가니
 * 앞머리만 잘라 낸다.
 */
function stripByline(text) {
  return text
    .replace(/^\s*\[[^\]]{1,40}\]\s*/, "")
    .replace(/^\s*[가-힣]{2,5}\s*(?:기자|특파원|객원기자)\s*[=＝]\s*/, "")
    .trim();
}

function pickLead(html) {
  const ld = ldArticleBody(html);
  // JSON-LD 는 태그가 없는 한 덩어리라 문장 끝으로 나눈다.
  // 본문 자리에서 긁은 것은 <p> 가 살아 있으므로 문단으로 나눈다.
  const text = ld
    ? joinLines(plain(ld).split(/(?<=다\.)\s+/))
    : paragraphs(BODY_TAGS.map((re) => html.match(re)?.[1]).find(Boolean) || "");

  const lead = stripByline(text);

  // 너무 짧으면 본문을 제대로 집지 못한 것이다. og:description 쪽에 맡긴다.
  if (lead.length < 40) return "";
  return trimToSentence(lead, LEAD_LIMIT);
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

const SITE_NAME_TAGS = [
  /<meta[^>]+property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i,
];

/**
 * 언론사 이름을 뽑는다.
 *
 * 구글 뉴스는 제목 끝에 " - 언론사" 를 붙여 주지만 네이버 검색 API 는 언론사
 * 이름을 아예 주지 않는다. 사진 아래에 「사진 ○○」 으로 밝혀야 하고 글쓴이
 * 자리에도 들어가므로, 원문 쪽의 og:site_name 에서 얻는다.
 *
 * 없으면 주소에서 만든다. chosun.com → chosun 처럼 알아볼 수 있는 정도다.
 * 한글 이름만 못하지만 '자동 수집' 보다는 어디 기사인지 알 수 있다.
 */
function pickSiteName(html) {
  const found = SITE_NAME_TAGS.map((re) => html.match(re)?.[1]).find(Boolean);
  return decodeEntities(found || "").replace(/\s+/g, " ").trim().slice(0, 40);
}

function hostLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "");
    // news.chosun.com → chosun. 끝의 co.kr·or.kr·com 따위는 이름이 아니다.
    const parts = host.split(".").filter((part) => !/^(com|net|org|kr|co|or|go|news)$/i.test(part));
    return parts[parts.length - 1] || host;
  } catch {
    return "";
  }
}

/** 구글 뉴스 자체 쪽인지. 여기서 뽑은 설명·사진은 기사 것이 아니다. */
const isGoogleNews = (url) => /(^|\.)news\.google\.com$/i.test(new URL(url).hostname);

/**
 * 구글 뉴스가 내주는 중간 쪽에서 진짜 기사 주소를 찾는다.
 *
 * 구글 뉴스의 기사 주소는 HTTP 로 넘기지 않고 자바스크립트로 넘긴다. 그래서
 * 그냥 받아오면 언론사가 아니라 구글 뉴스 쪽에서 멈춘다. 실제로 한 번 돌렸더니
 * 열한 건의 요약이 모두 "Comprehensive up-to-date news coverage..." 라는
 * 구글 뉴스 소개글이었다.
 *
 * 주소 안에 기사 주소가 박혀 있지도 않다. 풀어 보면 구글 내부 토큰뿐이다.
 * 그래서 중간 쪽 안에 남아 있는 흔적을 찾아본다. 못 찾으면 그냥 둔다.
 */
function findRealUrl(html) {
  const candidates = [
    // 따옴표가 닫힐 때까지 가져온다. 세미콜론에서 끊으면 &amp; 의 세미콜론에
    // 걸려 주소 뒷부분이 잘린다.
    html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)/i)?.[1],
    html.match(/data-n-au=["']([^"']+)["']/i)?.[1],
    html.match(/<a[^>]+href=["'](https?:\/\/(?!\w*\.?google\.)[^"']+)["']/i)?.[1],
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const url = new URL(decodeEntities(raw.trim()));
      if (!isGoogleNews(url.href) && !/\.google\.com$/i.test(url.hostname)) return url.href;
    } catch {
      // 주소 모양이 아니면 다음 후보로 넘어간다.
    }
  }
  return "";
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

    let html = decode(await res.arrayBuffer(), res.headers.get("content-type"));
    let link = res.url || post.link;

    // 구글 뉴스 쪽에서 멈췄으면 진짜 기사 주소를 찾아 한 번 더 간다.
    if (isGoogleNews(link)) {
      const real = findRealUrl(html);
      if (!real) return post; // 못 찾았으면 구글 소개글을 담지 않고 그대로 둔다.

      const again = await fetch(real, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; KBA-news-collector/1.0; +https://kbaband.kr)",
          accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
      if (!again.ok) return post;

      html = decode(await again.arrayBuffer(), again.headers.get("content-type"));
      link = again.url || real;
      if (isGoogleNews(link)) return post;
    }

    // 본문 첫머리와 공유용 설명 가운데 긴 쪽을 쓴다. 본문을 집지 못하는
    // 언론사가 있어, 그럴 때는 og:description 이 남는다.
    const lead = usefulSummary(pickLead(html), post.title);
    const meta = usefulSummary(pickDescription(html), post.title);

    return {
      ...post,
      link,
      summary: (lead.length > meta.length ? lead : meta) || post.summary,
      image: pickImage(html, link),
      // 네이버로 받은 것은 언론사 이름이 비어 있다. 원문에서 채운다.
      publisher: post.publisher || pickSiteName(html) || hostLabel(link),
    };
  } catch {
    return post;
  }
}

/**
 * 화면에 보일 본문. 요약 한 문단과 원문으로 가는 안내만 담는다.
 *
 * 글쓴이 자리를 여기서 다시 정한다. toPost 는 원문을 열기 전에 만들어지는데,
 * 네이버로 받은 것은 그때 언론사 이름이 비어 있다. enrich 가 원문에서 채워
 * 주므로 그것을 반영해야 '자동 수집' 으로 남지 않는다.
 */
function withBody(post) {
  const publisher = post.publisher || hostLabel(post.link);
  return {
    ...post,
    author: publisher ? publisher.slice(0, 40) : "자동 수집",
    // linked 는 '협회 것이 아니라 남의 자료를 주소로만 걸어 둔 사진' 이라는 표시다.
    // 화면이 이걸 보고 내려받기 단추 대신 출처와 원문 링크를 낸다.
    images: post.image
      ? [{ url: post.image, alt: post.title, linked: true, credit: publisher || post.source }]
      : [],
    // 주소를 글자로 적지 않는다. link 를 따로 담아 두었으니 화면이 그것으로
    // 「원문 보기」 를 건다. 예전에는 여기에 주소를 그대로 적었는데, 구글 뉴스
    // 주소는 한 줄이 넘도록 길어 글이 지저분해졌고 누를 수도 없었다.
    body: post.summary || "",
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
const BOARD_NAMES = {
  sceneNews: "관악계 소식",
  artsNews: "예술계 소식",
  concertNews: "연주회 소식",
  jobs: "일자리 정보",
};

function feedUrl(source) {
  if (source.kind === "googleNews") {
    const q = encodeURIComponent(source.query);
    return `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`;
  }
  return source.url;
}

/** 출처 한 곳에서 기사 목록을 받는다. 어디서 받는지는 kind 가 정한다. */
async function fetchItems(source) {
  if (source.kind === "naverNews") return fetchNaverNews(source);

  const items = parseFeed(await fetchFeed(feedUrl(source)));
  // 제목 끝의 " - 언론사" 를 떼는 것은 구글 뉴스만 그렇게 주기 때문이다.
  // 다른 곳에 대고 하면 "관악부 창단 - 그 뒤의 이야기" 같은 제목이 잘린다.
  return source.kind === "googleNews" ? items.map(splitPublisher) : items;
}

async function main() {
  console.log(DRY_RUN ? "받아 보기만 합니다(저장하지 않음)" : "수집해서 저장합니다");
  console.log(
    hasNaver
      ? `네이버 뉴스 검색으로 받습니다(${naverKey.label}).\n` +
          "언론사 주소를 주므로 요약과 사진을 얻을 수 있습니다.\n"
      : "구글 뉴스로 받습니다. NAVER_API_KEY_ID·NAVER_API_KEY 를 넣으면\n" +
          "네이버로 받아 요약과 사진까지 채웁니다.\n"
  );

  const collected = [];
  const seen = new Set();

  /** 한 묶음을 차례로 돌며 collected 에 담는다. 답하지 않은 곳 수를 돌려준다. */
  async function collectFrom(list) {
    let failed = 0;

    for (const source of list) {
      process.stdout.write(`▸ ${source.label}  → ${BOARD_NAMES[boardOf(source)] || boardOf(source)}\n`);

      let items;
      try {
        items = await fetchItems(source);
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
          .filter((item) => item.title && item.link)
          .filter((item) => withinAge(item.published))
          .filter((item) => matches(item, source.keywords))
          // require 는 keywords 에 더해 한 번 더 걸러낸다. 일자리처럼 「채용」
          // 만으로는 엉뚱한 것이 쏟아지는 자리에서, 음악 쪽 낱말이 하나는
          // 있어야 담기게 한다. 적지 않은 출처에는 아무 영향이 없다.
          .filter((item) => matches(item, source.require))
          .filter((item) => !excluded(item, source))
          .map((item) => toPost(item, source))
          .filter((post) => !seen.has(post.id) && seen.add(post.id))
      ).slice(0, PER_SOURCE_LIMIT);

      console.log(`    받은 것 ${items.length}건 → 고른 것 ${picked.length}건`);
      picked.forEach((post) => console.log(`      · [${post.category}] ${post.title}`));
      collected.push(...picked);
    }

    return failed;
  }

  const primary = sources.filter(sourceEnabled);
  /*
   * 네이버 쪽과 나머지를 따로 돌린다.
   *
   * 아래 물러서기 판단은 「네이버가 다 떨어졌는가」 를 물어야 한다. 한 묶음으로
   * 세면 기관 RSS 가 한 건이라도 답하는 순간 그 판단이 거짓이 되어, 네이버가
   * 다 막혔는데도 구글 뉴스로 물러서지 않는다. 실제로 그렇게 되어 관악계
   * 소식이 통째로 비었다(2026-09-28 05:04 실행, 합계 4건 전부 예술계 소식).
   */
  const viaNaver = primary.filter((source) => source.when === "naver");
  const others = primary.filter((source) => source.when !== "naver");

  let failed = await collectFrom(viaNaver);
  const naverAllFailed = viaNaver.length > 0 && failed === viaNaver.length;
  failed += await collectFrom(others);

  /*
   * 네이버가 한 곳도 답하지 않으면 구글 뉴스로 물러선다.
   *
   * 키가 있으면 네이버 쪽만 돌린다. 그런데 키가 막히면 — 검색 권한이 없거나,
   * 개발자센터 키가 기한(2027-06-30)을 넘기거나, 네이버가 잠시 멈추면 —
   * 다섯 곳이 다 같은 이유로 떨어지고 그날은 아무것도 담지 못한 채 끝난다.
   * 키를 넣기 전에는 구글 뉴스로 받던 곳이니, 그날치는 그쪽에서라도 담는다.
   *
   * 한두 곳만 실패한 것은 그 언론사 쪽 사정이므로 물러서지 않는다. 나머지가
   * 답했다면 구글 뉴스로 같은 소식을 한 번 더 받아 오는 셈이 된다.
   *
   * 기관 RSS 가 답했는지는 여기에 끼지 않는다. 그쪽은 문화예술 전반을 담을 뿐
   * 관악 기사를 찾아 주지 않으므로, 네이버가 막힌 날의 관악 소식은 구글
   * 뉴스에서 받아야 한다.
   */
  if (hasNaver && naverAllFailed) {
    const backup = sources.filter((source) => source.enabled && source.when === "no-naver");
    if (backup.length > 0) {
      console.log(
        `\n네이버가 ${failed}곳 모두 답하지 않아 구글 뉴스로 받습니다.` +
          "\n키가 막혔는지 확인해 주세요. 요약과 사진은 덜 채워집니다.\n"
      );
      failed += await collectFrom(backup);
    }
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
    // 받아 보기만 할 때는 요약을 통째로 보여 준다. 첫머리를 제대로 긁었는지
    // 78자만 봐서는 알 수 없고, 이 판을 보려고 돌리는 것이기 때문이다.
    if (post.summary) {
      console.log(`        ${DRY_RUN ? post.summary : post.summary.slice(0, 78)}`);
      if (DRY_RUN) console.log(`        ↳ ${post.link}`);
    }
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

module.exports = { parseFeed, pickLead, trimToSentence, splitPublisher, toPost, toFields, classify, excluded, dropSimilar, similarity, sameStory, usefulSummary, withBody, pickDescription, pickImage, pickSiteName, hostLabel, toValue, findRealUrl, isGoogleNews, plain, withinAge, matches, decode, idFor, sourceEnabled, feedUrl, fetchNaverNews, unhighlight };
