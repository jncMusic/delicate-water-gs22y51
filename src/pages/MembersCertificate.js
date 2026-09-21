import { useState } from "react";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Link } from "../lib/router";
import { createDoc } from "../lib/store";
import {
  certificateProcess,
  certificateTypes,
  certificates,
  memberSideMenu,
  org,
} from "../data/site";
import { Button, Field, Input, SidebarPage, Select, Textarea } from "../components/ui";

const EMPTY = {
  name: "",
  phone: "",
  type: certificateTypes[0] || "",
  purpose: "",
  note: "",
  // 지도자 확인서에만 쓰는 칸. 다른 증명서를 고르면 보내지 않는다.
  teachingPlace: "",
  teachingPeriod: "",
  teachingRole: "",
};

/** 고른 증명서가 지도 활동을 적어야 하는 것인가. */
function needsTeaching(type) {
  return Boolean(certificates.find((item) => item.name === type)?.needsTeaching);
}

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

function Done({ form }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
        <h2 className="mt-5 font-serif text-xl font-bold text-brand-900">
          발급 신청이 접수되었습니다
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          사무국이 회원 명부와 대조해 자격을 확인한 뒤, 적어 주신 연락처로 안내드리겠습니다.
        </p>
      </div>

      <dl className="mt-7 divide-y divide-slate-100 border-y border-slate-100 text-sm">
        <div className="flex gap-4 py-3">
          <dt className="w-24 shrink-0 text-slate-500">증명서</dt>
          <dd className="font-medium text-brand-900">{form.type}</dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="w-24 shrink-0 text-slate-500">신청인</dt>
          <dd className="text-slate-700">{form.name}</dd>
        </div>
        <div className="flex gap-4 py-3">
          <dt className="w-24 shrink-0 text-slate-500">연락처</dt>
          <dd className="text-slate-700">{form.phone}</dd>
        </div>
      </dl>

      {/* 회원이 아니면 발급되지 않는다는 것을 미리 알린다. 기다리다 거절당하는
          것보다 지금 아는 편이 낫다. */}
      <p className="mt-4 flex gap-2.5 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
        <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
        <span>
          증명서는 회원 명부에서 확인되는 분께만 발급됩니다. 회비를 납부하지 않으셨거나 명부에
          없으시면 사무국에서 따로 연락드립니다.
        </span>
      </p>

      <p className="mt-4 text-center text-sm text-slate-500">
        문의 {org.phone}
        {org.email ? ` · ${org.email}` : ""}
      </p>

      <div className="mt-8 flex justify-center gap-2">
        <Link
          to="/"
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
        >
          홈으로
        </Link>
        <Link
          to="/members/guide"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-brand-800 hover:bg-slate-50"
        >
          회원 안내 보기
        </Link>
      </div>
    </div>
  );
}

export default function MembersCertificate() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return setError("성명을 입력해 주세요.");
    if (onlyDigits(form.phone).length < 9) return setError("연락처를 정확히 입력해 주세요.");
    if (!form.type) return setError("증명서 종류를 골라 주세요.");
    if (needsTeaching(form.type)) {
      if (!form.teachingPlace.trim()) return setError("지도 중인 단체나 학교를 적어 주세요.");
      if (!form.teachingPeriod.trim()) return setError("지도 기간을 적어 주세요.");
      if (!form.teachingRole.trim()) return setError("직위를 적어 주세요.");
    }

    setError(null);
    setSaving(true);
    try {
      await createDoc("certificateRequests", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        type: form.type,
        purpose: form.purpose.trim(),
        note: form.note.trim(),
        // 지도자 확인서가 아니면 빈 칸을 담지 않는다. 관리자 화면에서
        // "적혀 있는데 비었다" 와 "물어보지도 않았다" 가 구별되어야 한다.
        ...(needsTeaching(form.type)
          ? {
              teachingPlace: form.teachingPlace.trim(),
              teachingPeriod: form.teachingPeriod.trim(),
              teachingRole: form.teachingRole.trim(),
            }
          : {}),
        status: "접수",
      });
      setDone({ ...form });
    } catch (err) {
      console.error(err);
      setError("신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarPage
      menu={memberSideMenu}
      title="증명서 발급 신청"
      subtitle="회원 자격이 확인되는 분께 발급해 드립니다."
    >
      {done ? (
        <Done form={done} />
      ) : (
        <div className="mx-auto max-w-xl">
          <div className="grid gap-3 sm:grid-cols-2">
            {certificates.map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 font-bold text-brand-900">
                  <FileText size={15} className="text-accent-600" />
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.use}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <Field label="성명" required hint="회원 명부에 적힌 이름으로 적어 주세요.">
              <Input value={form.name} onChange={set("name")} placeholder="이름" />
            </Field>
            <Field label="연락처" required hint="명부와 대조하는 데 씁니다.">
              <Input
                value={form.phone}
                onChange={set("phone")}
                placeholder="010-0000-0000"
                inputMode="tel"
              />
            </Field>
            <Field label="증명서 종류" required>
              <Select value={form.type} onChange={set("type")}>
                {certificateTypes.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>
            {needsTeaching(form.type) ? (
              <div className="space-y-4 rounded-lg border border-accent-300 bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-700">
                  지도자 확인서는{" "}
                  <strong className="font-semibold text-brand-900">
                    연회비를 납부한 정회원
                  </strong>
                  께만 발급합니다. 아래 내용을 협회가 확인한 뒤 확인서에 적습니다.
                </p>
                <Field label="지도 중인 단체 / 학교" required>
                  <Input
                    value={form.teachingPlace}
                    onChange={set("teachingPlace")}
                    placeholder="예) ○○중학교 관악부"
                  />
                </Field>
                <Field label="지도 기간" required>
                  <Input
                    value={form.teachingPeriod}
                    onChange={set("teachingPeriod")}
                    placeholder="예) 2023년 3월 ~ 현재"
                  />
                </Field>
                <Field label="직위" required>
                  <Input
                    value={form.teachingRole}
                    onChange={set("teachingRole")}
                    placeholder="예) 지도교사 · 강사 · 지휘자"
                  />
                </Field>
              </div>
            ) : null}

            <Field label="제출처 / 용도" hint="어디에 내실 것인지 적어 주시면 처리가 빠릅니다.">
              <Input value={form.purpose} onChange={set("purpose")} placeholder="예) ○○중학교 제출" />
            </Field>
            <Field label="남기실 말씀">
              <Textarea rows={3} value={form.note} onChange={set("note")} />
            </Field>
          </div>

          {error ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-rose-600">
              <AlertCircle size={15} />
              {error}
            </p>
          ) : null}

          <Button onClick={submit} disabled={saving} className="mt-6 w-full py-3">
            {saving ? "접수하는 중..." : "발급 신청"}
          </Button>

          {certificateProcess.length > 0 ? (
            <div className="mt-10 rounded-lg bg-slate-50 p-5">
              <h3 className="font-serif text-base font-bold text-brand-900">발급 절차</h3>
              <ol className="mt-4 space-y-3">
                {certificateProcess.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-800 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      )}
    </SidebarPage>
  );
}
