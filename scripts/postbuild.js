/**
 * 빌드 뒤 처리.
 * - index.html 의 %SITE_URL% 을 실제 주소로 채운다(공유 정보는 절대 주소여야 한다).
 * - 검색엔진용 sitemap.xml 과 robots.txt, rss.xml 을 만든다.
 * - IndexNow 확인용 키 파일을 놓는다(scripts/indexnow-key.txt 가 있을 때만).
 * - 화면마다 미리 그린 HTML 을 만든다(scripts/prerender.js).
 *
 * 주소는 .env 의 REACT_APP_SITE_URL 에서 가져온다.
 */
const fs = require("fs");
const path = require("path");
require("./env")();

const BUILD = path.join(__dirname, "..", "build");
const siteUrl = (process.env.REACT_APP_SITE_URL || "").replace(/\/+$/, "");
// 주소 방식에 따라 sitemap 의 주소 모양이 달라진다.
const hashMode = process.env.REACT_APP_ROUTER === "hash";

if (!siteUrl) {
  console.warn(
    "[postbuild] REACT_APP_SITE_URL 이 없어 공유 정보와 sitemap 을 만들지 않았습니다.\n" +
      "            .env 에 REACT_APP_SITE_URL=https://example.kr 을 넣어 주세요."
  );
  process.exit(0);
}

// 1) 공유 정보의 절대 주소 채우기
const indexPath = path.join(BUILD, "index.html");
const html = fs.readFileSync(indexPath, "utf8").split("%SITE_URL%").join(siteUrl);
fs.writeFileSync(indexPath, html);

// 2) sitemap — 메뉴 정의에서 경로를 가져온다(해시 라우터라 주소에 # 가 들어간다)
const site = fs.readFileSync(path.join(__dirname, "..", "src", "data", "site.js"), "utf8");
const menuPaths = ["/", ...new Set(site.match(/path: "(\/[^"]*)"/g).map((m) => m.slice(7, -1)))];
const today = new Date().toISOString().slice(0, 10);

const sitemapXml = (paths) =>
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n'.replace(
    "www.sitemap.org",
    "www.sitemaps.org"
  ) +
  paths
    .map(
      (p) =>
        `  <url>\n    <loc>${siteUrl}${p === "/" ? "/" : hashMode ? `/#${p}` : p}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n  </url>`
    )
    .join("\n") +
  "\n</urlset>\n";

// 게시글 상세 주소는 저장소를 읽어 봐야 알 수 있어서 아래에서 다시 쓴다.
// 먼저 메뉴 주소만으로 한 벌 써 두는 것은, 저장소를 못 읽더라도 사이트맵이
// 아예 없는 일은 없도록 하기 위해서다.
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemapXml(menuPaths));

// 3) robots — 관리자 화면은 색인에서 제외
//    네이버(Yeti)와 다음(Daumoa)은 규칙이 자기 이름으로 적혀 있으면 그쪽을 먼저 본다.
//    * 와 같은 내용이지만, 막혀 있지 않다는 것을 분명히 해 두려고 따로 적는다.
fs.writeFileSync(
  path.join(BUILD, "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
    "User-agent: Yeti",
    "Allow: /",
    "Disallow: /admin",
    "",
    "User-agent: Daumoa",
    "Allow: /",
    "Disallow: /admin",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n")
);

// 3-1) IndexNow 확인용 키 파일.
//      네이버가 "이 주소는 정말 네 것이냐" 를 확인하는 용도라서 비밀이 아니다.
//      그래서 저장소에 그대로 두고, 빌드할 때 사이트 뿌리로 옮긴다.
const keyFile = path.join(__dirname, "indexnow-key.txt");
if (fs.existsSync(keyFile)) {
  const key = fs.readFileSync(keyFile, "utf8").trim();
  if (key) {
    fs.writeFileSync(path.join(BUILD, "indexnow-key.txt"), `${key}\n`);
    console.log("[postbuild] IndexNow 키 파일을 놓았습니다.");
  }
}

console.log(`[postbuild] ${siteUrl} · sitemap ${menuPaths.length}개 경로 · robots.txt 생성`);

/*
 * 4) 게시글을 한 번 읽어 RSS·프리렌더·사이트맵에 함께 쓴다.
 *
 * 여기서부터는 저장소를 부르므로 실패할 수 있다. 무엇이 실패하든 빌드는 그대로
 * 끝낸다. 그러면 위에서 이미 만들어 둔 사이트맵·robots 로 배포될 뿐이고,
 * 홈페이지가 안 열리지는 않는다.
 */
(async () => {
  let posts = { boards: [], byBoard: {}, all: [] };
  try {
    posts = await require("./posts").readPublicPosts();
    console.log(`[postbuild] 공개된 글 ${posts.all.length}건`);
  } catch (err) {
    console.warn(`[postbuild] 글을 읽지 못했습니다: ${err.message}`);
  }

  // RSS — 네이버가 이것을 콘텐츠 피드로 보고 주기적으로 다시 찾아온다.
  try {
    const { count } = await require("./feed")({ siteUrl, posts: posts.all });
    if (count) console.log(`[postbuild] rss.xml ${count}건`);
  } catch (err) {
    console.warn(`[postbuild] rss.xml 을 건너뜁니다: ${err.message}`);
  }

  // 프리렌더 — 자바스크립트를 돌리지 않는 검색엔진(네이버 Yeti 등)을 위해
  // 화면마다 진짜 HTML 을 만들어 둔다.
  let routes = [];
  try {
    routes = await require("./prerender")({ siteUrl, hashMode, posts });
    console.log(`[postbuild] 프리렌더 ${routes.length}개 화면`);
  } catch (err) {
    console.warn(`[postbuild] 프리렌더를 건너뜁니다: ${err.message}`);
  }

  // 사이트맵을 다시 쓴다. 미리 그려 둔 쪽만 넣는다 — 그리지 못한 주소를 적으면
  // 검색엔진을 빈 껍데기로 보내는 셈이다.
  const detail = posts.all
    .map((post) => `${post.board.path}/${post.id}`)
    .filter((route) => routes.includes(route));

  if (detail.length) {
    fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemapXml([...menuPaths, ...detail]));
    console.log(`[postbuild] sitemap 에 게시글 ${detail.length}개를 더했습니다.`);
  }
})();
