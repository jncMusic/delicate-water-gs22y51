import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Pencil, Search, Trash2, UserCheck } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { removeDoc, saveDoc, saveMany } from "../../lib/store";
import { downloadBlob } from "../../lib/download";
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
  ["memberType", "회원구분"],
  ["status", "상태"],
  ["instrument", "악기"],
  ["affiliation", "소속"],
  ["position", "직위"],
  ["phone", "연락처"],
  ["email", "이메일"],
  ["region", "지역"],
  ["note", "비고"],
];

function Stat({ label, value, tone = "" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone || "text-brand-900"}`}>{value}</p>
    </div>
  );
}

export default function AdminMembers() {
  const { rows, loading } = useCollection("members");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [type, setType] = useState("전체");
  const [selected, setSelected] = useState(() => new Set());
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return rows
      .filter((row) => status === "전체" || row.status === status)
      .filter((row) => type === "전체" || row.memberType === type)
      .filter(
        (row) =>
          !needle ||
          `${row.name} ${row.affiliation || ""} ${row.email || ""} ${row.phone || ""}`
            .toLowerCase()
            .includes(needle)
      );
  }, [rows, keyword, status, type]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => r.status === "대기").length,
      approved: rows.filter((r) => r.status === "승인").length,
    }),
    [rows]
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

  const saveEdit = async () => {
    const { id, ...patch } = editing;
    await saveDoc("members", id, patch);
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
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="전체 회원" value={counts.total} />
        <Stat label="승인 대기" value={counts.pending} tone="text-amber-600" />
        <Stat label="승인 완료" value={counts.approved} tone="text-emerald-600" />
      </div>

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
          <Button variant="secondary" onClick={exportExcel} disabled={filtered.length === 0}>
            <Download size={15} />
            엑셀 내려받기
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
                  <td className="px-3 py-3 font-medium text-brand-900">{member.name}</td>
                  <td className="px-3 py-3 text-center text-slate-600">{member.memberType}</td>
                  <td className="px-3 py-3 text-slate-600">{member.affiliation || "-"}</td>
                  <td className="px-3 py-3 text-center text-slate-600">{member.instrument || "-"}</td>
                  <td className="px-3 py-3 text-slate-600">
                    <span className="block">{member.phone}</span>
                    <span className="block text-xs text-slate-400">{member.email}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-600">{member.region || "-"}</td>
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

      <Modal
        open={Boolean(editing)}
        title="회원 정보 수정"
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
