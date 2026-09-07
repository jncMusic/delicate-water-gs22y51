import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "../lib/router";
import { useCollection } from "../lib/useCollection";
import HeroSlider from "../components/HeroSlider";
import { boards } from "../data/boards";
import { affiliateTypes, branchSummary, branchTotals, missions } from "../data/site";
import { Badge, EmptyState, SectionTitle, formatDate } from "../components/ui";

/** 참고 사이트처럼 탭으로 두 목록을 번갈아 보여주는 홈 카드. */
function TabCard({ tabs, active, onChange, moreTo, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {tabs.map((tab, index) => (
            <span key={tab.key} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden="true" className="text-slate-300">·</span>}
              <button
                type="button"
                onClick={() => onChange(tab.key)}
                aria-current={tab.key === active ? "true" : undefined}
                className={`font-serif text-lg font-bold transition-colors ${
                  tab.key === active
                    ? "text-brand-800 underline decoration-accent-500 decoration-2 underline-offset-8"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            </span>
          ))}
        </div>
        <Link
          to={moreTo}
          aria-label="더보기"
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-400 hover:border-brand-300 hover:text-brand-700"
        >
          +
        </Link>
      </div>
      {children}
    </div>
  );
}

/** 날짜가 왼쪽, 제목이 오른쪽에 오는 홈 전용 목록. */
function PostList({ board }) {
  const { rows } = useCollection(board.collection);
  const sorted = [...rows].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
  );

  if (sorted.length === 0) return <EmptyState message="등록된 글이 없습니다." />;

  return (
    <ul className="divide-y divide-slate-100">
      {sorted.slice(0, 6).map((post) => (
        <li key={post.id}>
          <Link
            to={`${board.path}/${post.id}`}
            className="group flex items-center gap-4 py-3 text-sm"
          >
            <span className="w-24 shrink-0 text-xs tabular-nums text-slate-400">
              {formatDate(post.createdAt)}
            </span>
            <span className="min-w-0 flex-1 truncate text-slate-700 group-hover:text-brand-700">
              {post.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const { rows: banners } = useCollection("banners");
  const { rows: events } = useCollection("events");
  const [leftTab, setLeftTab] = useState("notice");
  const [rightTab, setRightTab] = useState("branch");

  const orderedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...events]
    .filter((e) => !e.startDate || e.startDate >= today)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));

  const leftBoard = leftTab === "notice" ? boards.notice : boards.press;

  return (
    <>
      <HeroSlider banners={orderedBanners} />

      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <TabCard
            tabs={[
              { key: "notice", label: "공지사항" },
              { key: "press", label: "보도자료" },
            ]}
            active={leftTab}
            onChange={setLeftTab}
            moreTo={leftBoard.path}
          >
            <PostList board={leftBoard} />
          </TabCard>

          <TabCard
            tabs={[
              { key: "branch", label: "지회·지부" },
              { key: "affiliate", label: "회원단체" },
            ]}
            active={rightTab}
            onChange={setRightTab}
            moreTo={rightTab === "branch" ? "/members/branches" : "/members/affiliates"}
          >
            {rightTab === "branch" ? (
              <div>
                <div className="flex items-center gap-5">
                  <span className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-900 text-white">
                    <span className="font-serif text-3xl font-bold">{branchTotals.branches}</span>
                    <span className="mt-0.5 text-[10px] tracking-widest text-brand-300">지회</span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed text-slate-600">
                      국내외 {branchTotals.branches}개 지회와 {branchTotals.chapters}개 지부를 두고
                      있습니다.
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {branchSummary.map((row) => (
                        <li key={row.area}>
                          {row.area} <strong className="text-brand-800">{row.count}</strong>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/members/branches"
                      className="mt-3 inline-block rounded-full border border-slate-300 px-4 py-1.5 text-xs text-brand-800 hover:bg-slate-50"
                    >
                      자세히 보기
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {affiliateTypes.map((type) => (
                  <li key={type.name} className="flex items-start gap-4">
                    <span className="mt-0.5 shrink-0 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-bold text-accent-600">
                      {type.name}
                    </span>
                    <span className="min-w-0 text-sm leading-relaxed text-slate-600">
                      {type.summary}
                    </span>
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    to="/members/affiliates"
                    className="inline-block rounded-full border border-slate-300 px-4 py-1.5 text-xs text-brand-800 hover:bg-slate-50"
                  >
                    자세히 보기
                  </Link>
                </li>
              </ul>
            )}
          </TabCard>
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
                <span className="font-serif text-2xl font-bold text-accent-500">
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
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-brand-900">
            <CalendarDays size={19} className="text-accent-600" />
            다가오는 행사
          </h2>
          <Link to="/events/schedule" className="text-xs text-slate-500 hover:text-brand-700">
            전체 일정 +
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState message="예정된 행사가 없습니다." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.slice(0, 4).map((event) => (
              <li key={event.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <Badge>{event.category || "행사"}</Badge>
                <p className="mt-3 font-serif text-xl font-bold tabular-nums text-brand-800">
                  {String(event.startDate || "").replace(/-/g, ".")}
                </p>
                <h3 className="mt-1 font-medium text-brand-900">{event.title}</h3>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {event.location || "장소 미정"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-brand-900">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">
              회원 가입 안내
            </h2>
            <p className="mt-2 text-sm text-brand-200">
              연주자, 지도자, 학생과 관악 단체가 정회원·준회원·단체회원으로 가입할 수 있습니다.
            </p>
          </div>
          <Link
            to="/members/apply"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-bold text-brand-950 hover:bg-accent-400"
          >
            가입 신청하기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
