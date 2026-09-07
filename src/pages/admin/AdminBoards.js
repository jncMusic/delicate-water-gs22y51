import { useEffect, useState } from "react";
import { Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { createDoc, removeDoc, saveDoc } from "../../lib/store";
import { boardList } from "../../data/boards";
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

const emptyPost = (board) => ({
  title: "",
  category: board.categories[0],
  author: "사무국",
  body: "",
  pinned: false,
});

/** 공지사항·보도자료 등 모든 게시판을 한 화면에서 관리한다. */
export default function AdminBoards() {
  const [boardKey, setBoardKey] = useState(boardList[0].key);
  const board = boardList.find((item) => item.key === boardKey);
  const { rows, loading } = useCollection(board.collection);

  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // 게시판을 바꾸면 열려 있던 작성창을 닫는다.
  useEffect(() => setDraft(null), [boardKey]);

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
        await saveDoc(board.collection, id, patch);
      } else {
        await createDoc(board.collection, { ...draft, views: 0 });
      }
      setDraft(null);
    } catch (err) {
      console.error(err);
      setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`'${post.title}' 글을 삭제할까요?`)) return;
    await removeDoc(board.collection, post.id);
  };

  const togglePin = (post) => saveDoc(board.collection, post.id, { pinned: !post.pinned });

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {boardList.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setBoardKey(item.key)}
            aria-current={item.key === boardKey ? "true" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              item.key === boardKey
                ? "border-brand-700 bg-brand-700 font-medium text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {board.label} 전체 <strong className="text-brand-800">{rows.length}</strong>건
        </p>
        <Button onClick={() => setDraft(emptyPost(board))}>
          <Plus size={15} />
          새 글 작성
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState message="등록된 글이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="w-24 px-3 py-3 font-medium">분류</th>
                <th scope="col" className="px-3 py-3 text-left font-medium">제목</th>
                <th scope="col" className="w-24 px-3 py-3 font-medium">작성</th>
                <th scope="col" className="w-28 px-3 py-3 font-medium">등록일</th>
                <th scope="col" className="w-20 px-3 py-3 font-medium">조회</th>
                <th scope="col" className="w-32 px-3 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-center">
                    <Badge>{post.category}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 font-medium text-brand-900">
                      {post.pinned && <Pin size={13} className="shrink-0 text-gold-600" />}
                      {post.title}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-600">{post.author}</td>
                  <td className="px-3 py-3 text-center text-slate-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400">{post.views || 0}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePin(post)}
                        aria-label={post.pinned ? "상단 고정 해제" : "상단 고정"}
                        className={`rounded p-1.5 hover:bg-slate-100 ${
                          post.pinned ? "text-gold-600" : "text-slate-400"
                        }`}
                      >
                        <Pin size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft({ ...post })}
                        aria-label="수정"
                        className="rounded p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(post)}
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
        title={`${board.label} — ${draft?.id ? "글 수정" : "새 글 작성"}`}
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
                  {board.categories.map((item) => (
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
