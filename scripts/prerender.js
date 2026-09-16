/**
 * 빌드 뒤 화면마다 진짜 HTML 파일을 만든다(프리렌더).
 *
 * 왜 필요한가
 * -----------
 * 이 홈페이지는 자바스크립트가 화면을 그리는 방식(SPA)이라, 서버가 주는
 * HTML 에는 <div id="root"></div> 한 줄밖에 없다. 구글은 자바스크립트를
 * 돌려 보고 나서 색인하지만, 네이버 크롤러(Yeti)는 그렇게 하지 않는다.
 * 그래서 지금 상태로는 네이버가 읽을 글자가 사실상 없다.
 *
 * 무엇을 하는가
 * -------------
 * 빌드가 끝나면 메뉴에 있는 주소를 하나씩 미리 그려서 build/<주소>.html 로
 * 저장한다. 크롤러는 제목·본문·메뉴 링크가 다 들어 있는 HTML 을 받고,
 * 브라우저로 들어온 사람에게는 React 가 같은 자리를 다시 그리므로 보이는
 * 화면은 전과 똑같다.
 *
 * 왜 build/about/intro.html 인가
 * ------------------------------
 * Cloudflare Workers 의 정적 파일 규칙(html_handling 기본값)이
 * /about/intro 요청에 about/intro.html 을 내준다. 그래서 sitemap 에 적은
 * 주소 모양(끝에 / 없음)과 파일이 정확히 맞아떨어진다.
 *
 * 실패해도 빌드를 멈추지 않는다
 * -----------------------------
 * 여기서 문제가 생기면 경고만 남기고 넘어간다. 그러면 프리렌더 이전과 같은
 * SPA 로 배포되므로 홈페이지가 안 열리는 일은 없다.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");

/**
 * Firebase 를 빈 껍데기로 바꾼다.
 *
 * 프리렌더는 화면 뼈대만 그리면 되고, Firebase 는 브라우저를 전제로 만들어져
 * 있어 Node 에서 불러오면 탈이 나기 쉽다. 껍데기를 물려 두면 store.js 가
 * 데모 모드로 떨어져 게시판이 빈 목록으로 그려진다 — 게시판의 글은 어차피
 * 수시로 바뀌므로 미리 그려 둘 대상이 아니다.
 */
const firebaseStub = {
  name: "firebase-stub",
  setup(build) {
    build.onResolve({ filter: /^firebase(\/|$)/ }, (args) => ({
      path: args.path,
      namespace: "firebase-stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "firebase-stub" }, () => ({
      // 이름을 하나하나 적지 않아도 되도록 Proxy 로 받아 넘긴다.
      contents: "module.exports = new Proxy({}, { get: () => () => {} });",
      loader: "js",
    }));
  },
};

/** index.css 처럼 스타일 파일을 불러오는 자리는 없는 셈 친다. */
const ignoreStyles = {
  name: "ignore-styles",
  setup(build) {
    build.onLoad({ filter: /\.(css|scss|sass)$/ }, () => ({ contents: "", loader: "js" }));
  },
};

/** 브라우저에만 있는 것들을 최소한으로 흉내 낸다. 화면을 그리는 동안만 쓰인다. */
function installBrowserGlobals() {
  const noop = () => {};
  const storage = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: () => null,
    length: 0,
  };

  global.window = {
    location: { pathname: "/", hash: "", search: "", href: "", origin: "" },
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    scrollTo: noop,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    localStorage: storage,
    sessionStorage: storage,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    navigator: { userAgent: "prerender" },
    innerWidth: 1280,
    innerHeight: 800,
  };
  global.localStorage = storage;
  global.navigator = global.window.navigator;
}

/** 화면에 넣을 값이 HTML 을 망가뜨리지 않게 막는다. */
const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * index.html 을 본으로 삼아 한 쪽의 HTML 을 만든다.
 * 제목·설명·대표 주소만 갈아 끼우고, 나머지(스타일·스크립트 태그)는 그대로 쓴다.
 */
function pageHtml(template, { url, title, description, markup }) {
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
    `$1${escapeAttr(description)}$2`
  );
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/,
    `$1${escapeAttr(title)}$2`
  );
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/,
    `$1${escapeAttr(description)}$2`
  );
  if (url) {
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${escapeAttr(url)}$2`);
    html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${escapeAttr(url)}$2`);
  }

  // 그려 둔 화면을 root 안에 넣는다. 브라우저에서는 React 가 이 자리를 지우고
  // 다시 그리므로(createRoot 의 동작), 사람이 보는 화면은 달라지지 않는다.
  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);

  return html;
}

module.exports = async function prerender({ siteUrl, hashMode }) {
  if (hashMode) {
    console.log("[prerender] 해시 라우터에서는 주소마다 파일을 만들 수 없어 건너뜁니다.");
    return [];
  }

  const esbuild = require("esbuild");

  // 1) 앱을 Node 에서 한 번 돌릴 수 있는 형태로 묶는다.
  const bundle = await esbuild.build({
    stdin: {
      contents: `
        const { renderToStaticMarkup } = require("react-dom/server");
        const React = require("react");
        const App = require("./src/App").default;
        const { seoFor } = require("./src/data/seo");
        module.exports = {
          render: () => renderToStaticMarkup(React.createElement(App)),
          seoFor,
        };
      `,
      resolveDir: ROOT,
      loader: "js",
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    target: "node18",
    jsx: "automatic",
    loader: { ".js": "jsx", ".png": "dataurl", ".svg": "dataurl" },
    plugins: [firebaseStub, ignoreStyles],
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.REACT_APP_SITE_URL": JSON.stringify(siteUrl),
      "process.env.REACT_APP_ROUTER": '""',
      // Firebase 설정을 비워 두면 store.js 가 데모 모드로 떨어진다.
      "process.env.REACT_APP_FIREBASE_API_KEY": '""',
      "process.env.REACT_APP_FIREBASE_PROJECT_ID": '""',
    },
    logLevel: "silent",
  });

  const bundlePath = path.join(ROOT, "node_modules", ".cache", "kba-prerender.js");
  fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
  fs.writeFileSync(bundlePath, bundle.outputFiles[0].text);

  // 2) 브라우저 흉내를 낸 다음 앱을 불러온다.
  installBrowserGlobals();
  const app = require(bundlePath);

  // 3) 미리 그릴 주소 — 메뉴에 있는 쪽만. 관리자와 게시글 상세는 뺀다.
  const routes = collectRoutes();

  const template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
  const written = [];

  for (const route of routes) {
    const { title, description } = app.seoFor(route);
    global.window.location.pathname = route;
    global.window.location.href = `${siteUrl}${route}`;

    let markup;
    try {
      markup = app.render();
    } catch (err) {
      console.warn(`[prerender] ${route} 를 그리지 못했습니다: ${err.message}`);
      continue;
    }

    const html = pageHtml(template, {
      url: siteUrl ? `${siteUrl}${route === "/" ? "/" : route}` : "",
      title,
      description,
      markup,
    });

    const file =
      route === "/" ? path.join(BUILD, "index.html") : path.join(BUILD, `${route.slice(1)}.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written.push(route);
  }

  return written;
};

/** src/data/site.js 의 메뉴 정의에서 미리 그릴 주소를 뽑는다. */
function collectRoutes() {
  const source = fs.readFileSync(path.join(ROOT, "src", "data", "site.js"), "utf8");
  const found = source.match(/path: "(\/[^"]*)"/g).map((m) => m.slice(7, -1));
  return ["/", ...new Set(found)].filter((p) => !p.startsWith("/admin"));
}
