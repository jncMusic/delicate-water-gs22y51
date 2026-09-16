import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ImagePlus, Lock, Pencil, Pin, Plus, Trash2, X } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import {
  createDoc,
  deleteFile,
  removeDoc,
  saveDoc,
  uploadFile,
  DEMO_MODE,
  DEMO_FILE_LIMIT,
} from "../../lib/store";
import { boardList } from "../../data/boards";
import { isImageFile } from "../../lib/fileType";
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
  formatBytes,
  formatDate,
} from "../../components/ui";

const emptyPost = (board) => ({
  title: "",
  category: board.categories[0],
  author: "사무국",
  body: "",
  pinned: false,
  images: [],
});

/** 공지사항·보도자료 등 모든 게시판을 한 화면에서 관리한다. */
export default function AdminBoards() {
  const [boardKey, setBoardKey] = useState(boardList[0].key);
  const board = boardList.find((item) => item.key === boardKey);
  const { rows, loading } = useCollection(board.collection);

  const [draft, setDraft] = useState(null);
  // 저장 버튼을 누를 때 한꺼번에 올린다. 작성을 취소하면 아무것도 남지 않는다.
  const [pending, setPending] = useState([]);
  // 수정하면서 뺀 그림. 저장에 성공한 뒤에 실제 파일을 지운다.
  const [dropped, setDropped] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // 아직 올리지 않은 파일의 미리보기 주소. 목록이 바뀌면 이전 주소를 반납한다.
  const previews = useMemo(() => pending.map((file) => URL.createObjectURL(file)), [pending]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  // 게시판을 바꾸면 열려 있던 작성창을 닫는다.
  useEffect(() => closeDraft(), [boardKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function closeDraft() {
    setDraft(null);
    setPending([]);
    setDropped([]);
    setError(null);
  }

  const set = (key) => (e) =>
    setDraft((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const addImages = (e) => {
    const picked = Array.from(e.target.files || []).filter((file) => {
      if (!isImageFile(file.name)) {
        setError(`${file.name} 은 그림 파일이 아닙니다. jpg·png·gif·webp 만 올릴 수 있습니다.`);
        return false;
      }
      return true;
    });
    if (picked.length > 0) setPending((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  /** 이미 올라가 있는 그림을 뺀다. 파일은 저장이 끝난 뒤에 지운다. */
  const dropImage = (image) => {
    setDraft((prev) => ({
      ...prev,
      images: (prev.images || []).filter((item) => item.url !== image.url),
    }));
    if (image.path) setDropped((prev) => [...prev, image.path]);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const uploaded = [];
      for (const file of pending) {
        const stored = await uploadFile(file, "resources");
        uploaded.push({ url: stored.url, name: stored.name, path: stored.path });
      }
      const images = [...(draft.images || []), ...uploaded];

      if (draft.id) {
        const { id, createdAt, ...patch } = draft;
        await saveDoc(board.collection, id, { ...patch, images });
      } else {
        await createDoc(board.collection, { ...draft, images, views: 0 });
      }
      await Promise.all(dropped.map((path) => deleteFile(path)));
      closeDraft();
    } catch (err) {
      console.error(err);
      setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`'${post.title}' 글을 삭제할까요?`)) return;
    await Promise.all((post.images || []).map((image) => deleteFile(image.path)));
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
                    <span className="flex items-center gap-2 font-medium text-brand-900">
                      {post.pinned && <Pin size={13} className="shrink-0 text-accent-600" />}
                      {post.images?.[0] && (
                        <img
                          src={post.images[0].thumb || post.images[0].url}
                          alt=""
                          loading="lazy"
                          className="h-9 w-7 shrink-0 rounded border border-slate-200 object-cover"
                        />
                      )}
                      {post.title}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-600">{post.author}</td>
                  <td className="px-3 py-3 text-center text-slate-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400">
                    {post.builtin ? "-" : post.views || 0}
                  </td>
                  <td className="px-3 py-3">
                    {post.builtin ? (
                      <span
                        className="flex items-center justify-center gap-1 text-xs text-slate-400"
                        title="홈페이지에 함께 들어 있는 글이라 관리자 화면에서는 고칠 수 없습니다."
                      >
                        <Lock size={12} />
                        기본 제공
                      </span>
                    ) : (
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePin(post)}
                          aria-label={post.pinned ? "상단 고정 해제" : "상단 고정"}
                          className={`rounded p-1.5 hover:bg-slate-100 ${
                            post.pinned ? "text-accent-600" : "text-slate-400"
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
                    )}
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
        onClose={closeDraft}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={closeDraft} disabled={saving}>취소</Button>
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

            <Field
              label="그림"
              hint={
                DEMO_MODE
                  ? `데모 모드에서는 ${formatBytes(DEMO_FILE_LIMIT)} 이하만 저장됩니다. Firebase를 연결하면 제한 없이 저장됩니다.`
                  : "포스터처럼 글과 함께 보여 줄 그림을 올립니다. 목록에는 첫 장이 작게 보입니다."
              }
            >
              <div className="rounded-lg border border-slate-300 p-3">
                {(draft.images?.length > 0 || pending.length > 0) && (
                  <ul className="mb-3 flex flex-wrap gap-3">
                    {(draft.images || []).map((image) => (
                      <li key={image.url} className="relative">
                        <img
                          src={image.thumb || image.url}
                          alt={image.name || ""}
                          className="h-28 w-20 rounded border border-slate-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => dropImage(image)}
                          aria-label={`${image.name || "그림"} 빼기`}
                          className="absolute -right-2 -top-2 rounded-full border border-slate-300 bg-white p-1 text-slate-500 shadow-sm hover:text-rose-600"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                    {pending.map((file, i) => (
                      <li key={`${file.name}-${file.lastModified}`} className="relative">
                        <img
                          src={previews[i]}
                          alt={file.name}
                          className="h-28 w-20 rounded border border-dashed border-accent-400 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPending((prev) => prev.filter((_, at) => at !== i))}
                          aria-label={`${file.name} 빼기`}
                          className="absolute -right-2 -top-2 rounded-full border border-slate-300 bg-white p-1 text-slate-500 shadow-sm hover:text-rose-600"
                        >
                          <X size={13} />
                        </button>
                        <span className="mt-1 block text-center text-[10px] text-accent-600">
                          저장 시 올림
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-brand-800 hover:bg-slate-50">
                  <ImagePlus size={15} />
                  그림 고르기
                  <input type="file" accept="image/*" multiple onChange={addImages} className="sr-only" />
                </label>
              </div>
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

            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
