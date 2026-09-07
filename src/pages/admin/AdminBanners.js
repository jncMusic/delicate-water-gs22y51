import { useRef, useState } from "react";
import { AlertCircle, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
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
import { menus } from "../../data/site";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  formatBytes,
} from "../../components/ui";

const TONES = [
  { value: "blue", label: "파랑" },
  { value: "gold", label: "금색" },
  { value: "navy", label: "네이비" },
  { value: "rose", label: "붉은색" },
];

const EMPTY = {
  title: "",
  subtitle: "",
  caption: "",
  linkPath: "",
  tone: "navy",
  order: 1,
  image: null,
  imagePath: null,
};

/** 홈 상단 배너 관리. 이미지를 올리지 않으면 지정한 색으로 배경을 그린다. */
export default function AdminBanners() {
  const { rows, loading } = useCollection("banners");
  const [draft, setDraft] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);

  const linkOptions = menus.flatMap((menu) => menu.children);
  const sorted = [...rows].sort((a, b) => (a.order || 0) - (b.order || 0));

  const set = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  const open = (banner) => {
    setDraft(banner ? { ...banner } : { ...EMPTY, order: sorted.length + 1 });
    setFile(null);
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setError("배너 제목을 입력해 주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let payload = { ...draft, title: draft.title.trim(), order: Number(draft.order) || 1 };

      if (file) {
        const stored = await uploadFile(file, "banners");
        // 새 이미지를 올렸으면 이전 이미지는 지운다.
        if (draft.imagePath) await deleteFile(draft.imagePath);
        payload = { ...payload, image: stored.url, imagePath: stored.path };
      }

      if (payload.id) {
        const { id, createdAt, ...patch } = payload;
        await saveDoc("banners", id, patch);
      } else {
        await createDoc("banners", payload);
      }
      setDraft(null);
    } catch (err) {
      console.error(err);
      setError("저장에 실패했습니다. 이미지 크기와 네트워크 상태를 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (banner) => {
    if (!window.confirm(`'${banner.title}' 배너를 삭제할까요?`)) return;
    await deleteFile(banner.imagePath);
    await removeDoc("banners", banner.id);
  };

  if (loading) return <Loading />;

  return (
    <div>
      {DEMO_MODE && (
        <p className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          데모 모드에서는 배너 이미지가 브라우저에만 저장되며 {formatBytes(DEMO_FILE_LIMIT)} 이하만
          표시됩니다. Firebase를 연결하면 제한 없이 저장됩니다.
        </p>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          전체 <strong className="text-brand-800">{rows.length}</strong>개 · 순서가 작은 배너가 먼저
          나옵니다.
        </p>
        <Button onClick={() => open(null)}>
          <Plus size={15} />
          배너 추가
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="등록된 배너가 없습니다." />
      ) : (
        <ul className="space-y-3">
          {sorted.map((banner) => (
            <li
              key={banner.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded bg-brand-900 text-brand-300">
                {banner.image ? (
                  <img src={banner.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={20} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {banner.order}
                  </span>
                  <span className="font-medium text-brand-900">{banner.title}</span>
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">
                  {banner.subtitle || "부제 없음"}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  연결 {banner.linkPath || "없음"}
                </span>
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => open(banner)}
                  aria-label={`${banner.title} 수정`}
                  className="rounded p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(banner)}
                  aria-label={`${banner.title} 삭제`}
                  className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "배너 수정" : "배너 추가"}
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
            <Field label="제목" required hint="배너에 가장 크게 표시됩니다.">
              <Input value={draft.title} onChange={set("title")} />
            </Field>
            <Field label="부제">
              <Input
                value={draft.subtitle}
                onChange={set("subtitle")}
                placeholder="일시·장소 등 한 줄 안내"
              />
            </Field>
            <Field label="윗줄 문구">
              <Input
                value={draft.caption}
                onChange={set("caption")}
                placeholder="주최·주관 등 작은 글씨"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="연결할 페이지">
                <Select value={draft.linkPath} onChange={set("linkPath")}>
                  <option value="">연결 없음</option>
                  {linkOptions.map((item) => (
                    <option key={item.path} value={item.path}>{item.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="배경색" hint="이미지가 없을 때 쓰입니다.">
                <Select value={draft.tone} onChange={set("tone")}>
                  {TONES.map((tone) => (
                    <option key={tone.value} value={tone.value}>{tone.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="표시 순서">
                <Input type="number" min="1" value={draft.order} onChange={set("order")} />
              </Field>
            </div>
            <Field
              label="배경 이미지"
              hint={
                file
                  ? `${file.name} (${formatBytes(file.size)})`
                  : draft.image
                  ? "이미 등록된 이미지가 있습니다. 새 파일을 고르면 교체됩니다."
                  : "가로로 넓은 이미지(예: 1920×640)를 권장합니다."
              }
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:text-brand-700"
              />
            </Field>
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
