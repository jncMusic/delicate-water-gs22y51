import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { useCollection } from "../lib/useCollection";
import { bumpCounter, DEMO_MODE } from "../lib/store";
import { triggerDownload } from "../lib/download";
import { resourceCategories } from "../data/site";
import {
  Badge,
  Container,
  EmptyState,
  Input,
  Loading,
  PageHeader,
  Pagination,
  Select,
  formatBytes,
  formatDate,
} from "../components/ui";

const PER_PAGE = 8;

/** 파일 저장 위치가 있으면 내려받고, 없으면 이유를 알려 준다. */
export function downloadResource(item) {
  const file = item.file;
  if (!file || !file.url) {
    window.alert(
      DEMO_MODE
        ? "예시 자료이거나 데모 모드에서 저장하지 못한 파일이라 내려받을 수 없습니다.\nFirebase를 연결하면 실제 파일이 내려받아집니다."
        : "첨부파일을 찾을 수 없습니다. 사무국으로 문의해 주세요."
    );
    return;
  }

  triggerDownload(file.url, file.name);
  bumpCounter("resources", item.id, "downloads", item.downloads);
}

export default function Resources() {
  const { rows, loading } = useCollection("resources");
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
          `${row.title} ${row.description || ""} ${row.file?.name || ""}`
            .toLowerCase()
            .includes(needle)
      );
  }, [rows, keyword, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
      <PageHeader subtitle="대회 요강, 협회 서식, 교육 자료를 내려받으실 수 있습니다." />
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            전체 <strong className="text-brand-800">{filtered.length}</strong>건
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="w-32">
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                aria-label="분류 선택"
              >
                <option value="전체">전체 분류</option>
                {resourceCategories.map((item) => (
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
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="자료명 검색"
                aria-label="자료 검색"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState message="조건에 맞는 자료가 없습니다." />
        ) : (
          <>
            <ul className="divide-y divide-slate-100 border-t-2 border-brand-800">
              {visible.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start gap-4 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <FileText size={20} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{item.category}</Badge>
                      <h3 className="font-medium text-slate-800">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>{item.file?.name || "첨부 없음"}</span>
                      <span>{formatBytes(item.file?.size)}</span>
                      <span>등록 {formatDate(item.createdAt)}</span>
                      <span>다운로드 {item.downloads || 0}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadResource(item)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-slate-50"
                  >
                    <Download size={15} />
                    받기
                  </button>
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
