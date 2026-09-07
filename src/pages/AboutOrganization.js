import { organization } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

function Node({ role, name, tone = "light" }) {
  const styles =
    tone === "dark"
      ? "bg-brand-800 text-white border-brand-800"
      : "bg-white text-brand-900 border-slate-300";
  return (
    <div className={`rounded-lg border px-6 py-3 text-center shadow-sm ${styles}`}>
      <p className="text-sm font-bold">{role}</p>
      <p className={`text-xs ${tone === "dark" ? "text-brand-200" : "text-slate-500"}`}>{name}</p>
    </div>
  );
}

export default function AboutOrganization() {
  return (
    <>
      <PageHeader subtitle="협회의 의사결정 구조와 부서별 담당 업무입니다." />
      <Container>
        <SectionTitle>조직 구성</SectionTitle>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-12">
          <div className="flex flex-col items-center">
            <Node role={organization.top.role} name={organization.top.name} tone="dark" />
            <span aria-hidden="true" className="h-8 w-0.5 bg-slate-300" />

            <div className="flex flex-wrap items-stretch justify-center gap-4">
              {organization.second.map((node) => (
                <Node key={node.role} role={node.role} name={node.name} />
              ))}
            </div>

            <span aria-hidden="true" className="h-8 w-0.5 bg-slate-300" />
            <Node role={organization.office.role} name={organization.office.name} tone="dark" />
            <span aria-hidden="true" className="h-8 w-0.5 bg-slate-300" />

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {organization.departments.map((dept) => (
                <div
                  key={dept.name}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center"
                >
                  <p className="text-sm font-bold text-brand-900">{dept.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <SectionTitle>부서별 담당 업무</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {organization.departments.map((dept) => (
              <Card key={dept.name}>
                <h3 className="font-serif text-lg font-bold text-brand-900">{dept.name}</h3>
                <ul className="mt-3 space-y-1.5">
                  {dept.duties.map((duty) => (
                    <li key={duty} className="flex gap-2 text-sm text-slate-600">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                      {duty}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
