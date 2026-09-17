import { useEffect } from "react";
import { useRoute } from "./lib/router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { boardByPath, boards } from "./data/boards";
import { org } from "./data/site";
import { seoFor } from "./data/seo";
import Home from "./pages/Home";
import AboutOverview from "./pages/AboutOverview";
import AboutIntro from "./pages/AboutIntro";
import AboutHistory from "./pages/AboutHistory";
import AboutChairs from "./pages/AboutChairs";
import AboutOrganization from "./pages/AboutOrganization";
import AboutExecutives from "./pages/AboutExecutives";
import AboutBylaws from "./pages/AboutBylaws";
import AboutCI from "./pages/AboutCI";
import AboutLocation from "./pages/AboutLocation";
import Programs from "./pages/Programs";
import Events from "./pages/Events";
import ContestHistory from "./pages/ContestHistory";
import MembersGuide from "./pages/MembersGuide";
import MembersApply from "./pages/MembersApply";
import Branches from "./pages/Branches";
import Resources from "./pages/Resources";
import Board, { BoardDetail } from "./pages/Board";
import { Terms, Privacy, EmailPolicy } from "./pages/Policy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const ROUTES = {
  "/": Home,

  "/about/overview": AboutOverview,
  "/about/intro": AboutIntro,
  "/about/history": AboutHistory,
  "/about/chairs": AboutChairs,
  "/about/organization": AboutOrganization,
  "/about/executives": AboutExecutives,
  "/about/bylaws": AboutBylaws,
  "/about/ci": AboutCI,
  "/about/location": AboutLocation,

  "/events/programs": Programs,
  "/events/contest-history": ContestHistory,
  "/events/schedule": Events,

  "/members/guide": MembersGuide,
  "/members/apply": MembersApply,
  "/members/branches": Branches,

  "/info/arts": () => <Board board={boards.arts} />,
  "/info/scene": () => <Board board={boards.scene} />,
  "/info/member-news": () => <Board board={boards.memberNews} />,
  "/info/concert": () => <Board board={boards.concert} />,
  "/info/resources": Resources,
  "/info/jobs": () => <Board board={boards.jobs} />,

  "/community/notice": () => <Board board={boards.notice} />,
  "/community/press": () => <Board board={boards.press} />,
  "/community/disclosure": () => <Board board={boards.disclosure} />,

  "/policy/terms": Terms,
  "/policy/privacy": Privacy,
  "/policy/email": EmailPolicy,

  "/admin": Admin,
};

function resolve(path) {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;

  const Page = ROUTES[clean];
  if (Page) return <Page />;

  // 게시글 상세는 <게시판 경로>/<문서 id> 형태의 동적 경로다.
  const board = boardByPath(clean);
  if (board) {
    const id = clean.slice(board.path.length + 1);
    if (id) return <BoardDetail board={board} id={decodeURIComponent(id)} />;
  }

  return <NotFound />;
}

/**
 * 주소가 바뀔 때마다 검색엔진·공유 카드가 읽는 표식을 갈아 끼운다.
 *
 * 빌드할 때 만들어 두는 정적 HTML(scripts/prerender.js)은 메뉴에 있는 주소만
 * 다룬다. 게시글 상세처럼 주소가 그때그때 만들어지는 쪽은 서버가 홈 화면
 * HTML 을 대신 내주므로, 자바스크립트를 돌려 보는 검색엔진이 제 주소의
 * 제목·설명·대표 주소를 읽을 수 있도록 여기서 다시 써 준다.
 */
function applyMeta(path) {
  const { title, description } = seoFor(path);
  document.title = title;

  const set = (selector, attr, value) => {
    const tag = document.head.querySelector(selector);
    if (tag) tag.setAttribute(attr, value);
  };

  const url = org.siteUrl ? `${org.siteUrl}${path === "/" ? "/" : path}` : "";

  set('meta[name="description"]', "content", description);
  set('meta[property="og:title"]', "content", title);
  set('meta[property="og:description"]', "content", description);
  if (url) {
    set('link[rel="canonical"]', "href", url);
    set('meta[property="og:url"]', "content", url);
  }
}

export default function App() {
  const path = useRoute();

  useEffect(() => {
    applyMeta(path.length > 1 ? path.replace(/\/+$/, "") : path);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header path={path} />
      <main className="flex-1">{resolve(path)}</main>
      <Footer />
    </div>
  );
}
