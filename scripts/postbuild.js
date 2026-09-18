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
const paths = ["/", ...new Set(site.match(/path: "(\/[^"]*)"/g).map((m) => m.slice(7, -1)))];
const today = new Date().toISOString().slice(0, 10);

const sitemap =
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
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemap);

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

console.log(`[postbuild] ${siteUrl} · sitemap ${paths.length}개 경로 · robots.txt 생성`);

// 4) RSS — 네이버가 이것을 콘텐츠 피드로 보고 주기적으로 다시 찾아온다.
//    여기서 실패해도 빌드는 그대로 끝낸다.
const feedDone = require("./feed")({ siteUrl })
  .then(({ count }) => {
    if (count) console.log(`[postbuild] rss.xml ${count}건`);
  })
  .catch((err) => {
    console.warn(`[postbuild] rss.xml 을 건너뜁니다: ${err.message}`);
  });

// 5) 프리렌더 — 자바스크립트를 돌리지 않는 검색엔진(네이버 Yeti 등)을 위해
//    화면마다 진짜 HTML 을 만들어 둔다. 여기서 실패해도 빌드는 그대로 끝낸다.
//    그러면 예전처럼 SPA 로 배포될 뿐, 홈페이지가 안 열리지는 않는다.
const prerenderDone = require("./prerender")({ siteUrl, hashMode })
  .then((routes) => {
    console.log(`[postbuild] 프리렌더 ${routes.length}개 화면`);
  })
  .catch((err) => {
    console.warn(`[postbuild] 프리렌더를 건너뜁니다: ${err.message}`);
  });

// 둘은 서로 건드리는 파일이 달라 함께 돌아도 된다. 따로 기다리지 않는 것은
// node 가 진행 중인 입출력이 끝날 때까지 프로세스를 붙잡아 두기 때문이다.
void feedDone;
void prerenderDone;
