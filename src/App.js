import { useEffect } from "react";
import { useRoute } from "./lib/router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { boardByPath, boards } from "./data/boards";
import { applyMeta } from "./lib/meta";
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
import MembersCertificate from "./pages/MembersCertificate";
import CertificateStatus from "./pages/CertificateStatus";
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
  "/members/certificate": MembersCertificate,

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

  // 증명서 확인은 /members/certificate/<신청 id> 다. 접수할 때 받은 주소로
  // 본인이 자기 것을 확인하는 자리라, 주소가 그때그때 만들어진다.
  if (clean.startsWith("/members/certificate/")) {
    const id = clean.slice("/members/certificate/".length);
    if (id) return <CertificateStatus id={decodeURIComponent(id)} />;
  }

  // 게시글 상세는 <게시판 경로>/<문서 id> 형태의 동적 경로다.
  const board = boardByPath(clean);
  if (board) {
    const id = clean.slice(board.path.length + 1);
    if (id) return <BoardDetail board={board} id={decodeURIComponent(id)} />;
  }

  return <NotFound />;
}

export default function App() {
  const path = useRoute();

  useEffect(() => {
    // 게시글 상세는 글을 읽어 온 Board.js 가 글을 쥐고 한 번 더 부른다.
    applyMeta(path);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header path={path} />
      <main className="flex-1">{resolve(path)}</main>
      <Footer />
    </div>
  );
}
