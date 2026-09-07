import { executives } from "../data/site";
import { Container, PageHeader, SectionTitle } from "../components/ui";

export default function AboutExecutives() {
  return (
    <>
      <PageHeader subtitle="협회 운영을 맡고 있는 임원진입니다." />
      <Container className="pt-10">
        <div className="space-y-12">
          {executives.map((block) => (
            <section key={block.group}>
              <SectionTitle>{block.group}</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {block.people.map((person) => (
                  <div
                    key={`${person.role}-${person.name}-${person.affiliation}`}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {person.role}
                    </span>
                    <p className="mt-3 font-serif text-lg font-bold text-brand-900">{person.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{person.affiliation}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
