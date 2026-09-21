import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, FileSpreadsheet } from "lucide-react";
import { createMany } from "../../lib/store";
import { readRoster } from "../../lib/roster";
import { memberTypes } from "../../data/site";
import { Button, Modal } from "../../components/ui";

/** 접힌 채로 시작하는 줄 목록. 길어질 수 있어 화면을 잡아먹지 않게 한다. */
function Lines({ title, lines, tone }) {
  if (lines.length === 0) return null;
  return (
    <details className="rounded-lg border border-slate-200">
      <summary className={`cursor-pointer px-3 py-2 text-sm font-medium ${tone}`}>
        {title} {lines.length}건
      </summary>
      <ul className="max-h-40 space-y-1 overflow-y-auto border-t border-slate-100 px-3 py-2 text-xs text-slate-600">
        {lines.map((item, index) => (
          <li key={`${item.line}-${index}`}>
            {item.line}번째 줄 — {item.reason || item.name}
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function RosterImport({ open, onClose, existing }) {
  const fileInput = useRef(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const reset = () => {
    setFileName("");
    setResult(null);
    setDone(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const close = () => {
    reset();
    onClose();
  };

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDone(null);
    setFileName(file.name);
    try {
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0]];
      // header: 1 이면 첫 줄을 머리글로 삼지 않고 칸 그대로 배열로 준다.
      // 머리글 이름이 제각각이라 우리가 직접 찾아야 해서 이 모양이 필요하다.
      const table = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
      setResult(readRoster(table, existing, memberTypes.map((t) => t.type)));
    } catch (err) {
      console.error(err);
      setResult({ error: "파일을 읽지 못했습니다. 엑셀(.xlsx)이나 CSV 인지 확인해 주세요." });
    }
  };

  const save = async () => {
    if (!result?.rows?.length) return;
    setSaving(true);
    try {
      const saved = await createMany("members", result.rows);
      setDone({ saved });
      setResult(null);
      setFileName("");
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      console.error(err);
      setResult({ ...result, error: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="회원 명부 올리기"
      onClose={close}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            {done ? "닫기" : "취소"}
          </Button>
          <Button onClick={save} disabled={saving || !result?.rows?.length}>
            {saving ? "담는 중..." : `${result?.rows?.length || 0}명 담기`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
          엑셀 첫 줄에 <strong className="font-semibold text-brand-900">이름 · 구분 · 연락처</strong>{" "}
          머리글을 두고, 그 아래로 한 줄에 한 분씩 적어 주세요. 칸 순서는 상관없고, 「성명」
          「회원구분」 「휴대전화」처럼 적으셔도 찾아냅니다.
          <br />
          담긴 분은 <strong className="font-semibold text-brand-900">승인</strong> 상태에 가입경로
          「명부」로 들어갑니다. 생년월일·주소는 받지 않습니다.
        </div>

        <div>
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={pick}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-800"
          />
          {fileName ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <FileSpreadsheet size={13} />
              {fileName}
            </p>
          ) : null}
        </div>

        {done ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {done.saved}명을 명단에 담았습니다. 회원 관리에서 확인해 주세요.
          </p>
        ) : null}

        {result?.error ? (
          <p className="flex gap-2.5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
            {result.error}
          </p>
        ) : null}

        {result && !result.error ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              담을 수 있는 분{" "}
              <strong className="font-semibold text-brand-900">{result.rows.length}명</strong>
            </p>

            {result.exists.length > 0 ? (
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
                <p className="text-sm font-medium text-violet-900">
                  이미 명단에 있는 분 {result.exists.length}명 — 담지 않았습니다
                </p>
                <p className="mt-1 text-xs leading-relaxed text-violet-800">
                  홈페이지로 이미 신청서를 내신 분들입니다. 오프라인 회원인데 다시 신청하신
                  경우이니, 회원 관리에서 상태를 확인해 주세요.
                </p>
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-violet-900">
                  {result.exists.map((item) => (
                    <li key={item.line}>
                      {item.name} ({item.phone}) — 지금 상태 {item.already.status}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Lines title="봐 두실 줄" lines={result.warn} tone="text-amber-700" />
            <Lines title="버린 줄" lines={result.skipped} tone="text-slate-600" />

            {result.rows.length > 0 ? (
              <details className="rounded-lg border border-slate-200" open>
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-brand-900">
                  담을 명단 미리 보기
                </summary>
                <div className="max-h-56 overflow-y-auto border-t border-slate-100">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {result.rows.map((row, index) => (
                        <tr key={`${row.name}-${index}`}>
                          <td className="px-3 py-1.5 font-medium text-brand-900">{row.name}</td>
                          <td className="px-3 py-1.5 text-slate-600">{row.memberType || "-"}</td>
                          <td className="px-3 py-1.5 text-slate-600">{row.phone || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
