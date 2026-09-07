import { ArrowRight, CalendarDays, FileDown, Megaphone } from "lucide-react";
import { Link } from "../lib/router";
import { useCollection } from "../lib/useCollection";
import { missions, org } from "../data/site";
import { Badge, EmptyState, SectionTitle, formatDate, formatBytes } from "../components/ui";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-gold-400">
          {org.nameEn}
        </p>
        <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {org.slogan}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
          {org.description}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/members/guide"
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-brand-950 transition-colors hover:bg-gold-400"
          >
            회원 가입 안내
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/about/intro"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            협회 소개
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 홈에 얹는 목록 카드(공지 / 행사 / 자료 공통 껍데기). */
function Panel({ icon: Icon, title, to, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-brand-900">
          <Icon size={18} className="text-gold-600" />
          {title}
        </h3>
        <Link to={to} className="text-xs text-slate-500 hover:text-brand-700">
          더보기 +
        </Link>
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const { rows: notices } = useCollection("notices");
  const { rows: events } = useCollection("events");
  const { rows: resources } = useCollection("resources");

  const pinnedFirst = [...notices].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
  );

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...events]
    .filter((e) => !e.startDate || e.startDate >= today)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel icon={Megaphone} title="공지사항" to="/news/notice">
            {pinnedFirst.length === 0 ? (
              <EmptyState message="등록된 공지가 없습니다." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pinnedFirst.slice(0, 5).map((notice) => (
                  <li key={notice.id}>
                    <Link
                      to={`/news/notice/${notice.id}`}
                      className="flex items-center justify-between gap-4 py-3 group"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {notice.pinned && <Badge>중요</Badge>}
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-700 group-hover:text-brand-700">
                          {notice.title}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(notice.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel icon={CalendarDays} title="다가오는 행사" to="/news/events">
            {upcoming.length === 0 ? (
              <EmptyState message="예정된 행사가 없습니다." />
            ) : (
              <ul className="space-y-3">
                {upcoming.slice(0, 5).map((event) => (
                  <li key={event.id} className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                      <span className="text-[10px]">
                        {String(event.startDate || "").slice(0, 4)}
                      </span>
                      <span className="text-sm font-bold">
                        {String(event.startDate || "").slice(5).replace("-", ".")}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {event.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {event.location || "장소 미정"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionTitle description="협회는 다음의 네 가지 축으로 활동합니다.">
            협회의 활동
          </SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {missions.map((mission, index) => (
              <div key={mission.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <span className="font-serif text-2xl font-bold text-gold-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-bold text-brand-900">{mission.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{mission.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16">
        <Panel icon={FileDown} title="최근 등록 자료" to="/resources">
          {resources.length === 0 ? (
            <EmptyState message="등록된 자료가 없습니다." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {resources.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge>{item.category}</Badge>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {item.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatBytes(item.file?.size)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="bg-brand-900">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">
              관악을 함께 만들어 갈 회원을 기다립니다
            </h2>
            <p className="mt-2 text-sm text-brand-200">
              연주자, 지도자, 학생 그리고 관악 단체 모두 가입하실 수 있습니다.
            </p>
          </div>
          <Link
            to="/members/apply"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-brand-950 hover:bg-gold-400"
          >
            가입 신청하기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
