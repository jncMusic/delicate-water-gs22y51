/**
 * 빌드 뒤 처리.
 * - index.html 의 %SITE_URL% 을 실제 주소로 채운다(공유 정보는 절대 주소여야 한다).
 * - 검색엔진용 sitemap.xml 과 robots.txt 를 만든다.
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
fs.writeFileSync(
  path.join(BUILD, "robots.txt"),
  ["User-agent: *", "Allow: /", "Disallow: /admin", "", `Sitemap: ${siteUrl}/sitemap.xml`, ""].join("\n")
);

console.log(`[postbuild] ${siteUrl} · sitemap ${paths.length}개 경로 · robots.txt 생성`);
