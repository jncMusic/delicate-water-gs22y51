import { useEffect, useState } from "react";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { putDoc } from "../../lib/store";
import { CONTENT, defaults, useBranches, useExecutives, useFees } from "../../lib/siteContent";
import { Button, Card, Input, SectionTitle, Textarea } from "../../components/ui";

/**
 * 협회 명단과 회비를 고치는 화면.
 *
 * 임원·지회장·지부장·회비는 사람이 바뀔 때마다 고쳐야 하는데, 그동안 코드에
 * 박혀 있어 개발자를 불러야 했다. 여기서 고치면 홈페이지에 바로 나간다.
 *
 * 한 덩어리씩 따로 담는다. 임원을 고치다 말고 화면을 닫아도 지회 명단이
 * 함께 날아가지 않는다.
 *
 * 고친 것을 담기 전까지는 홈페이지가 바뀌지 않는다. 그래서 칸을 채우는 동안
 * 잘못 눌러도 겁낼 것이 없고, 「담기」 를 눌러야 나간다.
 */

/** 줄 하나를 지우고 더하는 표. 칸 구성만 바꿔 여러 명단에 쓴다. */
function Rows({ rows, columns, onChange, addLabel, empty = "아직 없습니다." }) {
  const set = (index, key, value) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const remove = (index) => onChange(rows.filter((_, i) => i !== index));

  const add = () =>
    onChange([...rows, Object.fromEntries(columns.map((column) => [column.key, ""]))]);

  return (
    <div>
      {rows.length === 0 ? (
        <p className="py-3 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <li key={index} className="flex flex-wrap items-center gap-2">
              {columns.map((column) => (
                /* 너비는 감싸는 칸이 정한다. Input 에 w-full 이 이미 붙어 있어
                   여기서 w-36 을 얹으면 둘 중 어느 쪽이 이길지 알 수 없다. */
                <div key={column.key} className={column.wide ? "min-w-[12rem] flex-1" : "w-36"}>
                  <Input
                    value={row[column.key] ?? ""}
                    onChange={(event) => set(index, column.key, event.target.value)}
                    placeholder={column.label}
                    aria-label={`${index + 1}번째 ${column.label}`}
                    inputMode={column.number ? "numeric" : undefined}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`${index + 1}번째 줄 지우기`}
                className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button variant="secondary" onClick={add} className="mt-3">
        <Plus size={15} />
        {addLabel}
      </Button>
    </div>
  );
}

/**
 * 한 덩어리를 감싸는 칸. 고친 것이 있을 때만 「담기」가 살아난다.
 *
 * 「처음으로 되돌리기」 는 홈페이지가 품고 있는 값으로 돌린다. 잘못 고쳐 놓고
 * 무엇이 원래 값이었는지 잊었을 때 쓰라고 둔다. 이것도 담아야 반영된다.
 */
function Block({ id, title, description, children, draft, setDraft, dirty, markClean }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await putDoc(CONTENT, id, { ...draft, updatedAt: new Date().toISOString() });
      // 담고 나면 고친 표시를 내린다. 남겨 두면 담은 뒤에도 「담아야 나갑니다」
      // 가 붙어 있어, 담긴 것인지 아닌지 알 수 없다.
      markClean();
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error(err);
      window.alert("담지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-8">
      <SectionTitle description={description}>{title}</SectionTitle>
      <div className="mt-4">{children}</div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Button onClick={save} disabled={!dirty || busy}>
          <Save size={15} />
          {busy ? "담는 중..." : done ? "담았습니다" : "담기"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm("홈페이지가 품고 있는 처음 명단으로 되돌립니다. 그래도 될까요?")) {
              setDraft(structuredClone(defaults[id]));
            }
          }}
          disabled={busy}
        >
          <RotateCcw size={15} />
          처음으로 되돌리기
        </Button>
        {dirty ? (
          <span className="text-sm text-amber-700">고친 것이 있습니다. 담아야 나갑니다.</span>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * 저장소에서 온 값이 바뀌면 고치던 것이 없을 때만 새로 받는다.
 *
 * 값을 글자로 바꿔 견준다. 훅이 내주는 것은 그릴 때마다 새로 만든 객체라,
 * 객체 그대로 견주면 내용이 같아도 매번 「바뀌었다」가 되어 초안을 끝없이
 * 덮어쓴다. 실제로 그래서 고친 지회장 이름이 담기지 않았다.
 */
function useDraft(value) {
  const key = JSON.stringify(value);
  const [draft, setDraft] = useState(() => JSON.parse(key));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setDraft(JSON.parse(key));
  }, [key, dirty]);

  const change = (next) => {
    setDraft(next);
    setDirty(true);
  };

  return [draft, change, dirty, () => setDirty(false)];
}

export default function AdminOrg() {
  const executives = useExecutives();
  const { branches, chapters, totals } = useBranches();
  const fees = useFees();

  const [exec, setExec, execDirty, execClean] = useDraft(executives);
  const [branchDraft, setBranch, branchDirty, branchClean] = useDraft({ list: branches });
  const [chapterDraft, setChapter, chapterDirty, chapterClean] = useDraft({
    list: chapters,
    total: totals.chapters,
  });
  const [feeDraft, setFee, feeDirty, feeClean] = useDraft(fees);

  return (
    <div>
      <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
        여기서 고친 명단은 홈페이지에 바로 나갑니다. 다만 검색엔진이 읽는 쪽은 다음 배포까지
        예전 명단으로 남습니다. 사람이 보는 화면은 바로 바뀝니다.
      </p>

      <Block
        id="branches"
        title="지회장"
        description="시·도 지회와 지회장입니다. 지회장이 공석이면 이름을 비워 두세요."
        draft={branchDraft}
        setDraft={setBranch}
        dirty={branchDirty}
        markClean={branchClean}
      >
        <Rows
          rows={branchDraft.list || []}
          columns={[
            { key: "region", label: "지역" },
            { key: "head", label: "지회장" },
          ]}
          onChange={(list) => setBranch({ ...branchDraft, list })}
          addLabel="지회 더하기"
        />
      </Block>

      <Block
        id="chapters"
        title="지부장"
        description="시·군 지부와 지부장입니다. 소속 지회를 함께 적으면 화면과 지부장 확인서에 같이 나갑니다."
        draft={chapterDraft}
        setDraft={setChapter}
        dirty={chapterDirty}
        markClean={chapterClean}
      >
        <Rows
          rows={chapterDraft.list || []}
          columns={[
            { key: "region", label: "지역" },
            { key: "branch", label: "소속 지회" },
            { key: "head", label: "지부장" },
            { key: "note", label: "비고", wide: true },
          ]}
          onChange={(list) => setChapter({ ...chapterDraft, list })}
          addLabel="지부 더하기"
        />
        <label className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          협회가 집계한 지부 수
          <Input
            value={chapterDraft.total ?? ""}
            onChange={(event) =>
              setChapter({ ...chapterDraft, total: Number(event.target.value) || 0 })
            }
            inputMode="numeric"
            className="w-24"
          />
          <span className="text-xs text-slate-500">
            여기 적은 것보다 많으면 「몇 곳 가운데 몇 곳을 싣고 있다」고 알립니다.
          </span>
        </label>
      </Block>

      <Block
        id="executives"
        title="임원"
        description="이사장·감사 같은 개별 임원과, 이사·전문이사처럼 여럿을 묶어 적는 자리입니다."
        draft={exec}
        setDraft={setExec}
        dirty={execDirty}
        markClean={execClean}
      >
        <h4 className="text-sm font-semibold text-brand-900">임원</h4>
        <div className="mt-2">
          <Rows
            rows={exec.officers || []}
            columns={[
              { key: "role", label: "직위" },
              { key: "name", label: "성명" },
            ]}
            onChange={(officers) => setExec({ ...exec, officers })}
            addLabel="임원 더하기"
          />
        </div>

        <h4 className="mt-6 text-sm font-semibold text-brand-900">사무국</h4>
        <div className="mt-2">
          <Rows
            rows={exec.office || []}
            columns={[
              { key: "role", label: "직위" },
              { key: "name", label: "성명" },
            ]}
            onChange={(office) => setExec({ ...exec, office })}
            addLabel="사무국 더하기"
          />
        </div>

        <h4 className="mt-6 text-sm font-semibold text-brand-900">이사·전문이사·고문·자문위원</h4>
        <p className="mt-1 text-xs text-slate-500">
          성명은 쉼표로 나누어 적습니다. 줄바꿈으로 적으셔도 됩니다.
        </p>
        <ul className="mt-3 space-y-4">
          {(exec.groups || []).map((group, index) => (
            <li key={index} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-40">
                  <Input
                    value={group.name || ""}
                    onChange={(event) =>
                      setExec({
                        ...exec,
                        groups: exec.groups.map((row, i) =>
                          i === index ? { ...row, name: event.target.value } : row
                        ),
                      })
                    }
                    placeholder="묶음 이름"
                    aria-label={`${index + 1}번째 묶음 이름`}
                  />
                </div>
                <span className="text-sm text-slate-500">{(group.names || []).length}명</span>
                <button
                  type="button"
                  onClick={() =>
                    setExec({ ...exec, groups: exec.groups.filter((_, i) => i !== index) })
                  }
                  aria-label={`${group.name || index + 1} 묶음 지우기`}
                  className="ml-auto rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <Textarea
                value={(group.names || []).join(", ")}
                onChange={(event) =>
                  setExec({
                    ...exec,
                    groups: exec.groups.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            names: event.target.value
                              .split(/[,\n]/)
                              .map((name) => name.trim())
                              .filter(Boolean),
                          }
                        : row
                    ),
                  })
                }
                aria-label={`${group.name || index + 1} 명단`}
                rows={4}
                className="mt-3"
              />
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          onClick={() => setExec({ ...exec, groups: [...(exec.groups || []), { name: "", names: [] }] })}
          className="mt-3"
        >
          <Plus size={15} />
          묶음 더하기
        </Button>
      </Block>

      <Block
        id="fees"
        title="회비"
        description="직위별 연회비입니다. 일반회원 금액은 가입 화면에도 그대로 나갑니다."
        draft={feeDraft}
        setDraft={setFee}
        dirty={feeDirty}
        markClean={feeClean}
      >
        <Rows
          rows={feeDraft.rows || []}
          columns={[
            { key: "role", label: "직위" },
            { key: "amount", label: "금액", number: true },
          ]}
          onChange={(rows) =>
            setFee({
              ...feeDraft,
              // 금액은 숫자로 담는다. 글자로 담으면 화면에서 3,000원 꼴로 찍지 못한다.
              rows: rows.map((row) => ({ ...row, amount: Number(row.amount) || 0 })),
            })
          }
          addLabel="직위 더하기"
        />
        <label className="mt-4 block">
          <span className="text-sm text-slate-600">회비표 아래에 붙는 안내</span>
          <Textarea
            value={feeDraft.note || ""}
            onChange={(event) => setFee({ ...feeDraft, note: event.target.value })}
            rows={3}
            className="mt-1.5"
          />
        </label>
      </Block>
    </div>
  );
}
