import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, Download, FileSpreadsheet } from "lucide-react";
import { createMany } from "../../lib/store";
import { downloadBlob } from "../../lib/download";
import { readRoster } from "../../lib/roster";
import { memberTypes, regions } from "../../data/site";
import { Button, Modal } from "../../components/ui";

/**
 * 빈 양식을 만들어 내려 준다.
 *
 * 파일을 저장소에 넣어 두지 않는 이유가 있다. 읽는 쪽(roster.js)이 받아 주는
 * 머리글이 바뀌면 양식도 같이 바뀌어야 하는데, 넣어 둔 파일은 따라오지 않는다.
 * 여기서 만들면 늘 맞는다.
 *
 * 첫 장에는 머리글만 둔다. 보기를 같이 넣으면 지우지 않고 그대로 올리는 일이
 * 생긴다. 보기는 둘째 장에 따로 둔다.
 */
function downloadTemplate() {
  const book = XLSX.utils.book_new();

  const sheet = XLSX.utils.aoa_to_sheet([
    ["이름", "구분", "연락처", "지역", "입금일", "신청일"],
  ]);
  sheet["!cols"] = [
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(book, sheet, "명부");

  const guide = XLSX.utils.aoa_to_sheet([
    ["회원 명부 양식 — 적는 법"],
    [],
    ["1", "첫 장(명부)의 둘째 줄부터 한 줄에 한 분씩 적어 주세요."],
    ["2", "이름만 반드시 있어야 합니다. 비어 있으면 그 줄은 넘어갑니다."],
    ["3", "나머지 칸은 비워 두셔도 됩니다. 아는 것만 적으시면 됩니다."],
    [],
    ["칸별 안내"],
    ["구분", "아래 다섯 가지 중 하나로 적어 주세요."],
    ["", memberTypes.map((item) => item.type).join(" · ")],
    ["연락처", "010-1234-5678 처럼 적으셔도 되고 숫자만 적으셔도 됩니다."],
    ["", "비워 두면 담기기는 하지만 중복 확인이 되지 않습니다."],
    ["지역", regions.join(" · ")],
    ["입금일", "회비를 납부하신 날입니다. 2026-03-15 처럼 적어 주세요."],
    ["", "비워 두면 미입금으로 보지 않습니다. 승인 상태로 담기기 때문입니다."],
    ["신청일", "처음 가입하신 날입니다. 2020-05-01 처럼 적어 주세요."],
    ["", "비워 두면 명부를 올리는 날로 찍힙니다."],
    [],
    ["보기"],
    ["이름", "구분", "연락처", "지역", "입금일", "신청일"],
    ["홍길동", "정회원", "010-1234-5678", "서울", "2026-03-15", "2020-05-01"],
    ["김철수", "평생회원", "01098765432", "부산", "2025-01-20", ""],
    ["서울윈드오케스트라", "특별회원", "02-1234-5678", "서울", "", ""],
    [],
    ["이 장은 안내용입니다. 올릴 때는 첫 장만 읽으므로 그대로 두셔도 됩니다."],
  ]);
  guide["!cols"] = [
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(book, guide, "안내");

  downloadBlob(
    XLSX.write(book, { bookType: "xlsx", type: "array" }),
    "한국관악협회_회원명부_양식.xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

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
      // cellDates 를 켜야 날짜 칸이 일련번호(45731)가 아니라 Date 로 온다.
      const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
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
          엑셀 첫 줄에{" "}
          <strong className="font-semibold text-brand-900">
            이름 · 구분 · 연락처 · 지역 · 입금일 · 신청일
          </strong>{" "}
          머리글을 두고, 그 아래로 한 줄에 한 분씩 적어 주세요. 칸 순서는 상관없고, 「성명」
          「회원구분」 「휴대전화」처럼 적으셔도 찾아냅니다.{" "}
          <strong className="font-semibold text-brand-900">이름만 있으면 되고</strong> 나머지는
          비워 두셔도 됩니다.
          <br />
          담긴 분은 <strong className="font-semibold text-brand-900">승인</strong> 상태에 가입경로
          「명부」로 들어갑니다. 생년월일·주소는 받지 않습니다.
        </div>

        <Button variant="secondary" onClick={downloadTemplate}>
          <Download size={15} />
          빈 양식 내려받기
        </Button>

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
                <div className="max-h-56 overflow-x-auto overflow-y-auto border-t border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-slate-500">
                      <tr className="border-b border-slate-100">
                        <th scope="col" className="px-3 py-1.5 text-left font-medium">이름</th>
                        <th scope="col" className="px-3 py-1.5 text-left font-medium">구분</th>
                        <th scope="col" className="px-3 py-1.5 text-left font-medium">연락처</th>
                        <th scope="col" className="px-3 py-1.5 text-left font-medium">지역</th>
                        <th scope="col" className="px-3 py-1.5 text-left font-medium">입금일</th>
                        <th scope="col" className="px-3 py-1.5 text-left font-medium">신청일</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.rows.map((row, index) => (
                        <tr key={`${row.name}-${index}`}>
                          <td className="whitespace-nowrap px-3 py-1.5 font-medium text-brand-900">
                            {row.name}
                          </td>
                          <td className="px-3 py-1.5 text-slate-600">{row.memberType || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                            {row.phone || "-"}
                          </td>
                          <td className="px-3 py-1.5 text-slate-600">{row.region || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                            {row.paidAt || "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                            {row.createdAt ? row.createdAt.slice(0, 10) : "올리는 날"}
                          </td>
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
