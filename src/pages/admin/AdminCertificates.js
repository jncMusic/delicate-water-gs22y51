import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleHelp, Trash2 } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { issueCheck, matchMember } from "../../lib/members";
import { removeDoc, saveDoc } from "../../lib/store";
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

  /* 신청마다 명부를 한 번씩 맞춰 본다. 명부가 바뀌면 다시 센다. */
  const checked = useMemo(
    () =>
      rows.map((row) => {
        const match = matchMember(row, members);
        return { ...row, match, issue: issueCheck(row, match.member) };
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

                {row.note ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {row.note}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
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
    </div>
  );
}
