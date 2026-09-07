import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Link, navigate } from "../lib/router";
import { useCollection } from "../lib/useCollection";
import { bumpCounter } from "../lib/store";
import { noticeCategories } from "../data/site";
import {
  Badge,
  Container,
  EmptyState,
  Input,
  Loading,
  PageHeader,
  Pagination,
  Select,
  formatDate,
} from "../components/ui";

const PER_PAGE = 10;

export default function Notices() {
  const { rows, loading } = useCollection("notices");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return rows
      .filter((row) => category === "전체" || row.category === category)
      .filter(
        (row) =>
          !needle ||
          `${row.title} ${row.body || ""}`.toLowerCase().includes(needle)
      )
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [rows, keyword, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const resetPage = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="공지사항"
        subtitle="협회의 소식과 안내 사항을 전해 드립니다."
        breadcrumb={["협회소식", "공지사항"]}
      />
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            전체 <strong className="text-brand-800">{filtered.length}</strong>건
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="w-32">
              <Select
                value={category}
                onChange={(e) => resetPage(setCategory)(e.target.value)}
                aria-label="분류 선택"
              >
                <option value="전체">전체 분류</option>
                {noticeCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
            <div className="relative w-56">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={keyword}
                onChange={(e) => resetPage(setKeyword)(e.target.value)}
                placeholder="제목·내용 검색"
                aria-label="공지사항 검색"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState message="조건에 맞는 공지가 없습니다." />
        ) : (
          <>
            {/* 데스크톱: 표 형태 */}
            <table className="hidden w-full border-t-2 border-brand-800 text-sm sm:table">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th scope="col" className="w-20 py-3 font-medium">분류</th>
                  <th scope="col" className="py-3 text-left font-medium">제목</th>
                  <th scope="col" className="w-28 py-3 font-medium">작성</th>
                  <th scope="col" className="w-28 py-3 font-medium">등록일</th>
                  <th scope="col" className="w-20 py-3 font-medium">조회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((notice) => (
                  <tr key={notice.id} className="hover:bg-slate-50">
                    <td className="py-3.5 text-center">
                      <Badge>{notice.pinned ? "중요" : notice.category}</Badge>
                    </td>
                    <td className="py-3.5">
                      <Link
                        to={`/news/notice/${notice.id}`}
                        className="font-medium text-slate-800 hover:text-brand-700"
                      >
                        {notice.title}
                      </Link>
                    </td>
                    <td className="py-3.5 text-center text-slate-500">{notice.author || "-"}</td>
                    <td className="py-3.5 text-center text-slate-500">
                      {formatDate(notice.createdAt)}
                    </td>
                    <td className="py-3.5 text-center text-slate-400">{notice.views || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 모바일: 카드 형태 */}
            <ul className="divide-y divide-slate-100 border-t-2 border-brand-800 sm:hidden">
              {visible.map((notice) => (
                <li key={notice.id}>
                  <Link to={`/news/notice/${notice.id}`} className="block py-4">
                    <span className="flex items-center gap-2">
                      <Badge>{notice.pinned ? "중요" : notice.category}</Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(notice.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1.5 block font-medium text-slate-800">{notice.title}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </Container>
    </>
  );
}

export function NoticeDetail({ id }) {
  const { rows, loading } = useCollection("notices");
  const counted = useRef(null);

  const index = rows.findIndex((row) => row.id === id);
  const notice = index >= 0 ? rows[index] : null;

  // 글을 처음 열 때만 조회수를 올린다(같은 글을 다시 그려도 중복되지 않음).
  useEffect(() => {
    if (!notice || counted.current === id) return;
    counted.current = id;
    bumpCounter("notices", id, "views", notice.views);
  }, [id, notice]);

  if (loading) {
    return (
      <>
        <PageHeader title="공지사항" breadcrumb={["협회소식", "공지사항"]} />
        <Container>
          <Loading />
        </Container>
      </>
    );
  }

  if (!notice) {
    return (
      <>
        <PageHeader title="공지사항" breadcrumb={["협회소식", "공지사항"]} />
        <Container>
          <EmptyState message="요청하신 글을 찾을 수 없습니다." />
          <div className="mt-6 text-center">
            <Link to="/news/notice" className="text-sm text-brand-700 hover:underline">
              목록으로 돌아가기
            </Link>
          </div>
        </Container>
      </>
    );
  }

  // 목록은 최신순이므로 뒤쪽이 더 오래된 글(= 이전 글)이다.
  const previous = rows[index + 1];
  const next = rows[index - 1];

  return (
    <>
      <PageHeader title="공지사항" breadcrumb={["협회소식", "공지사항"]} />
      <Container>
        <article>
          <header className="border-b border-slate-200 pb-5">
            <div className="mb-3 flex items-center gap-2">
              <Badge>{notice.category}</Badge>
              {notice.pinned && <Badge>중요</Badge>}
            </div>
            <h1 className="font-serif text-2xl font-bold leading-snug text-brand-900">
              {notice.title}
            </h1>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span>작성 {notice.author || "사무국"}</span>
              <span>등록일 {formatDate(notice.createdAt)}</span>
              <span>조회 {notice.views || 0}</span>
            </p>
          </header>

          <div className="whitespace-pre-line py-10 text-[15px] leading-8 text-slate-700">
            {notice.body}
          </div>
        </article>

        <div className="divide-y divide-slate-100 border-y border-slate-200 text-sm">
          {[
            { label: "이전 글", item: previous },
            { label: "다음 글", item: next },
          ].map(({ label, item }) => (
            <div key={label} className="flex items-center gap-4 py-3">
              <span className="w-16 shrink-0 text-xs text-slate-400">{label}</span>
              {item ? (
                <Link
                  to={`/news/notice/${item.id}`}
                  className="truncate text-slate-700 hover:text-brand-700"
                >
                  {item.title}
                </Link>
              ) : (
                <span className="text-slate-400">없습니다.</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/news/notice")}
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-brand-800 hover:bg-slate-50"
          >
            목록
          </button>
        </div>
      </Container>
    </>
  );
}
