import { useRoute } from "./lib/router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutIntro from "./pages/AboutIntro";
import AboutHistory from "./pages/AboutHistory";
import AboutOrganization from "./pages/AboutOrganization";
import AboutBylaws from "./pages/AboutBylaws";
import AboutLocation from "./pages/AboutLocation";
import Notices, { NoticeDetail } from "./pages/Notices";
import Events from "./pages/Events";
import Programs from "./pages/Programs";
import Resources from "./pages/Resources";
import MembersGuide from "./pages/MembersGuide";
import MembersApply from "./pages/MembersApply";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const ROUTES = {
  "/": Home,
  "/about/intro": AboutIntro,
  "/about/history": AboutHistory,
  "/about/organization": AboutOrganization,
  "/about/bylaws": AboutBylaws,
  "/about/location": AboutLocation,
  "/news/notice": Notices,
  "/news/events": Events,
  "/programs": Programs,
  "/resources": Resources,
  "/members/guide": MembersGuide,
  "/members/apply": MembersApply,
  "/admin": Admin,
};

function resolve(path) {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;

  const Page = ROUTES[clean];
  if (Page) return <Page />;

  // 공지 상세는 /news/notice/{문서id} 형태의 동적 경로다.
  const noticeMatch = clean.match(/^\/news\/notice\/(.+)$/);
  if (noticeMatch) return <NoticeDetail id={decodeURIComponent(noticeMatch[1])} />;

  return <NotFound />;
}

export default function App() {
  const path = useRoute();

  return (
    <div className="flex min-h-screen flex-col">
      <Header path={path} />
      <main className="flex-1">{resolve(path)}</main>
      <Footer />
    </div>
  );
}
