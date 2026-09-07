import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { createDoc, removeDoc, saveDoc } from "../../lib/store";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Loading,
  Modal,
  Select,
} from "../../components/ui";

const CATEGORIES = ["총회", "대회", "연주회", "교육", "세미나", "기타"];
const EMPTY = { title: "", startDate: "", location: "", category: "대회" };

export default function AdminEvents() {
  const { rows, loading } = useCollection("events");
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    if (!draft.title.trim() || !draft.startDate) {
      setError("행사명과 일자를 입력해 주세요.");
      return;
    }
    setError(null);
    if (draft.id) {
      const { id, createdAt, ...patch } = draft;
      await saveDoc("events", id, patch);
    } else {
      await createDoc("events", draft);
    }
    setDraft(null);
  };

  const remove = async (event) => {
    if (!window.confirm(`'${event.title}' 일정을 삭제할까요?`)) return;
    await removeDoc("events", event.id);
  };

  if (loading) return <Loading />;

  const sorted = [...rows].sort((a, b) =>
    String(b.startDate).localeCompare(String(a.startDate))
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          전체 <strong className="text-brand-800">{rows.length}</strong>건
        </p>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus size={15} />
          일정 추가
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState message="등록된 일정이 없습니다." />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white px-5">
          {sorted.map((event) => (
            <li key={event.id} className="flex flex-wrap items-center gap-4 py-4">
              <span className="w-24 shrink-0 text-sm font-medium text-brand-800">
                {event.startDate}
              </span>
              <Badge>{event.category}</Badge>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-brand-900">{event.title}</span>
                <span className="block text-xs text-slate-500">{event.location || "장소 미정"}</span>
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDraft({ ...event })}
                  aria-label={`${event.title} 수정`}
                  className="rounded p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(event)}
                  aria-label={`${event.title} 삭제`}
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
        title={draft?.id ? "일정 수정" : "일정 추가"}
        onClose={() => setDraft(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>취소</Button>
            <Button onClick={save}>저장</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="행사명" required>
              <Input value={draft.title} onChange={set("title")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="일자" required>
                <Input type="date" value={draft.startDate} onChange={set("startDate")} />
              </Field>
              <Field label="분류">
                <Select value={draft.category} onChange={set("category")}>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="장소">
              <Input value={draft.location} onChange={set("location")} />
            </Field>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
