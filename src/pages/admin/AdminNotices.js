import { useState } from "react";
import { Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { createDoc, removeDoc, saveDoc } from "../../lib/store";
import { noticeCategories } from "../../data/site";
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

const EMPTY = {
  title: "",
  category: "공지",
  author: "사무국",
  body: "",
  pinned: false,
};

export default function AdminNotices() {
  const { rows, loading } = useCollection("notices");
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setDraft((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const save = async () => {
    if (!draft.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (draft.id) {
        const { id, createdAt, ...patch } = draft;
        await saveDoc("notices", id, patch);
      } else {
        await createDoc("notices", { ...draft, views: 0 });
      }
      setDraft(null);
    } catch (err) {
      console.error(err);
      setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (notice) => {
    if (!window.confirm(`'${notice.title}' 글을 삭제할까요?`)) return;
    await removeDoc("notices", notice.id);
  };

  const togglePin = (notice) => saveDoc("notices", notice.id, { pinned: !notice.pinned });

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          전체 <strong className="text-brand-800">{rows.length}</strong>건
        </p>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus size={15} />
          새 글 작성
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="등록된 공지가 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="w-20 px-3 py-3 font-medium">분류</th>
                <th scope="col" className="px-3 py-3 text-left font-medium">제목</th>
                <th scope="col" className="w-24 px-3 py-3 font-medium">작성</th>
                <th scope="col" className="w-28 px-3 py-3 font-medium">등록일</th>
                <th scope="col" className="w-20 px-3 py-3 font-medium">조회</th>
                <th scope="col" className="w-32 px-3 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((notice) => (
                <tr key={notice.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-center">
                    <Badge>{notice.category}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 font-medium text-brand-900">
                      {notice.pinned && <Pin size={13} className="text-gold-600" />}
                      {notice.title}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-600">{notice.author}</td>
                  <td className="px-3 py-3 text-center text-slate-500">
                    {formatDate(notice.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400">{notice.views || 0}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePin(notice)}
                        aria-label={notice.pinned ? "상단 고정 해제" : "상단 고정"}
                        className={`rounded p-1.5 hover:bg-slate-100 ${
                          notice.pinned ? "text-gold-600" : "text-slate-400"
                        }`}
                      >
                        <Pin size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft({ ...notice })}
                        aria-label="수정"
                        className="rounded p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(notice)}
                        aria-label="삭제"
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
        open={Boolean(draft)}
        title={draft?.id ? "공지 수정" : "새 공지 작성"}
        onClose={() => setDraft(null)}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>취소</Button>
            <Button onClick={save} disabled={saving}>{saving ? "저장 중..." : "저장"}</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="제목" required>
              <Input value={draft.title} onChange={set("title")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="분류">
                <Select value={draft.category} onChange={set("category")}>
                  {noticeCategories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="작성 부서">
                <Input value={draft.author} onChange={set("author")} />
              </Field>
            </div>
            <Field label="내용">
              <Textarea rows={12} value={draft.body} onChange={set("body")} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-brand-900">
              <input
                type="checkbox"
                checked={Boolean(draft.pinned)}
                onChange={set("pinned")}
                className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              />
              목록 상단에 고정
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
