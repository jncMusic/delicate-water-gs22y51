import { useState } from "react";
import { AlertCircle, Check, CheckCircle2, ShieldAlert } from "lucide-react";
import { Link } from "../lib/router";
import { createDoc } from "../lib/store";
import { useCollection } from "../lib/useCollection";
import {
  instruments,
  memberBenefits,
  memberSideMenu,
  memberTypes,
  org,
  regions,
} from "../data/site";
import {
  Button,
  Field,
  Input,
  SidebarPage,
  StepIndicator,
  Select,
  Textarea,
} from "../components/ui";

const STEPS = ["가입확인", "약관동의", "정보입력", "입력확인", "신청완료"];

const EMPTY = {
  name: "",
  birthDate: "",
  phone: "",
  memberType: "정회원",
  instrument: "플루트",
  affiliation: "",
  position: "",
  email: "",
  region: "서울",
  note: "",
  // 만 14세 미만이면 법정대리인(보호자) 동의를 함께 받는다.
  guardianName: "",
  guardianPhone: "",
  guardianRelation: "부",
};

const GUARDIAN_RELATIONS = ["부", "모", "조부모", "그 밖의 법정대리인"];

/** 오늘 기준 만 나이. 생년월일이 없으면 null. */
export function ageOf(birthDate) {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const passed =
    today.getMonth() > born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
  if (!passed) age -= 1;
  return age;
};

const onlyDigits = (value) => value.replace(/\D/g, "");

function ErrorText({ children }) {
  if (!children) return null;
  return (
    <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertCircle size={16} className="shrink-0" />
      {children}
    </p>
  );
}

/* ── 01 가입확인 ── */
function StepVerify({ form, set, members, onNext, error, setError }) {
  const verify = () => {
    if (!form.name.trim()) return setError("성명(또는 단체명)을 입력해 주세요.");
    if (!form.birthDate) return setError("생년월일을 입력해 주세요.");
    const age = ageOf(form.birthDate);
    if (age === null || age < 0 || age > 120) return setError("생년월일을 다시 확인해 주세요.");
    if (onlyDigits(form.phone).length < 9) return setError("연락처를 정확히 입력해 주세요.");

    const already = members.some(
      (m) =>
        m.name?.trim() === form.name.trim() &&
        onlyDigits(m.phone || "") === onlyDigits(form.phone)
    );
    if (already) {
      return setError("이미 접수된 신청이 있습니다. 진행 상황은 사무국으로 문의해 주세요.");
    }
    setError(null);
    onNext();
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="space-y-3">
        <Input
          value={form.name}
          onChange={set("name")}
          placeholder="이름을 입력해주세요"
          aria-label="성명 또는 단체명"
        />
        <Field label="생년월일" required hint="만 14세 미만은 법정대리인 동의가 필요해 확인합니다.">
          <Input type="date" value={form.birthDate} onChange={set("birthDate")} />
        </Field>
        <Input
          value={form.phone}
          onChange={set("phone")}
          placeholder="-을 제외한 핸드폰번호를 입력해주세요"
          aria-label="연락처"
        />
        <Button onClick={verify} className="w-full py-3">
          가입확인
        </Button>
      </div>

      <ErrorText>{error}</ErrorText>

      <div className="mt-8 rounded-lg bg-slate-50 p-5">
        <h3 className="text-sm font-bold text-brand-900">정회원 혜택</h3>
        <ul className="mt-3 space-y-2">
          {memberBenefits.map((benefit) => (
            <li key={benefit} className="flex gap-2 text-xs leading-relaxed text-slate-600">
              <Check size={13} className="mt-0.5 shrink-0 text-brand-600" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── 02 약관동의 ── */
function StepAgree({ form, set, agree, setAgree, onBack, onNext, error, setError }) {
  const age = ageOf(form.birthDate);
  const isMinor = age !== null && age < 14;
  const consented = agree.terms && agree.privacy;
  const guardianReady =
    !isMinor ||
    (agree.guardian && form.guardianName.trim() && onlyDigits(form.guardianPhone).length >= 9);

  const proceed = () => {
    if (!consented) return setError("필수 항목에 모두 동의해 주세요.");
    if (isMinor && !agree.guardian) return setError("법정대리인 동의에 체크해 주세요.");
    if (isMinor && !form.guardianName.trim())
      return setError("법정대리인 성명을 입력해 주세요.");
    if (isMinor && onlyDigits(form.guardianPhone).length < 9)
      return setError("법정대리인 연락처를 정확히 입력해 주세요.");
    setError(null);
    onNext();
  };

  const items = [
    {
      key: "terms",
      label: "서비스 이용약관 동의 (필수)",
      link: "/policy/terms",
      body: "홈페이지 이용 조건과 절차, 협회와 이용자의 권리·의무에 관한 내용입니다.",
    },
    {
      key: "privacy",
      label: "개인정보 수집 및 이용 동의 (필수)",
      link: "/policy/privacy",
      body: "성명, 생년월일, 연락처, 이메일, 소속 정보를 회원 관리와 행사 안내 목적으로 수집하며 회원 자격이 유지되는 동안 보관합니다.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <label className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-900">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) =>
            setAgree({ ...agree, terms: e.target.checked, privacy: e.target.checked })
          }
          className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
        />
        약관에 모두 동의합니다.
      </label>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.key} className="rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
                <input
                  type="checkbox"
                  checked={agree[item.key]}
                  onChange={(e) => setAgree({ ...agree, [item.key]: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                />
                {item.label}
              </label>
              <Link to={item.link} className="shrink-0 text-xs text-slate-500 hover:text-brand-700">
                전문 보기
              </Link>
            </div>
            <p className="mt-2.5 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-600">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      {/* 만 14세 미만은 법정대리인 동의를 함께 받아야 한다. */}
      {isMinor && (
        <div className="mt-4 rounded-lg border-2 border-accent-500/40 bg-accent-500/5 p-5">
          <h3 className="flex items-center gap-2 font-bold text-brand-900">
            <ShieldAlert size={17} className="text-accent-600" />
            법정대리인 동의 (만 14세 미만 필수)
          </h3>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
            만 {age}세로 확인되었습니다. 만 14세 미만 아동의 개인정보는 법정대리인의 동의를
            받아야 수집할 수 있습니다. 보호자 정보를 입력해 주시면 사무국에서 확인 연락을
            드릴 수 있습니다. 보호자 정보는 동의 확인 목적으로만 쓰입니다.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="법정대리인 성명" required>
              <Input value={form.guardianName} onChange={set("guardianName")} />
            </Field>
            <Field label="법정대리인 연락처" required>
              <Input
                value={form.guardianPhone}
                onChange={set("guardianPhone")}
                placeholder="010-0000-0000"
              />
            </Field>
            <Field label="관계">
              <Select value={form.guardianRelation} onChange={set("guardianRelation")}>
                {GUARDIAN_RELATIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
          </div>

          <label className="mt-4 flex items-start gap-2 text-sm font-medium text-brand-900">
            <input
              type="checkbox"
              checked={Boolean(agree.guardian)}
              onChange={(e) => setAgree({ ...agree, guardian: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
            />
            법정대리인으로서 위 아동의 개인정보 수집·이용에 동의합니다. (필수)
          </label>
        </div>
      )}

      <ErrorText>{error}</ErrorText>

      <div className="mt-7 flex justify-center gap-2">
        <Button variant="secondary" onClick={onBack}>이전</Button>
        <Button onClick={proceed} disabled={!consented || !guardianReady} className="px-10">
          다음
        </Button>
      </div>
    </div>
  );
}

/* ── 03 정보입력 ── */
function StepForm({ form, set, onBack, onNext, error, setError }) {
  const proceed = () => {
    if (!form.email.trim()) return setError("이메일을 입력해 주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("이메일 형식이 올바르지 않습니다.");
    setError(null);
    onNext();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="성명 / 단체명" required>
          <Input value={form.name} onChange={set("name")} />
        </Field>
        <Field label="연락처" required>
          <Input value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="회원 구분" required>
          <Select value={form.memberType} onChange={set("memberType")}>
            {memberTypes.map((item) => (
              <option key={item.type} value={item.type}>{item.type}</option>
            ))}
          </Select>
        </Field>
        <Field label="전공 / 담당 악기">
          <Select value={form.instrument} onChange={set("instrument")}>
            {instruments.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="이메일" required>
          <Input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="name@example.com"
          />
        </Field>
        <Field label="활동 지역">
          <Select value={form.region} onChange={set("region")}>
            {regions.map((item) => (
              <option key={item} value={item}>{item}</option>
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
        <div className="sm:col-span-2">
          <Field label="남기실 말씀" hint="단체회원은 단원 수 등 간단한 소개를 적어 주세요.">
            <Textarea rows={4} value={form.note} onChange={set("note")} />
          </Field>
        </div>
      </div>

      <ErrorText>{error}</ErrorText>

      <div className="mt-7 flex justify-center gap-2">
        <Button variant="secondary" onClick={onBack}>이전</Button>
        <Button onClick={proceed} className="px-10">다음</Button>
      </div>
    </div>
  );
}

/* ── 04 입력확인 ── */
function StepConfirm({ form, onBack, onSubmit, saving, error }) {
  const age = ageOf(form.birthDate);
  const isMinor = age !== null && age < 14;

  const rows = [
    ["성명 / 단체명", form.name],
    ["생년월일", form.birthDate ? `${form.birthDate} (만 ${age}세)` : "-"],
    ["회원 구분", form.memberType],
    ["연락처", form.phone],
    ["이메일", form.email],
    ["전공 / 담당 악기", form.instrument],
    ["활동 지역", form.region],
    ["소속", form.affiliation || "-"],
    ["직위 / 역할", form.position || "-"],
    ["남기실 말씀", form.note || "-"],
    ...(isMinor
      ? [
          ["법정대리인", `${form.guardianName} (${form.guardianRelation})`],
          ["법정대리인 연락처", form.guardianPhone],
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <dl className="divide-y divide-slate-100 border-t-2 border-brand-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4 py-3.5">
            <dt className="w-36 shrink-0 text-sm font-medium text-brand-800">{label}</dt>
            <dd className="min-w-0 break-words text-sm text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-center text-sm text-slate-500">
        입력하신 내용이 맞는지 확인한 뒤 신청을 완료해 주세요.
      </p>

      <ErrorText>{error}</ErrorText>

      <div className="mt-7 flex justify-center gap-2">
        <Button variant="secondary" onClick={onBack} disabled={saving}>수정하기</Button>
        <Button onClick={onSubmit} disabled={saving} className="px-10">
          {saving ? "접수 중..." : "가입 신청"}
        </Button>
      </div>
    </div>
  );
}

/* ── 05 신청완료 ── */
function StepDone() {
  return (
    <div className="mx-auto max-w-md text-center">
      <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
      <h2 className="mt-5 font-serif text-xl font-bold text-brand-900">
        가입 신청이 접수되었습니다
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        사무국에서 신청 내용을 확인한 뒤 기재해 주신 연락처로 안내드리겠습니다.
        승인 이후 안내드리는 계좌로 연회비를 납부하시면 가입이 완료됩니다.
      </p>
      <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-brand-900">
        {org.bank || `회비 문의 ${org.phone}`}
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

export default function MembersApply() {
  const { rows: members } = useCollection("members");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [agree, setAgree] = useState({ terms: false, privacy: false, guardian: false });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const go = (next) => {
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const age = ageOf(form.birthDate);
      const isMinor = age !== null && age < 14;
      await createDoc("members", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        isMinor,
        // 만 14세 이상이면 보호자 정보는 남기지 않는다.
        guardianName: isMinor ? form.guardianName.trim() : "",
        guardianPhone: isMinor ? form.guardianPhone.trim() : "",
        guardianRelation: isMinor ? form.guardianRelation : "",
        status: "대기",
      });
      go(5);
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
      title="정/준회원 가입신청"
      subtitle="아래 단계에 따라 신청서를 작성해 주세요."
    >
      <div className="mb-10">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      {step === 1 && (
        <StepVerify
          form={form}
          set={set}
          members={members}
          onNext={() => go(2)}
          error={error}
          setError={setError}
        />
      )}
      {step === 2 && (
        <StepAgree
          form={form}
          set={set}
          agree={agree}
          setAgree={setAgree}
          onBack={() => go(1)}
          onNext={() => go(3)}
          error={error}
          setError={setError}
        />
      )}
      {step === 3 && (
        <StepForm
          form={form}
          set={set}
          onBack={() => go(2)}
          onNext={() => go(4)}
          error={error}
          setError={setError}
        />
      )}
      {step === 4 && (
        <StepConfirm
          form={form}
          onBack={() => go(3)}
          onSubmit={submit}
          saving={saving}
          error={error}
        />
      )}
      {step === 5 && <StepDone />}
    </SidebarPage>
  );
}
