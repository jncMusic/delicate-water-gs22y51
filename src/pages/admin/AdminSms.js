import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, Users } from "lucide-react";
import { useCollection } from "../../lib/useCollection";
import { smsTemplates } from "../../data/site";
import { SMS_LIMIT, digits, smsBytes, smsGroups } from "../../lib/members";
import { Button, EmptyState, Loading } from "../../components/ui";

/* 어느 문구가 어느 명단에 붙는지. 둘 다 id 로 맞춘다. */
const GROUP_OF = { unpaid: "unpaid", done: "done", duplicate: "duplicate" };

/*
 * 증명서 문구는 받는 사람이 회원 명부에서 나오지 않는다. 그때그때 발급된
 * 분에게 한 명씩 보내는 것이라, 명단과 번호는 증명서 신청 화면에서 가져온다.
 */
const NO_LIST = new Set(["certificate"]);

/**
 * 눌러서 복사. 브라우저가 막으면(https 가 아니거나 권한이 없으면) 조용히
 * 실패하므로, 그때는 직접 긁어 가실 수 있게 원문을 그대로 두고 알림만 띄운다.
 */
function CopyButton({ text, label, disabled }) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      window.alert("복사가 막혀 있습니다. 아래 내용을 직접 긁어서 복사해 주세요.");
    }
  };

  return (
    <Button variant="secondary" onClick={copy} disabled={disabled}>
      {done ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
      {done ? "복사했습니다" : label}
    </Button>
  );
}

function Card({ template, people }) {
  const bytes = smsBytes(template.body);
  const long = bytes > SMS_LIMIT;

  // 문자 서비스에 붙여 넣을 번호 목록. 중복은 한 번만.
  const numbers = useMemo(() => {
    const seen = new Set();
    for (const row of people || []) {
      const phone = digits(row.phone);
      if (phone.length >= 9) seen.add(phone);
    }
    return [...seen];
  }, [people]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-serif text-base font-bold text-brand-900">{template.label}</h3>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            long ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {long ? "장문(LMS)" : "단문(SMS)"} · {bytes}바이트
        </span>
        <span className="text-sm text-slate-500">{template.who}</span>
      </div>

      <pre className="mt-3 select-all whitespace-pre-wrap break-words rounded-lg bg-slate-50 px-4 py-3 font-sans text-sm leading-relaxed text-brand-900">
        {template.body}
      </pre>

      {long ? (
        <p className="mt-2 text-xs text-slate-500">
          {SMS_LIMIT}바이트(한글 {SMS_LIMIT / 2}자)를 넘어 장문으로 나갑니다. 요금이 올라가니
          줄이시려면 문구를 짧게 고쳐 주세요.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <Users size={15} className="text-slate-400" />
          {people ? (
            <>
              받는 사람 <strong className="font-semibold text-brand-900">{people.length}명</strong>
              {numbers.length !== people.length ? (
                <span className="text-xs text-slate-500">(번호 있는 분 {numbers.length}명)</span>
              ) : null}
            </>
          ) : (
            <span className="text-xs text-slate-500">
              증명서 신청 화면에서 발급된 분에게 한 명씩 보냅니다
            </span>
          )}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <CopyButton text={template.body} label="문구 복사" />
          {people ? (
            <CopyButton
              text={numbers.join("\n")}
              label={`번호 복사 (${numbers.length})`}
              disabled={numbers.length === 0}
            />
          ) : null}
        </div>
      </div>

      {template.vars.length > 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          치환 항목 {template.vars.map((v) => `#{${v}}`).join(" · ")} — 쓰시는 문자 서비스 양식에
          맞춰 바꿔 넣으세요. 업체에 따라 <code>${"{이름}"}</code> 처럼 표기가 다릅니다.
        </p>
      ) : null}
    </section>
  );
}

export default function AdminSms() {
  const { rows, loading } = useCollection("members");
  const groups = useMemo(() => smsGroups(rows), [rows]);

  if (loading) return <Loading label="회원 명단을 불러오는 중입니다..." />;

  return (
    <div>
      <div className="mb-5 flex gap-2.5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
        <MessageSquare size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-brand-900">홈페이지는 문자를 보내지 않습니다.</strong>{" "}
          아래 문구와 번호를 복사해 쓰시는 문자 서비스에 붙여 넣어 주세요. 가입 신청 화면에
          「완료되면 문자를 보내 드립니다」라고 안내하고 있어, 보내지 않으면 지키지 못한 약속이
          됩니다.
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="아직 등록된 회원이 없습니다." />
      ) : (
        <div className="space-y-4">
          {smsTemplates.map((template) => (
            <Card
              key={template.id}
              template={template}
              people={NO_LIST.has(template.id) ? null : groups[GROUP_OF[template.id]] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
