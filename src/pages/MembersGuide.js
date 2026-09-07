import { Check, Wallet } from "lucide-react";
import { Link } from "../lib/router";
import { joinSteps, memberTypes, org } from "../data/site";
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

        <div className="mt-16 grid gap-6 rounded-xl border border-slate-200 bg-slate-50 p-8 sm:grid-cols-[1.5fr_1fr] sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-brand-900">
              <Wallet size={18} className="text-accent-600" />
              회비 납부 계좌
            </h2>
            <p className="mt-2 text-sm text-slate-700">{org.bank}</p>
            <p className="mt-1 text-xs text-slate-500">
              입금자명은 신청자 성함(단체는 단체명)으로 해 주시기 바랍니다. 문의 {org.phone}
            </p>
          </div>
          <Link
            to="/members/apply"
            className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800"
          >
            가입 신청하기
          </Link>
        </div>
      </Container>
    </>
  );
}
