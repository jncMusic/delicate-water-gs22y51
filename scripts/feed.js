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
 * 글은 scripts/posts.js 가 읽어 온다. 프리렌더와 같은 목록을 쓰므로, 피드에
 * 실린 주소는 모두 미리 그려 둔 쪽이 있다.
 *
 * 실패해도 빌드를 멈추지 않는다
 * -----------------------------
 * 읽어 온 글이 없으면 만들지 않고 경고만 남긴다. RSS 가 없다고 홈페이지가
 * 안 열려서는 안 된다.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");

/** 피드에 담을 최대 개수. 네이버는 최근 것만 보면 된다. */
const MAX_ITEMS = 30;

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

/**
 * @param {{ siteUrl: string, posts: Array }} options
 *   posts 는 scripts/posts.js 의 all — 게시판 정보가 붙어 있고 최근 것부터다.
 */
module.exports = async function buildFeed({ siteUrl, posts }) {
  const items = (posts || []).slice(0, MAX_ITEMS);

  if (!items.length) {
    console.warn("[feed] 담을 글이 없어 rss.xml 을 만들지 않았습니다.");
    return { count: 0 };
  }

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
  return { count: items.length };
};
