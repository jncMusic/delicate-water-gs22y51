import { useState } from "react";
import { CalendarDays, FolderUp, LogOut, Megaphone, Users } from "lucide-react";
import { useAdmin } from "../lib/auth";
import { DEMO_MODE } from "../lib/store";
import { Container, Loading, PageHeader } from "../components/ui";
import AdminLogin from "./admin/AdminLogin";
import AdminMembers from "./admin/AdminMembers";
import AdminNotices from "./admin/AdminNotices";
import AdminResources from "./admin/AdminResources";
import AdminEvents from "./admin/AdminEvents";

const TABS = [
  { key: "members", label: "회원 관리", icon: Users, Panel: AdminMembers },
  { key: "notices", label: "공지 관리", icon: Megaphone, Panel: AdminNotices },
  { key: "resources", label: "자료실 관리", icon: FolderUp, Panel: AdminResources },
  { key: "events", label: "일정 관리", icon: CalendarDays, Panel: AdminEvents },
];

export default function Admin() {
  const { isAdmin, ready, signIn, signOut, user, mode } = useAdmin();
  const [tab, setTab] = useState("members");

  if (!ready) {
    return (
      <Container>
        <Loading label="로그인 상태를 확인하고 있습니다..." />
      </Container>
    );
  }

  if (!isAdmin) return <AdminLogin signIn={signIn} mode={mode} />;

  const active = TABS.find((item) => item.key === tab) || TABS[0];

  return (
    <>
      <PageHeader title="관리자 페이지" subtitle={`${user.email} 님으로 로그인되어 있습니다.`} />
      <Container>
        {DEMO_MODE && (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            <strong>데모 모드</strong> — 지금 보이는 자료는 이 브라우저에만 저장됩니다.
            <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs">.env</code>
            파일에 Firebase 설정을 넣으면 실제 서버에 저장되고, 관리자 로그인도 Firebase 계정으로
            바뀝니다.
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <nav className="flex flex-wrap gap-1" aria-label="관리 메뉴">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={item.key === tab ? "page" : undefined}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  item.key === tab
                    ? "border-brand-700 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-brand-700"
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="mb-2 flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>

        <active.Panel />
      </Container>
    </>
  );
}
