import { Check, FileText, HelpCircle, Wallet } from "lucide-react";
import { Link } from "../lib/router";
import {
  certificateProcess,
  certificates,
  feeGuide,
  joinSteps,
  memberFaq,
  memberTypes,
  org,
} from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

export default function MembersGuide() {
  return (
    <>
      <PageHeader subtitle="회원 구분과 가입 절차를 안내합니다." />
      <Container>
        <SectionTitle description="본인의 활동에 맞는 회원 구분을 선택해 신청하세요.">
          회원 구분
        </SectionTitle>
        <div className="grid gap-5 lg:grid-cols-3">
          {memberTypes.map((member) => (
            <Card key={member.type} className="flex flex-col">
              <h3 className="font-serif text-xl font-bold text-brand-900">{member.type}</h3>
              <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-slate-600">
                {member.target}
              </p>
              <p className="mt-4 border-y border-slate-100 py-3 text-lg font-bold text-accent-600">
                {member.fee}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {member.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2 text-sm text-slate-700">
                    <Check size={15} className="mt-0.5 shrink-0 text-brand-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <SectionTitle>가입 절차</SectionTitle>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {joinSteps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-bold text-brand-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16">
          <SectionTitle description={feeGuide.period}>회비 납부</SectionTitle>
          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <Card className="bg-slate-50">
              <h3 className="flex items-center gap-2 font-serif text-base font-bold text-brand-900">
                <Wallet size={17} className="text-accent-600" />
                납부 계좌
              </h3>
              <p className="mt-3 text-sm font-medium text-brand-900">
                {org.bank || "계좌는 사무국으로 문의해 주세요."}
              </p>
              <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
                {memberTypes.map((member) => (
                  <div key={member.type} className="flex justify-between gap-3">
                    <dt className="text-slate-600">{member.type}</dt>
                    <dd className="font-medium text-brand-900">{member.fee}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card>
              <ul className="space-y-3">
                {feeGuide.notes.map((note) => (
                  <li key={note} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                    />
                    {note}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                회비 관련 문의 {org.phone}{org.email && ` · ${org.email}`}
              </p>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <SectionTitle description="회원 자격이 유지되는 동안 아래 증명서를 발급받으실 수 있습니다.">
            증명서 발급
          </SectionTitle>
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
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
            <Card className="bg-slate-50">
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
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <SectionTitle>자주 묻는 질문</SectionTitle>
          <dl className="divide-y divide-slate-100 border-t-2 border-brand-800">
            {memberFaq.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="flex gap-2.5 font-medium text-brand-900">
                  <HelpCircle size={17} className="mt-0.5 shrink-0 text-accent-600" />
                  {item.q}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-slate-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-xl bg-brand-900 px-8 py-9 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">가입 신청은 온라인으로 받습니다</h2>
            <p className="mt-2 text-sm text-brand-200">
              작성에 5분이면 충분하며, 확인 후 사무국에서 연락드립니다.
            </p>
          </div>
          <Link
            to="/members/apply"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent-500 px-6 py-3 text-sm font-bold text-white hover:bg-accent-400"
          >
            가입 신청하기
          </Link>
        </div>
      </Container>
    </>
  );
}
