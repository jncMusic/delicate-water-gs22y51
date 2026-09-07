import { org, overview } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

export default function AboutOverview() {
  return (
    <>
      <PageHeader subtitle={org.slogan} />
      <Container className="pt-10">
        <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 px-8 py-12 text-center text-white">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-accent-400">{org.nameEn}</p>
          <h2 className="mt-4 font-serif text-2xl font-bold leading-relaxed sm:text-3xl">
            {overview.purpose}
          </h2>
          <p className="mt-5 text-sm text-brand-100">— 정관 제2조 (목적)</p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle>협회 개요</SectionTitle>
            <dl className="divide-y divide-slate-100 border-t-2 border-brand-800">
              {overview.facts.map((fact) => (
                <div key={fact.label} className="flex gap-4 py-3.5">
                  <dt className="w-24 shrink-0 text-sm font-medium text-brand-800">{fact.label}</dt>
                  <dd className="text-sm text-slate-700">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <SectionTitle>주요 활동</SectionTitle>
            <Card>
              <ul className="space-y-3">
                {overview.activities.map((activity) => (
                  <li key={activity} className="flex gap-2.5 text-sm text-slate-700">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                    />
                    {activity}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {overview.plan && (
          <p className="mt-10 rounded-xl border border-accent-500/30 bg-accent-500/5 px-6 py-5 text-sm leading-relaxed text-brand-900">
            <strong className="font-bold">향후 계획</strong> — {overview.plan}
          </p>
        )}
      </Container>
    </>
  );
}
