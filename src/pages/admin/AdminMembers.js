import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Pencil, Search, Trash2, Upload, UserCheck, UserPlus, Wallet } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { digits, duplicateIds, isPaid } from "../../lib/members";
import { createDoc, removeDoc, saveDoc, saveMany } from "../../lib/store";
import { downloadBlob } from "../../lib/download";
import RosterImport from "./RosterImport";
import { instruments, memberStatuses, memberTypes, regions } from "../../data/site";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  Textarea,
  formatDate,
} from "../../components/ui";

const EXPORT_COLUMNS = [
  ["name", "성명/단체명"],
  ["birthDate", "생년월일"],
  ["memberType", "회원구분"],
  ["status", "상태"],
  ["paidAt", "입금확인일"],
  ["source", "가입경로"],
  ["instrument", "악기"],
  ["affiliation", "소속"],
  ["position", "직위"],
  ["phone", "연락처"],
  ["email", "이메일"],
  ["region", "지역"],
  ["note", "비고"],
  ["guardianName", "법정대리인"],
  ["guardianRelation", "관계"],
  ["guardianPhone", "법정대리인 연락처"],
];

/* onClick 이 있으면 눌러서 그 명단만 볼 수 있는 칸이 된다. */
function Stat({ label, value, tone = "", active = false, onClick }) {
  const body = (
    <>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone || "text-brand-900"}`}>{value}</p>
    </>
  );
  const shell = `rounded-lg border px-4 py-3 text-left ${
    active ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"
  }`;

  if (!onClick) return <div className={shell}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${shell} w-full transition hover:border-brand-400`}
    >
      {body}
    </button>
  );
}

export default function AdminMembers() {
  const { rows, loading } = useCollection("members");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [type, setType] = useState("전체");
  // 전체 · 미입금 · 중복 의심. 상태·구분 거르개와 겹쳐서 쓴다.
  const [view, setView] = useState("전체");
  const [selected, setSelected] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);

  /*
   * 중복은 걸러내기 전 명단 전체에서 본다. 걸러진 것만 놓고 보면 짝이 화면
   * 밖에 있을 때 중복이 아닌 것처럼 보인다.
   */
  const dupes = useMemo(() => duplicateIds(rows), [rows]);

  /** 미입금 — 입금 확인일이 없고 아직 승인·탈퇴하지 않은 사람. */
  const isUnpaid = (row) =>
    !isPaid(row) && row.status !== "승인" && row.status !== "탈퇴";

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return rows
      .filter((row) => status === "전체" || row.status === status)
      .filter((row) => type === "전체" || row.memberType === type)
      .filter((row) => {
        if (view === "미입금") return isUnpaid(row);
        if (view === "중복") return dupes.has(row.id);
        return true;
      })
      .filter(
        (row) =>
          !needle ||
          `${row.name} ${row.affiliation || ""} ${row.email || ""} ${row.phone || ""}`
            .toLowerCase()
            .includes(needle)
      );
  }, [rows, keyword, status, type, view, dupes]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => r.status === "대기").length,
      approved: rows.filter((r) => r.status === "승인").length,
      unpaid: rows.filter(isUnpaid).length,
      duplicate: rows.filter((r) => dupes.has(r.id)).length,
    }),
    [rows, dupes]
  );

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((row) => selected.has(row.id));

  const toggleAll = () =>
    setSelected(allVisibleSelected ? new Set() : new Set(filtered.map((r) => r.id)));

  const bulkStatus = async (nextStatus) => {
    if (selected.size === 0) return;
    await saveMany("members", [...selected], { status: nextStatus });
    setSelected(new Set());
  };

  /*
   * 입금 확인. 오늘 날짜를 적어 둔다.
   *
   * 승인과 따로 둔 이유가 있다. 입금은 통장을 보고 아는 것이고 승인은 이사회가
   * 하는 것이라 시점이 다르다. 하나로 묶으면 "돈은 들어왔는데 아직 승인 전"인
   * 사람을 가려낼 수 없다.
   */
  const bulkPaid = async () => {
    if (selected.size === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    await saveMany("members", [...selected], { paidAt: today });
    setSelected(new Set());
  };

  /*
   * 한 명 직접 담기.
   *
   * 엑셀 명부 올리기와 같은 자리에 들어간다. 오프라인으로 이미 가입한 분을
   * 한두 명 넣자고 엑셀을 만드는 것은 번거롭다. 그래서 상태도 명부 올리기와
   * 똑같이 '승인' 으로 시작한다. 사무국이 이미 회원인 줄 알고 담는 것이기
   * 때문이다. 아직 회비 전이면 아래 상태 칸에서 바꾸면 된다.
   */
  const addMember = () =>
    setEditing({
      name: "",
      phone: "",
      email: "",
      memberType: memberTypes[0]?.type || "",
      status: "승인",
      source: "직접 입력",
    });

  const saveEdit = async () => {
    const { id, ...patch } = editing;

    if (!String(patch.name || "").trim()) {
      window.alert("성명을 적어 주세요.");
      return;
    }

    // 새로 담을 때만 연락처가 겹치는지 본다. 고칠 때는 자기 자신과 겹친다.
    if (!id && digits(patch.phone)) {
      const already = rows.find(
        (row) => digits(row.phone) === digits(patch.phone) && row.status !== "탈퇴"
      );
      if (
        already &&
        !window.confirm(
          `같은 연락처의 회원이 이미 있습니다 — ${already.name}.\n그래도 새로 담을까요?`
        )
      ) {
        return;
      }
    }

    if (id) await saveDoc("members", id, patch);
    else await createDoc("members", patch);
    setEditing(null);
  };

  const remove = async (member) => {
    if (!window.confirm(`'${member.name}' 회원 정보를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await removeDoc("members", member.id);
  };

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      filtered.map((row) => {
        const record = {};
        EXPORT_COLUMNS.forEach(([key, label]) => {
          record[label] = row[key] || "";
        });
        record["신청일"] = formatDate(row.createdAt);
        return record;
      })
    );
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "회원목록");

    downloadBlob(
      XLSX.write(book, { bookType: "xlsx", type: "array" }),
      `한국관악협회_회원목록_${new Date().toISOString().slice(0, 10)}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="전체 회원" value={counts.total} />
        <Stat label="승인 대기" value={counts.pending} tone="text-amber-600" />
        <Stat label="승인 완료" value={counts.approved} tone="text-emerald-600" />
        <Stat
          label="미입금"
          value={counts.unpaid}
          tone="text-rose-600"
          active={view === "미입금"}
          onClick={() => setView(view === "미입금" ? "전체" : "미입금")}
        />
        <Stat
          label="중복 의심"
          value={counts.duplicate}
          tone="text-violet-600"
          active={view === "중복"}
          onClick={() => setView(view === "중복" ? "전체" : "중복")}
        />
      </div>

      {view !== "전체" ? (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
          {view === "미입금"
            ? "신청은 했지만 입금이 확인되지 않은 분만 보고 있습니다."
            : "연락처가 같거나 이름·생년월일이 같은 분만 보고 있습니다. 한 분이 두 번 신청했을 수 있습니다."}
          <button
            type="button"
            onClick={() => setView("전체")}
            className="ml-auto rounded border border-slate-300 px-2 py-1 text-xs font-medium text-brand-800 hover:bg-white"
          >
            전체 보기
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-56">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="이름·소속·연락처 검색"
            aria-label="회원 검색"
            className="pl-9"
          />
        </div>
        <div className="w-28">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="상태">
            <option value="전체">전체 상태</option>
            {memberStatuses.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </div>
        <div className="w-32">
          <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="회원 구분">
            <option value="전체">전체 구분</option>
            {memberTypes.map((item) => (
              <option key={item.type} value={item.type}>{item.type}</option>
            ))}
          </Select>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="secondary" onClick={addMember}>
            <UserPlus size={15} />
            회원 추가
          </Button>
          <Button variant="secondary" onClick={() => setImporting(true)}>
            <Upload size={15} />
            명부 올리기
          </Button>
          <Button variant="secondary" onClick={exportExcel} disabled={filtered.length === 0}>
            <Download size={15} />
            엑셀 내려받기
          </Button>
          <Button variant="secondary" onClick={bulkPaid} disabled={selected.size === 0}>
            <Wallet size={15} />
            선택 입금 확인 ({selected.size})
          </Button>
          <Button variant="gold" onClick={() => bulkStatus("승인")} disabled={selected.size === 0}>
            <UserCheck size={15} />
            선택 승인 ({selected.size})
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="조건에 맞는 회원이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
                <th scope="col" className="px-3 py-3 text-left font-medium">성명/단체명</th>
                <th scope="col" className="px-3 py-3 font-medium">구분</th>
                <th scope="col" className="px-3 py-3 text-left font-medium">소속</th>
                <th scope="col" className="px-3 py-3 font-medium">악기</th>
                <th scope="col" className="px-3 py-3 text-left font-medium">연락처</th>
                <th scope="col" className="px-3 py-3 font-medium">지역</th>
                <th scope="col" className="px-3 py-3 font-medium">입금</th>
                <th scope="col" className="px-3 py-3 font-medium">상태</th>
                <th scope="col" className="px-3 py-3 font-medium">신청일</th>
                <th scope="col" className="w-24 px-3 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggle(member.id)}
                      aria-label={`${member.name} 선택`}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-brand-900">
                    <span className="flex items-center gap-1.5">
                      {member.name}
                      {member.source === "명부" && (
                        <span
                          title="오프라인 명부에서 올린 회원입니다"
                          className="rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          명부
                        </span>
                      )}
                      {dupes.has(member.id) && (
                        <span
                          title="연락처나 이름·생년월일이 같은 분이 또 있습니다"
                          className="rounded-full border border-violet-300 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700"
                        >
                          중복 의심
                        </span>
                      )}
                      {member.isMinor && (
                        <span
                          title={`법정대리인 ${member.guardianName || "미입력"}`}
                          className="rounded-full border border-accent-500/40 bg-accent-500/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-600"
                        >
                          만14세미만
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-600">{member.memberType}</td>
                  <td className="px-3 py-3 text-slate-600">{member.affiliation || "-"}</td>
                  <td className="px-3 py-3 text-center text-slate-600">{member.instrument || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">
                    <span className="block">{member.phone}</span>
                    <span className="block text-xs text-slate-400">{member.email}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-600">{member.region || "-"}</td>
                  <td className="px-3 py-3 text-center">
                    {isPaid(member) ? (
                      <span className="text-xs text-slate-500" title={`입금 확인 ${member.paidAt}`}>
                        {member.paidAt}
                      </span>
                    ) : member.status === "승인" || member.status === "탈퇴" ? (
                      <span className="text-xs text-slate-300">-</span>
                    ) : (
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-700">
                        미입금
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge tone={member.status}>{member.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-500">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...member })}
                        aria-label={`${member.name} 수정`}
                        className="rounded p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(member)}
                        aria-label={`${member.name} 삭제`}
                        className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RosterImport
        open={importing}
        onClose={() => setImporting(false)}
        existing={rows}
      />

      <Modal
        open={Boolean(editing)}
        title={editing && editing.id ? "회원 정보 수정" : "회원 추가"}
        onClose={() => setEditing(null)}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>취소</Button>
            <Button onClick={saveEdit}>저장</Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "성명/단체명"],
              ["birthDate", "생년월일"],
              ["affiliation", "소속"],
              ["position", "직위"],
              ["phone", "연락처"],
              ["email", "이메일"],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  value={editing[key] || ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                />
              </Field>
            ))}
            <Field label="회원 구분">
              <Select
                value={editing.memberType || ""}
                onChange={(e) => setEditing({ ...editing, memberType: e.target.value })}
              >
                {memberTypes.map((item) => (
                  <option key={item.type} value={item.type}>{item.type}</option>
                ))}
              </Select>
            </Field>
            <Field label="악기">
              <Select
                value={editing.instrument || ""}
                onChange={(e) => setEditing({ ...editing, instrument: e.target.value })}
              >
                {instruments.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="지역">
              <Select
                value={editing.region || ""}
                onChange={(e) => setEditing({ ...editing, region: e.target.value })}
              >
                {regions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="상태">
              <Select
                value={editing.status || ""}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                {memberStatuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="입금 확인일" hint="비워 두면 미입금으로 봅니다.">
              <Input
                type="date"
                value={editing.paidAt || ""}
                onChange={(e) => setEditing({ ...editing, paidAt: e.target.value })}
              />
            </Field>
            {editing.isMinor && (
              <div className="sm:col-span-2 rounded-lg border border-accent-500/40 bg-accent-500/5 p-4">
                <p className="mb-3 text-xs font-bold text-brand-900">
                  법정대리인 동의 — 만 14세 미만 신청자입니다.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="법정대리인 성명">
                    <Input
                      value={editing.guardianName || ""}
                      onChange={(e) => setEditing({ ...editing, guardianName: e.target.value })}
                    />
                  </Field>
                  <Field label="관계">
                    <Input
                      value={editing.guardianRelation || ""}
                      onChange={(e) => setEditing({ ...editing, guardianRelation: e.target.value })}
                    />
                  </Field>
                  <Field label="연락처">
                    <Input
                      value={editing.guardianPhone || ""}
                      onChange={(e) => setEditing({ ...editing, guardianPhone: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            )}
            <div className="sm:col-span-2">
              <Field label="비고">
                <Textarea
                  rows={3}
                  value={editing.note || ""}
                  onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
