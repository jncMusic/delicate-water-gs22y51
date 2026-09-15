import { useEffect } from "react";
import { useRoute } from "./lib/router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { boardByPath, boards } from "./data/boards";
import { findMenu, org } from "./data/site";
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
  "/events/schedule": Events,

  "/members/guide": MembersGuide,
  "/members/apply": MembersApply,
  "/members/branches": Branches,

  "/info/scene": () => <Board board={boards.scene} />,
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

/** 주소에 맞는 문서 제목을 찾는다. 브라우저 탭·방문 기록·검색 결과에 쓰인다. */
function titleFor(path) {
  if (path === "/") return `${org.name} | ${org.nameEn}`;
  const found = findMenu(path);
  if (found) return `${found.child.label} | ${org.name}`;
  const board = boardByPath(path);
  if (board) return `${board.label} | ${org.name}`;
  if (path === "/admin") return `관리자 | ${org.name}`;
  return org.name;
}

export default function App() {
  const path = useRoute();

  useEffect(() => {
    document.title = titleFor(path.length > 1 ? path.replace(/\/+$/, "") : path);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header path={path} />
      <main className="flex-1">{resolve(path)}</main>
      <Footer />
    </div>
  );
}
