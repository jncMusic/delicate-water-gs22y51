import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleAlert, CircleHelp, Download, Link2, Printer, Stamp, Trash2 } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { issueCheck, matchMember, rolesOf } from "../../lib/members";
import { loadSeal, removeDoc, saveDoc, uploadCertificate, uploadSeal } from "../../lib/store";
import CertificateSheet from "./CertificateSheet";
import { branchList, chapterList, executives, org } from "../../data/site";
import { Badge, Button, EmptyState, Loading, Select, formatDate } from "../../components/ui";

/** 신청 처리 상태. 접수 → 발급 완료, 또는 반려. */
const STATUSES = ["접수", "발급 완료", "반려"];

/**
 * 「로」인지 「으로」인지 고른다.
 *
 * 받침이 없거나 받침이 ㄹ 이면 「로」, 그 밖에는 「으로」다. 지금 상태 이름은
 * 셋 다 받침이 없지만, 나중에 「보류」 같은 것을 더하면 어긋나므로 세어서 쓴다.
 */
function withRo(word) {
  const last = String(word || "").trim().slice(-1);
  const code = last.charCodeAt(0);
  // 한글 음절이 아니면 「로」로 둔다.
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return `${word}로`;
  const jong = (code - 0xac00) % 28;
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}

/* 명부와 맞춰 본 결과를 화면에 어떻게 보일지. */
const MATCH = {
  found: {
    label: "확인됨",
    hint: "명부에 있는 승인 회원입니다",
    icon: Check,
    tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  name: {
    label: "확인 필요",
    hint: "번호는 맞는데 이름이 다르거나 아직 승인 전입니다",
    icon: CircleHelp,
    tone: "border-amber-300 bg-amber-50 text-amber-800",
  },
  none: {
    label: "명단에 없음",
    hint: "이 연락처로 등록된 회원이 없습니다",
    icon: CircleAlert,
    tone: "border-rose-300 bg-rose-50 text-rose-800",
  },
};

/**
 * 문서번호. KBA-2026-0001 꼴.
 *
 * 한 번 붙은 번호는 바뀌지 않는다. 발급한 문서에 찍혀 나가기 때문이다.
 * 그래서 신청 줄에 적어 두고, 없을 때만 새로 만든다.
 *
 * 그해에 이미 붙은 번호 중 가장 큰 것 다음을 쓴다. 지운 신청이 있어도
 * 번호가 되쓰이지 않는다.
 */
function nextDocNo(rows, year) {
  const head = `KBA-${year}-`;
  const used = rows
    .map((row) => row.docNo)
    .filter((no) => typeof no === "string" && no.startsWith(head))
    .map((no) => Number(no.slice(head.length)))
    .filter((n) => Number.isFinite(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${head}${String(next).padStart(4, "0")}`;
}

function Stat({ label, value, tone = "" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone || "text-brand-900"}`}>{value}</p>
    </div>
  );
}

export default function AdminCertificates() {
  const { rows, loading } = useCollection("certificateRequests");
  const { rows: members } = useCollection("members");
  const [status, setStatus] = useState("전체");
  const [seal, setSeal] = useState(null);
  const [sealBusy, setSealBusy] = useState(false);
  const [sealError, setSealError] = useState("");
  const [sheet, setSheet] = useState(null);
  const [issuing, setIssuing] = useState(null);
  /* 그림으로 뜰 때 쓰는 자리. 화면 밖에 두어 사무국 눈에 띄지 않게 한다. */
  const shotRef = useRef(null);
  const [shot, setShot] = useState(null);
  const sealInput = useRef(null);

  /* 직인은 화면을 열 때 한 번만 받아 온다. 인쇄할 때마다 받으면 느리다. */
  const refreshSeal = useCallback(async () => {
    try {
      setSeal(await loadSeal());
      setSealError("");
    } catch (err) {
      console.error(err);
      setSeal(null);
      setSealError("직인을 읽어 오지 못했습니다. 다시 올려 보시고, 그래도 안 되면 알려 주세요.");
    }
  }, []);

  useEffect(() => {
    refreshSeal();
  }, [refreshSeal]);

  /* 인쇄할 때 증명서만 남기려면 body 에 표시를 걸어야 한다. */
  useEffect(() => {
    document.body.classList.toggle("printing-cert", Boolean(sheet));
    return () => document.body.classList.remove("printing-cert");
  }, [sheet]);

  /* 신청마다 명부를 한 번씩 맞춰 본다. 명부가 바뀌면 다시 센다. */
  const checked = useMemo(
    () =>
      rows.map((row) => {
        const match = matchMember(row, members);
        // 이름은 명부에서 확인된 쪽을 쓴다. 신청서에 적힌 이름이 아니라
        // 협회가 아는 이름으로 자리를 찾아야 한다.
        const roles = rolesOf(match.member ? match.member.name : row.name, {
          branches: branchList,
          chapters: chapterList,
          executives,
        });
        return { ...row, match, roles, issue: issueCheck(row, match.member, roles) };
      }),
    [rows, members]
  );

  const filtered = useMemo(
    () => checked.filter((row) => status === "전체" || row.status === status),
    [checked, status]
  );

  const counts = useMemo(
    () => ({
      total: rows.length,
      waiting: rows.filter((r) => r.status === "접수").length,
      found: checked.filter((r) => r.match.state === "found").length,
      none: checked.filter((r) => r.match.state === "none").length,
    }),
    [rows, checked]
  );

  const setStatusOf = (id, next) => saveDoc("certificateRequests", id, { status: next });

  const pickSeal = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSealBusy(true);
    try {
      // 올린 그림을 그대로 받아 쓴다. 저장소에서 다시 내려받지 않는다.
      setSeal(await uploadSeal(file));
      setSealError("");
    } catch (err) {
      console.error(err);
      window.alert("직인을 올리지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSealBusy(false);
      if (sealInput.current) sealInput.current.value = "";
    }
  };

  /**
   * 증명서를 연다. 번호가 없으면 이때 붙이고 신청 줄에 적어 둔다.
   * 한 번 붙은 번호는 문서에 찍혀 나가므로 바뀌면 안 된다.
   */
  const openSheet = async (row) => {
    let docNo = row.docNo;
    if (!docNo) {
      docNo = nextDocNo(rows, new Date().getFullYear());
      await saveDoc("certificateRequests", row.id, { docNo });
    }
    setSheet({ row, docNo, issuedAt: new Date() });
  };

  /**
   * 발급한다. 증명서를 그림 한 장으로 떠서 올리고, 그 주소를 신청 줄에 남긴다.
   *
   * 직인은 이 순간 사무국 브라우저 안에서만 쓰인다. 신청한 분에게 나가는 것은
   * 완성된 문서 한 장이고 직인 그림 자체가 아니다.
   *
   * html2canvas 는 이때만 불러온다. 관리자 화면에서 증명서를 만들 때 말고는
   * 쓸 일이 없어, 늘 담아 두면 보는 사람 모두가 헛되이 내려받는다.
   */
  const issue = async (row) => {
    let docNo = row.docNo;
    if (!docNo) docNo = nextDocNo(rows, new Date().getFullYear());
    const issuedAt = new Date();

    setIssuing(row.id);
    try {
      setShot({ row, docNo, issuedAt });
      // 그려질 때까지 한 번 쉬어 간다. 그리기 전에 찍으면 빈 종이가 나온다.
      await new Promise((done) => setTimeout(done, 120));

      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shotRef.current.firstChild, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const blob = await new Promise((done) => canvas.toBlob(done, "image/png"));
      if (!blob) throw new Error("그림으로 뜨지 못했습니다");

      const url = await uploadCertificate(row.id, blob);
      await saveDoc("certificateRequests", row.id, {
        docNo,
        fileUrl: url,
        issuedAt: issuedAt.toISOString(),
        status: "발급 완료",
      });
    } catch (err) {
      console.error(err);
      window.alert("증명서를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setShot(null);
      setIssuing(null);
    }
  };

  /** 신청한 분에게 문자로 보낼 주소. */
  const linkFor = (row) => `${org.siteUrl || window.location.origin}/members/certificate/${row.id}`;

  const copyLink = async (row) => {
    try {
      await navigator.clipboard.writeText(linkFor(row));
      window.alert("주소를 복사했습니다. 문자로 보내 주세요.");
    } catch {
      window.prompt("아래 주소를 복사해 문자로 보내 주세요.", linkFor(row));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`'${row.name}' 님의 ${row.type} 신청을 지울까요? 되돌릴 수 없습니다.`)) return;
    await removeDoc("certificateRequests", row.id);
  };

  if (loading) return <Loading label="신청 내역을 불러오는 중입니다..." />;

  return (
    <div>
      <div className="mb-5 flex gap-2.5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
        <Check size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          신청자를 <strong className="font-semibold text-brand-900">회원 명부와 자동으로 대조</strong>
          합니다. 연락처가 열쇠이고, 이름까지 같은지 함께 봅니다.{" "}
          <strong className="font-semibold text-brand-900">확인됨</strong> 으로 뜬 분께만 발급해
          주세요.
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <Stamp size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
        <span className="text-sm text-slate-700">
          협회 직인{" "}
          {seal ? (
            <strong className="font-semibold text-emerald-700">올라와 있습니다</strong>
          ) : (
            <strong className="font-semibold text-rose-700">아직 없습니다</strong>
          )}
        </span>
        {seal ? (
          <img
            src={seal}
            alt="직인 미리보기"
            className="h-9 w-9 rounded border border-slate-200 object-contain"
          />
        ) : null}
        <input
          ref={sealInput}
          type="file"
          accept="image/png,image/jpeg"
          onChange={pickSeal}
          className="hidden"
        />
        <Button
          variant="secondary"
          onClick={() => sealInput.current?.click()}
          disabled={sealBusy}
        >
          {sealBusy ? "올리는 중..." : seal ? "바꾸기" : "직인 올리기"}
        </Button>
        <span className="text-xs text-slate-500">
          배경이 비치는 PNG 가 좋습니다. 사무국만 볼 수 있고 홈페이지에 나가지 않습니다.
        </span>
        {sealError ? (
          <span className="basis-full text-xs text-rose-700">{sealError}</span>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="전체 신청" value={counts.total} />
        <Stat label="처리 대기" value={counts.waiting} tone="text-amber-600" />
        <Stat label="회원 확인됨" value={counts.found} tone="text-emerald-600" />
        <Stat label="명단에 없음" value={counts.none} tone="text-rose-600" />
      </div>

      <div className="mb-4 w-36">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="처리 상태">
          <option value="전체">전체 상태</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="신청 내역이 없습니다." />
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const look = MATCH[row.match.state] || MATCH.none;
            const Icon = look.icon;
            return (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                  <div>
                    <h3 className="font-serif text-base font-bold text-brand-900">
                      {row.name}
                      <span className="ml-2 text-sm font-normal text-slate-500">{row.phone}</span>
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {row.type}
                      {row.purpose ? (
                        <span className="text-slate-500"> · {row.purpose}</span>
                      ) : null}
                    </p>
                  </div>

                  <span
                    title={look.hint}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${look.tone}`}
                  >
                    <Icon size={12} />
                    {look.label}
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <Badge tone={row.status}>{row.status}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span>
                  </div>
                </div>

                {/* 명부에서 찾은 사람이 누구인지 보여 준다. 이름이 다를 때
                    사무국이 같은 사람인지 판단할 근거가 된다. */}
                {row.match.member ? (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    명부: {row.match.member.name}
                    {row.match.member.memberType ? ` · ${row.match.member.memberType}` : ""}
                    {row.match.member.region ? ` · ${row.match.member.region}` : ""} ·{" "}
                    {row.match.member.status}
                    {row.match.member.paidAt ? ` · 입금 ${row.match.member.paidAt}` : " · 미입금"}
                  </p>
                ) : null}

                {/* 명부에 있어도 회비를 안 냈으면 지도자 확인서는 나가면 안 된다.
                    사무국이 표시만 보고 발급하지 않도록 이유를 적어 준다. */}
                {row.match.member && !row.issue.ok ? (
                  <p className="mt-2 flex gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                    발급 조건에 맞지 않습니다 — {row.issue.reason}
                  </p>
                ) : null}

                {row.teachingPlace ? (
                  <dl className="mt-3 rounded-lg border border-slate-200 px-3 py-2.5 text-xs">
                    <div className="flex gap-2 py-0.5">
                      <dt className="w-16 shrink-0 text-slate-500">지도 단체</dt>
                      <dd className="text-slate-700">{row.teachingPlace}</dd>
                    </div>
                    <div className="flex gap-2 py-0.5">
                      <dt className="w-16 shrink-0 text-slate-500">기간</dt>
                      <dd className="text-slate-700">{row.teachingPeriod || "-"}</dd>
                    </div>
                    <div className="flex gap-2 py-0.5">
                      <dt className="w-16 shrink-0 text-slate-500">직위</dt>
                      <dd className="text-slate-700">{row.teachingRole || "-"}</dd>
                    </div>
                  </dl>
                ) : null}

                {row.fileUrl ? (
                  <p className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                    <Download size={13} className="shrink-0" aria-hidden="true" />
                    제 {row.docNo} 호 발급됨 · {formatDate(row.issuedAt)}
                    <a
                      href={row.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-emerald-700"
                    >
                      파일 보기
                    </a>
                  </p>
                ) : null}

                {row.note ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {row.note}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button
                    variant="gold"
                    onClick={() => issue(row)}
                    disabled={!row.issue.ok || !seal || issuing === row.id}
                    title={
                      !seal
                        ? "직인을 먼저 올려 주세요"
                        : !row.issue.ok
                          ? row.issue.reason
                          : ""
                    }
                  >
                    <Check size={15} />
                    {issuing === row.id
                      ? "만드는 중..."
                      : row.fileUrl
                        ? "다시 발급"
                        : "발급하기"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openSheet(row)}
                    disabled={!row.issue.ok || !seal}
                  >
                    <Printer size={15} />
                    미리 보기
                  </Button>
                  {row.fileUrl ? (
                    <Button variant="secondary" onClick={() => copyLink(row)}>
                      <Link2 size={15} />
                      받는 주소 복사
                    </Button>
                  ) : null}
                  {STATUSES.filter((item) => item !== row.status).map((item) => (
                    <Button
                      key={item}
                      variant="secondary"
                      onClick={() => setStatusOf(row.id, item)}
                    >
                      {withRo(item)}
                    </Button>
                  ))}
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    aria-label={`${row.name} 신청 삭제`}
                    className="ml-auto rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 그림으로 뜰 종이. 화면 밖에 두어 보이지 않지만 실제로 그려져 있어야
          html2canvas 가 찍을 수 있다. display:none 이면 아무것도 안 나온다. */}
      {shot ? (
        <div
          ref={shotRef}
          aria-hidden="true"
          style={{ position: "fixed", left: "-9999px", top: 0 }}
        >
          <CertificateSheet
            request={shot.row}
            member={shot.row.match.member || {}}
            roles={shot.row.roles}
            docNo={shot.docNo}
            issuedAt={shot.issuedAt}
            seal={seal}
          />
        </div>
      ) : null}

      {/* 증명서를 화면 위에 띄운다. 인쇄하면 이 종이만 남는다(index.css). */}
      {sheet ? (
        <div className="cert-print-root fixed inset-0 z-50 overflow-auto bg-slate-700/60 p-6">
          <div className="mx-auto w-fit">
            <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
              <Button onClick={() => window.print()}>
                <Printer size={15} />
                인쇄 · PDF 로 저장
              </Button>
              <Button variant="secondary" onClick={() => setSheet(null)}>
                닫기
              </Button>
              <span className="text-sm text-white">
                제 {sheet.docNo} 호 · 인쇄 창에서 「PDF 로 저장」을 고르시면 파일이 됩니다.
              </span>
            </div>
            <div className="shadow-2xl">
              <CertificateSheet
                request={sheet.row}
                member={sheet.row.match.member || {}}
                roles={sheet.row.roles}
                docNo={sheet.docNo}
                issuedAt={sheet.issuedAt}
                seal={seal}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
