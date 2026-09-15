import { executives } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

/** 직위와 성명이 하나씩 붙는 임원 카드. */
function OfficerCard({ role, name }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
        {role}
      </span>
      <p className="mt-3 font-serif text-lg font-bold text-brand-900">{name}</p>
    </div>
  );
}

export default function AboutExecutives() {
  return (
    <>
      <PageHeader subtitle="협회 임원 명단입니다." />
      <Container className="pt-10">
        <SectionTitle>임원</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {executives.officers.map((person) => (
            <OfficerCard key={person.role} {...person} />
          ))}
        </div>

        <div className="mt-14">
          <SectionTitle>사무국</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            {executives.office.map((person) => (
              <OfficerCard key={person.role} {...person} />
            ))}
          </div>
        </div>

        {/* 인원이 많은 직위는 카드 대신 이름만 나열한다. */}
        <div className="mt-14 space-y-8">
          {executives.groups.map((group) => (
            <Card key={group.name}>
              <div className="flex items-baseline gap-3">
                <h3 className="font-serif text-lg font-bold text-brand-900">{group.name}</h3>
                <span className="text-xs text-slate-500">{group.names.length}명</span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {group.names.map((name, index) => (
                  <li
                    key={`${group.name}-${name}-${index}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-500">
          가나다순이 아닌 협회 조직도 문서의 순서를 따랐습니다.
        </p>
      </Container>
    </>
  );
}
