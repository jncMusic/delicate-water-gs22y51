import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "../lib/router";
import { createDoc } from "../lib/store";
import { instruments, memberTypes, regions } from "../data/site";
import {
  Button,
  Card,
  Container,
  Field,
  Input,
  PageHeader,
  SectionTitle,
  Select,
  Textarea,
} from "../components/ui";

const EMPTY = {
  name: "",
  memberType: "정회원",
  instrument: "플루트",
  affiliation: "",
  position: "",
  email: "",
  phone: "",
  region: "서울",
  note: "",
};

function validate(form) {
  if (!form.name.trim()) return "성명(또는 단체명)을 입력해 주세요.";
  if (!form.phone.trim()) return "연락처를 입력해 주세요.";
  if (!form.email.trim()) return "이메일을 입력해 주세요.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    return "이메일 형식이 올바르지 않습니다.";
  if (!form.agreed) return "개인정보 수집 및 이용에 동의해 주세요.";
  return null;
}

export default function MembersApply() {
  const [form, setForm] = useState({ ...EMPTY, agreed: false });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const submit = async () => {
    const message = validate(form);
    if (message) {
      setError(message);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { agreed, ...payload } = form;
      await createDoc("members", {
        ...payload,
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        status: "대기",
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <>
        <PageHeader title="가입 신청" breadcrumb={["회원안내", "가입 신청"]} />
        <Container>
          <Card className="mx-auto max-w-lg text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <h2 className="mt-4 font-serif text-xl font-bold text-brand-900">
              가입 신청이 접수되었습니다
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              사무국에서 신청 내용을 확인한 뒤 기재해 주신 연락처로 안내드리겠습니다.
              승인 이후 회비를 납부하시면 가입이 완료됩니다.
            </p>
            <div className="mt-7 flex justify-center gap-2">
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
                가입 안내 보기
              </Link>
            </div>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="가입 신청"
        subtitle="아래 항목을 작성해 주시면 사무국에서 확인 후 연락드립니다."
        breadcrumb={["회원안내", "가입 신청"]}
      />
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionTitle>신청서 작성</SectionTitle>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="성명 / 단체명" required>
              <Input value={form.name} onChange={set("name")} placeholder="홍길동" />
            </Field>
            <Field label="회원 구분" required>
              <Select value={form.memberType} onChange={set("memberType")}>
                {memberTypes.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="전공 / 담당 악기">
              <Select value={form.instrument} onChange={set("instrument")}>
                {instruments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="활동 지역">
              <Select value={form.region} onChange={set("region")}>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="소속">
              <Input
                value={form.affiliation}
                onChange={set("affiliation")}
                placeholder="○○예술고등학교 / ○○시립교향악단"
              />
            </Field>
            <Field label="직위 / 역할">
              <Input value={form.position} onChange={set("position")} placeholder="지도교사, 단원 등" />
            </Field>
            <Field label="연락처" required>
              <Input value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" />
            </Field>
            <Field label="이메일" required>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="name@example.com"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="남기실 말씀" hint="단체회원은 단원 수 등 간단한 소개를 적어 주세요.">
                <Textarea rows={4} value={form.note} onChange={set("note")} />
              </Field>
            </div>
          </div>

          <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-bold text-brand-900">개인정보 수집 및 이용 동의</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              협회는 회원 관리와 행사 안내를 위해 성명, 연락처, 이메일, 소속 정보를 수집하며
              회원 자격이 유지되는 동안 보관합니다. 동의를 거부하실 수 있으나 이 경우 가입 신청이
              제한됩니다.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-brand-900">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={set("agreed")}
                className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              />
              위 내용에 동의합니다.
            </label>
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-7 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setForm({ ...EMPTY, agreed: false })}>
              다시 작성
            </Button>
            <Button onClick={submit} disabled={saving} className="px-8">
              {saving ? "접수 중..." : "가입 신청"}
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
