import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "../lib/router";
import { useCollection } from "../lib/useCollection";
import HeroSlider from "../components/HeroSlider";
import { boards, pinnedFirst } from "../data/boards";
import { branchSummary, branchTotals, missions, org, overview, programs } from "../data/site";
import { previewOf } from "../lib/fileType";
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
  const sorted = pinnedFirst(rows);

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

/**
 * 첫 화면의 포스터 띠.
 *
 * 협회가 가진 그림은 행사 포스터뿐이라, 그것을 첫 화면에 내어 글자만 있는
 * 화면을 면한다. 어느 한 게시판에 매어 두지 않고 포스터가 붙을 만한 곳
 * (공지사항·연주회 소식·자료실)에서 그림 있는 글을 모아 최신 넉 장을 고른다.
 * 사무국이 새 포스터를 올리면 따로 손대지 않아도 띠가 바뀐다.
 *
 * 한 장도 없으면 띠 자체를 그리지 않는다. 빈 칸을 남기느니 없는 편이 낫다.
 */
function PosterStrip() {
  const notices = useCollection(boards.notice.collection);
  const concerts = useCollection(boards.concert.collection);
  const resources = useCollection("resources");

  const posters = useMemo(() => {
    const fromBoard = (rows, board) =>
      rows
        .filter((row) => row.images?.[0])
        .map((row) => ({
          key: `${board.collection}-${row.id}`,
          src: row.images[0].thumb || row.images[0].url,
          title: row.title,
          to: `${board.path}/${row.id}`,
          label: board.label,
          createdAt: row.createdAt,
        }));

    const fromResources = resources.rows
      .map((row) => ({ row, src: previewOf(row) }))
      .filter((item) => item.src)
      .map(({ row, src }) => ({
        key: `resources-${row.id}`,
        src,
        title: row.title,
        to: "/info/resources",
        label: "자료실",
        createdAt: row.createdAt,
      }));

    const all = [
      ...fromBoard(notices.rows, boards.notice),
      ...fromBoard(concerts.rows, boards.concert),
      ...fromResources,
    ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    // 같은 포스터를 공지와 자료실에 함께 올리는 일이 흔하다. 띠에 두 번
    // 나오면 자료가 적어 보이니 그림이 같으면 먼저 것만 남긴다.
    const seen = new Set();
    return all
      .filter((item) => !seen.has(item.src) && seen.add(item.src))
      .slice(0, 4);
  }, [notices.rows, concerts.rows, resources.rows]);

  if (posters.length === 0) return null;

  // 넉 장이 안 되면 칸도 그만큼만 잡는다. 빈 칸이 남으면 덜 찬 것처럼 보인다.
  const columns =
    posters.length >= 4 ? "lg:grid-cols-4" : posters.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-serif text-xl font-bold text-brand-900">행사 포스터</h2>
        <div className={`mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 ${columns}`}>
          {posters.map((poster) => (
            <Link key={poster.key} to={poster.to} className="group block">
              <span className="block overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  src={poster.src}
                  alt=""
                  loading="lazy"
                  className="aspect-[5/7] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="mt-3 block text-xs text-slate-400">{poster.label}</span>
              <span className="mt-0.5 block text-sm font-medium leading-snug text-brand-900 group-hover:text-brand-700">
                {poster.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 포스터를 앞세우는 홈 카드.
 *
 * 연주회 소식처럼 포스터가 붙는 게시판은 제목만 나열하기보다 첫 글의 그림을
 * 크게 보여 주는 편이 눈에 들어온다. 그림이 없으면 글 목록으로 물러난다.
 */
function PosterHighlight({ board }) {
  const { rows } = useCollection(board.collection);
  const sorted = pinnedFirst(rows);

  if (sorted.length === 0) return <EmptyState message="등록된 소식이 없습니다." />;

  const [lead, ...rest] = sorted;
  const image = lead.images?.[0];
  if (!image) return <PostList board={board} />;

  return (
    <div>
      <Link to={`${board.path}/${lead.id}`} className="group flex gap-4">
        <img
          src={image.thumb || image.url}
          alt=""
          loading="lazy"
          className="h-32 w-[90px] shrink-0 rounded-lg border border-slate-200 object-cover"
        />
        <span className="min-w-0 flex-1">
          <span className="text-xs tabular-nums text-slate-400">
            {formatDate(lead.createdAt)}
          </span>
          <span className="mt-1 block font-medium leading-snug text-brand-900 group-hover:text-brand-700">
            {lead.title}
          </span>
          {/* line-clamp 는 스스로 display 를 -webkit-box 로 바꾼다. 여기에 block 을
              같이 붙이면 그쪽이 이겨 줄이 잘리지 않는다. */}
          {lead.body && (
            <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
              {lead.body}
            </span>
          )}
        </span>
      </Link>

      {rest.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {rest.slice(0, 3).map((post) => (
            <li key={post.id}>
              <Link
                to={`${board.path}/${post.id}`}
                className="group flex items-center gap-3 py-2.5 text-sm"
              >
                <span className="w-20 shrink-0 text-xs tabular-nums text-slate-400">
                  {formatDate(post.createdAt)}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-700 group-hover:text-brand-700">
                  {post.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const { rows: banners } = useCollection("banners");
  const { rows: events } = useCollection("events");
  const [leftTab, setLeftTab] = useState("notice");
  const [rightTab, setRightTab] = useState("branch");
  const [newsTab, setNewsTab] = useState("arts");

  const orderedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...events]
    .filter((e) => !e.startDate || e.startDate >= today)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));

  const leftBoard = leftTab === "notice" ? boards.notice : boards.press;
  const newsBoard = boards[newsTab];

  return (
    <>
      <HeroSlider banners={orderedBanners} />

      <PosterStrip />

      <div className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="font-display text-xs font-semibold tracking-[0.2em] text-accent-600">
                ABOUT KBA
              </p>
              <h2 className="mt-3 font-serif text-2xl font-bold leading-snug text-brand-900 sm:text-3xl">
                {org.name}는 {org.founded}에 창설되었습니다
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">{overview.purpose}</p>
              <Link
                to="/about/overview"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:text-accent-600"
              >
                협회 소개 자세히 보기
                <ArrowRight size={15} />
              </Link>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
              {[
                { label: "창설", value: org.founded.replace("년", ""), unit: "년" },
                { label: "지회", value: branchTotals.branches, unit: "개" },
                { label: "지부", value: branchTotals.chapters, unit: "개" },
                { label: "사업", value: programs.length, unit: "개" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white px-5 py-6 text-center">
                  <dt className="text-xs text-slate-500">{stat.label}</dt>
                  <dd className="mt-1.5 font-serif text-2xl font-bold tabular-nums text-brand-900">
                    {stat.value}
                    <span className="ml-0.5 text-sm font-medium text-slate-400">{stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid items-start gap-6 lg:grid-cols-2">
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
            tabs={[{ key: "branch", label: "지회·지부" }]}
            active={rightTab}
            onChange={setRightTab}
            moreTo="/members/branches"
          >
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
          </TabCard>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <TabCard
            tabs={[{ key: "concert", label: "연주회 소식" }]}
            active="concert"
            onChange={() => {}}
            moreTo={boards.concert.path}
          >
            <PosterHighlight board={boards.concert} />
          </TabCard>

          <TabCard
            tabs={[
              { key: "arts", label: "예술계 소식" },
              { key: "scene", label: "관악계 소식" },
              { key: "memberNews", label: "회원동향" },
            ]}
            active={newsTab}
            onChange={setNewsTab}
            moreTo={newsBoard.path}
          >
            <PostList board={newsBoard} />
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
                <span className="font-serif text-2xl font-bold text-accent-600">
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
              관악을 전공했거나 지도하는 분은 정회원으로, 그 밖에 관악 활동에 관심 있는 분은 준회원으로 가입하실 수 있습니다.
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
