import { useRef, useState } from "react";
import { AlertCircle, Download, FileText, Trash2, Upload } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import {
  createDoc,
  deleteFile,
  removeDoc,
  uploadFile,
  DEMO_MODE,
  DEMO_FILE_LIMIT,
} from "../../lib/store";
import { resourceCategories } from "../../data/site";
import { downloadResource } from "../Resources";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Loading,
  Select,
  Textarea,
  formatBytes,
  formatDate,
} from "../../components/ui";

const EMPTY = { title: "", category: "협회서식", description: "", uploader: "사무국" };

export default function AdminResources() {
  const { rows, loading } = useCollection("resources");
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const reset = () => {
    setForm(EMPTY);
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async () => {
    if (!form.title.trim()) {
      setError("자료명을 입력해 주세요.");
      return;
    }
    if (!file) {
      setError("첨부파일을 선택해 주세요.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const stored = await uploadFile(file, "resources");
      await createDoc("resources", { ...form, title: form.title.trim(), file: stored, downloads: 0 });
      reset();
    } catch (err) {
      console.error(err);
      setError("업로드에 실패했습니다. 파일 크기와 네트워크 상태를 확인해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`'${item.title}' 자료를 삭제할까요?`)) return;
    await deleteFile(item.file?.path);
    await removeDoc("resources", item.id);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-brand-900">
          <Upload size={18} className="text-gold-600" />
          자료 업로드
        </h3>

        {DEMO_MODE && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            데모 모드에서는 파일이 브라우저에만 저장되며 {formatBytes(DEMO_FILE_LIMIT)} 이하만
            내려받을 수 있습니다. Firebase를 연결하면 제한 없이 저장됩니다.
          </p>
        )}

        <div className="mt-5 space-y-4">
          <Field label="자료명" required>
            <Input value={form.title} onChange={set("title")} placeholder="제18회 대회 요강" />
          </Field>
          <Field label="분류">
            <Select value={form.category} onChange={set("category")}>
              {resourceCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="설명">
            <Textarea rows={3} value={form.description} onChange={set("description")} />
          </Field>
          <Field label="등록 부서">
            <Input value={form.uploader} onChange={set("uploader")} />
          </Field>
          <Field label="첨부파일" required hint={file ? `${file.name} (${formatBytes(file.size)})` : undefined}>
            <input
              ref={fileInput}
              type="file"
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

          <div className="flex gap-2">
            <Button variant="secondary" onClick={reset} disabled={uploading}>초기화</Button>
            <Button onClick={submit} disabled={uploading} className="flex-1">
              {uploading ? "업로드 중..." : "업로드"}
            </Button>
          </div>
        </div>
      </Card>

      <div>
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState message="등록된 자료가 없습니다." />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white px-5">
            {rows.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{item.category}</Badge>
                    <h4 className="font-medium text-brand-900">{item.title}</h4>
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>{item.file?.name || "첨부 없음"}</span>
                    <span>{formatBytes(item.file?.size)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                    <span>다운로드 {item.downloads || 0}</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => downloadResource(item)}
                    aria-label={`${item.title} 내려받기`}
                    className="rounded p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={`${item.title} 삭제`}
                    className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
